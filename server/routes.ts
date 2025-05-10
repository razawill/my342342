import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { initializeBot, processMessage } from "./telegram-bot";
import { generateDogeAddress } from "./utils";
import {
  type WebSocketMessage,
  type GameStateMessage,
  type BetMessage,
  type CashoutMessage,
  type CrashMessage,
  insertUserSchema,
  insertBetSchema,
  insertGameSchema,
  insertTransactionSchema
} from "@shared/schema";
import { z } from "zod";

// Game state management
let activeGameId: number | undefined = undefined;
let currentMultiplier: number = 1.0;
let gameInterval: NodeJS.Timeout | undefined = undefined;
let countdownInterval: NodeJS.Timeout | undefined = undefined;
let countdownSeconds: number = 10;
let gameState: "waiting" | "active" | "crashed" = "waiting";

// WebSocket Server reference for global access
let globalWss: WebSocketServer;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store WebSocketServer reference globally
  globalWss = wss;
  
  // API routes
  app.get('/api/user', async (req, res) => {
    const telegramId = req.query.telegramId as string;
    
    if (!telegramId) {
      return res.status(400).json({ message: "Telegram ID is required" });
    }
    
    let user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  app.post('/api/user/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse({
        telegramId: req.body.telegramId,
        username: req.body.username,
        depositAddress: generateDogeAddress(),
      });
      
      const existingUser = await storage.getUserByTelegramId(userData.telegramId);
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/deposit', async (req, res) => {
    const { telegramId, amount } = req.body;
    
    if (!telegramId || !amount) {
      return res.status(400).json({ message: "Telegram ID and amount are required" });
    }
    
    // Minimum deposit amount
    const depositAmount = parseFloat(amount);
    if (depositAmount < 100) {
      return res.status(400).json({ message: "Minimum deposit amount is 100 DOGE" });
    }
    
    const user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      // Create transaction record
      const transaction = await storage.createTransaction(insertTransactionSchema.parse({
        userId: user.id,
        type: "deposit",
        amount: depositAmount,
        status: "completed",
      }));
      
      // Update user balance
      const updatedUser = await storage.updateUserBalance(user.id, depositAmount);
      
      res.json({ user: updatedUser, transaction });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/withdraw', async (req, res) => {
    const { telegramId, amount, address } = req.body;
    
    if (!telegramId || !amount || !address) {
      return res.status(400).json({ 
        message: "Telegram ID, amount, and address are required" 
      });
    }
    
    // Minimum withdrawal amount
    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount < 20) {
      return res.status(400).json({ message: "Minimum withdrawal amount is 20 DOGE" });
    }
    
    const user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.balance < withdrawalAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    
    try {
      // Create transaction record
      const transaction = await storage.createTransaction(insertTransactionSchema.parse({
        userId: user.id,
        type: "withdrawal",
        amount: -withdrawalAmount, // Negative for withdrawals
        status: "completed",
        txHash: `tx_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}` // Mock transaction hash
      }));
      
      // Update user balance
      const updatedUser = await storage.updateUserBalance(user.id, -withdrawalAmount);
      
      res.json({ user: updatedUser, transaction });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get('/api/transactions', async (req, res) => {
    const telegramId = req.query.telegramId as string;
    
    if (!telegramId) {
      return res.status(400).json({ message: "Telegram ID is required" });
    }
    
    const user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const transactions = await storage.getTransactionsByUserId(user.id);
    res.json(transactions);
  });
  
  // Test endpoint to add DOGE for testing
  app.post('/api/test/deposit', async (req, res) => {
    try {
      const { telegramId, amount } = req.body;
      
      if (!telegramId || !amount || isNaN(parseFloat(amount))) {
        return res.status(400).json({ message: "Invalid request parameters" });
      }
      
      const user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const depositAmount = parseFloat(amount);
      
      // Update user balance
      const updatedUser = await storage.updateUserBalance(user.id, depositAmount);
      
      // Create transaction record
      await storage.createTransaction(insertTransactionSchema.parse({
        userId: user.id,
        type: "deposit",
        amount: depositAmount,
        status: "completed",
      }));
      
      res.json({
        success: true,
        user: updatedUser,
        message: `Successfully added ${depositAmount} DOGE to user's balance`
      });
    } catch (error) {
      console.error('Error processing test deposit:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get('/api/history', async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const games = await storage.getRecentGames(limit);
    res.json(games);
  });
  
  // Telegram Bot webhook endpoint
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const update = req.body;
      
      // Handle incoming message
      if (update.message) {
        await processMessage(update.message);
      }
      
      res.status(200).end();
    } catch (error) {
      console.error('Error processing Telegram webhook:', error);
      res.status(500).end();
    }
  });
  
  // WebSocket handling
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send the current game state to the newly connected client
    sendGameState(ws);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'placeBet':
            await handleBet(data, ws);
            break;
          case 'cashout':
            await handleCashout(data, ws);
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  
  // Start game loop
  initializeGameLoop(wss);
  
  // Initialize test user with Dogecoin on startup
  initializeTestUser();
  
  // Initialize Telegram bot with the correct host
  // When deployed to Railway, use Railway's URL; otherwise use Replit's URL
  const hostUrl = process.env.RAILWAY_STATIC_URL || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000";
  initializeBot(hostUrl).then(success => {
    if (success) {
      console.log('Telegram bot initialized successfully');
      console.log(`Using host URL: ${hostUrl}`);
    } else {
      console.error('Failed to initialize Telegram bot');
    }
  });
  
  return httpServer;
}

// Initialize game loop
async function initializeGameLoop(wss: WebSocketServer) {
  // Create the first game
  startNewGame(wss);
}

// Start a new game with countdown
async function startNewGame(wss: WebSocketServer) {
  gameState = "waiting";
  currentMultiplier = 1.0;
  countdownSeconds = 10; // Fixed 10 second betting window as per requirements
  
  // Create new game in DB
  // Random crash point, weighted towards lower values but can go very high rarely
  let crashPoint;
  const r = Math.random();
  
  if (r < 0.02) { // 2% chance for very high multiplier (10x-100x)
    crashPoint = 10 + Math.random() * 90;
  } else if (r < 0.15) { // 13% chance for high multiplier (5x-10x)
    crashPoint = 5 + Math.random() * 5;
  } else if (r < 0.5) { // 35% chance for medium multiplier (2x-5x)
    crashPoint = 2 + Math.random() * 3;
  } else { // 50% chance for low multiplier (1x-2x)
    crashPoint = 1 + Math.random();
  }
  
  // Round to 2 decimal places
  crashPoint = Math.round(crashPoint * 100) / 100;
  
  const newGame = await storage.createGame(insertGameSchema.parse({
    crashPoint,
    status: "waiting"
  }));
  
  activeGameId = newGame.id;
  
  // Broadcast game state to all clients
  broadcastMessage(wss, {
    type: 'gameState',
    state: 'waiting',
    gameId: activeGameId,
    countdown: countdownSeconds
  });
  
  // Start countdown
  countdownInterval = setInterval(() => {
    countdownSeconds--;
    
    broadcastMessage(wss, {
      type: 'gameState',
      state: 'waiting',
      gameId: activeGameId,
      countdown: countdownSeconds
    });
    
    if (countdownSeconds <= 0) {
      clearInterval(countdownInterval);
      startActiveGame(wss, newGame);
    }
  }, 1000);
}

// Start the active game phase
async function startActiveGame(wss: WebSocketServer, game: any) {
  if (!activeGameId) return;
  
  await storage.updateGameStatus(activeGameId, "active");
  gameState = "active";
  currentMultiplier = 1.0;
  
  // Broadcast game started
  broadcastMessage(wss, {
    type: 'gameState',
    state: 'active',
    gameId: activeGameId,
    multiplier: currentMultiplier
  });
  
  // Get total bets for this game
  updatePlayerStats(wss);
  
  let gameSpeed = 100; // ms
  const maxMultiplier = game.crashPoint;
  
  // Game loop function to handle multiplier updates
  const updateGame = async () => {
    // Increase multiplier with dynamic increment
    const increment = 0.01 * (1 / Math.pow(currentMultiplier, 0.3));
    currentMultiplier += increment;
    
    // Round to 2 decimal places for display
    currentMultiplier = Math.round(currentMultiplier * 100) / 100;
    
    // Broadcast current multiplier
    broadcastMessage(wss, {
      type: 'gameState',
      state: 'active',
      gameId: activeGameId,
      multiplier: currentMultiplier
    });
    
    // No auto-cashouts - players must manually cash out
    
    // Check if game should crash
    if (currentMultiplier >= maxMultiplier) {
      clearInterval(gameInterval);
      gameCrashed(wss);
      return;
    }
    
    // Dynamic speed adjustment
    if (currentMultiplier > 5 && gameSpeed > 30) {
      gameSpeed = 30;
      clearInterval(gameInterval);
      gameInterval = setInterval(updateGame, gameSpeed);
    } else if (currentMultiplier > 2 && gameSpeed > 50) {
      gameSpeed = 50;
      clearInterval(gameInterval);
      gameInterval = setInterval(updateGame, gameSpeed);
    }
  };
  
  // Start the game interval
  gameInterval = setInterval(updateGame, gameSpeed);
}

// Handle game crash
async function gameCrashed(wss: WebSocketServer) {
  if (!activeGameId) return;
  
  gameState = "crashed";
  
  // Update game status
  const game = await storage.updateGameStatus(activeGameId, "crashed");
  
  if (!game) return;
  
  // Mark all active bets as lost
  await storage.updateBetsStatusForGame(activeGameId, "lost");
  
  // Broadcast crash to all clients
  broadcastMessage(wss, {
    type: 'crash',
    gameId: activeGameId,
    crashPoint: game.crashPoint
  });
  
  // Send final leaderboard for this game
  await updateLeaderboard(wss);
  
  // Wait 3 seconds before starting a new game
  setTimeout(() => {
    startNewGame(wss);
  }, 3000);
}

// Handle bet placement
async function handleBet(data: any, ws: WebSocket) {
  if (gameState !== "waiting" || !activeGameId) {
    return sendErrorToClient(ws, "Betting is closed for this game");
  }
  
  const { telegramId, amount } = data;
  
  if (!telegramId || !amount) {
    return sendErrorToClient(ws, "Telegram ID and amount are required");
  }
  
  // Validate minimum bet amount (1 DOGE)
  if (amount < 1) {
    return sendErrorToClient(ws, "Minimum bet amount is 1 DOGE");
  }
  
  // Find user
  const user = await storage.getUserByTelegramId(telegramId);
  
  if (!user) {
    return sendErrorToClient(ws, "User not found");
  }
  
  // Check balance
  if (user.balance < amount) {
    return sendErrorToClient(ws, "Insufficient balance");
  }
  
  try {
    // Check if user already has a bet in this game
    const existingBet = await storage.getBetByUserAndGame(user.id, activeGameId);
    
    if (existingBet) {
      return sendErrorToClient(ws, "You already have a bet in this game");
    }
    
    // Create bet - no auto cashout, players must cash out manually
    const bet = await storage.createBet(insertBetSchema.parse({
      userId: user.id,
      gameId: activeGameId,
      amount,
      autoCashoutAt: null, // No auto cashout
    }));
    
    // Update user balance
    await storage.updateUserBalance(user.id, -amount);
    
    // Create transaction
    await storage.createTransaction(insertTransactionSchema.parse({
      userId: user.id,
      type: "bet",
      amount: -amount,
      status: "completed",
    }));
    
    // Broadcast bet to all clients
    broadcastMessage(globalWss, {
      type: 'bet',
      userId: user.id,
      telegramId: user.telegramId,
      username: user.username,
      amount,
      gameId: activeGameId
    });
    
    // Update player stats
    updatePlayerStats(globalWss);
    
  } catch (error) {
    console.error('Error placing bet:', error);
    sendErrorToClient(ws, "Error placing bet");
  }
}

// Handle cashout
async function handleCashout(data: any, ws: WebSocket) {
  if (gameState !== "active" || !activeGameId) {
    return sendErrorToClient(ws, "Game is not active");
  }
  
  const { telegramId } = data;
  
  if (!telegramId) {
    return sendErrorToClient(ws, "Telegram ID is required");
  }
  
  // Find user
  const user = await storage.getUserByTelegramId(telegramId);
  
  if (!user) {
    return sendErrorToClient(ws, "User not found");
  }
  
  try {
    // Process the cashout
    await processCashout(user.id, activeGameId, globalWss);
  } catch (error) {
    console.error('Error processing cashout:', error);
    sendErrorToClient(ws, "Error processing cashout");
  }
}

// Process manual cashout logic
async function processCashout(userId: number, gameId: number, wss: WebSocketServer) {
  // Get the user's bet
  const bet = await storage.getBetByUserAndGame(userId, gameId);
  
  if (!bet || bet.status !== "active") {
    return; // No active bet found
  }
  
  // Calculate winnings
  const winMultiplier = currentMultiplier;
  const winAmount = bet.amount * winMultiplier;
  const profit = winAmount - bet.amount;
  
  // Update bet with cashout info
  await storage.updateBetCashout(bet.id, winMultiplier, profit);
  
  // Update user balance with winnings
  const user = await storage.getUser(userId);
  if (!user) return;
  
  await storage.updateUserBalance(userId, winAmount);
  
  // Create transaction
  await storage.createTransaction(insertTransactionSchema.parse({
    userId,
    type: "win",
    amount: winAmount,
    status: "completed",
  }));
  
  // Broadcast cashout to all clients
  broadcastMessage(wss, {
    type: 'cashout',
    userId,
    telegramId: user.telegramId,
    username: user.username,
    multiplier: winMultiplier,
    amount: bet.amount,
    profit
  });
}

// Update player stats
async function updatePlayerStats(wss: WebSocketServer) {
  if (!activeGameId) return;
  
  const bets = await storage.getBetsByGameId(activeGameId);
  const totalBets = bets.reduce((sum, bet) => sum + bet.amount, 0);
  
  broadcastMessage(wss, {
    type: 'playerUpdate',
    count: bets.length,
    totalBets
  });
  
  // Send leaderboard update
  await updateLeaderboard(wss);
}

// Update and broadcast leaderboard
async function updateLeaderboard(wss: WebSocketServer) {
  if (!activeGameId) return;
  
  try {
    const bets = await storage.getBetsByGameId(activeGameId);
    
    // Get user details for each bet
    const betsWithUsers = await Promise.all(
      bets.map(async (bet) => {
        const user = await storage.getUser(bet.userId);
        if (!user) return null;
        
        return {
          ...bet,
          username: user.username,
          telegramId: user.telegramId
        };
      })
    );
    
    // Filter out nulls and sort by bet amount (highest first)
    const validBets = betsWithUsers
      .filter(bet => bet !== null)
      .sort((a, b) => b!.amount - a!.amount);
    
    // Take top 10 bets
    const topBets = validBets.slice(0, 10).map(bet => ({
      username: bet!.username,
      telegramId: bet!.telegramId,
      amount: bet!.amount,
      multiplier: bet!.cashoutAt,
      profit: bet!.profit,
      status: bet!.status
    }));
    
    // Broadcast leaderboard
    broadcastMessage(wss, {
      type: 'leaderboard',
      topBets
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

// Send game state to a client
function sendGameState(ws: WebSocket) {
  const gameStateMsg: GameStateMessage = {
    type: 'gameState',
    state: gameState,
    gameId: activeGameId || undefined,
    countdown: gameState === 'waiting' ? countdownSeconds : undefined,
    multiplier: gameState === 'active' ? currentMultiplier : undefined
  };
  
  ws.send(JSON.stringify(gameStateMsg));
}

// Send error to client
function sendErrorToClient(ws: WebSocket, message: string) {
  ws.send(JSON.stringify({ type: 'error', message }));
}

// Broadcast message to all connected clients
function broadcastMessage(wss: WebSocketServer, message: WebSocketMessage) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Initialize test user with Dogecoin
async function initializeTestUser() {
  try {
    // Fixed test user
    const telegramId = "123456789";
    const username = "mock_user";
    const initialBalance = 5000; // Start with 5000 DOGE
    
    let user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      // Create user if not exists
      user = await storage.createUser(insertUserSchema.parse({
        telegramId,
        username,
        depositAddress: generateDogeAddress(),
      }));
      
      console.log(`Created test user: ${username} with ID ${user.id}`);
    }
    
    // Update balance to initial amount
    const updatedUser = await storage.updateUserBalance(user.id, initialBalance - (user.balance || 0));
    
    console.log(`Initialized test user with ${initialBalance} DOGE:`, updatedUser);
  } catch (error) {
    console.error("Error initializing test user:", error);
  }
}
