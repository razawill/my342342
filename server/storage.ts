import {
  users, games, bets, transactions,
  type User, type Game, type Bet, type Transaction,
  type InsertUser, type InsertGame, type InsertBet, type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<User | undefined>;
  
  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getActiveGame(): Promise<Game | undefined>;
  getGameById(id: number): Promise<Game | undefined>;
  updateGameStatus(gameId: number, status: string): Promise<Game | undefined>;
  getRecentGames(limit: number): Promise<Game[]>;
  
  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getBetsByGameId(gameId: number): Promise<Bet[]>;
  getBetsByUserId(userId: number): Promise<Bet[]>;
  getBetByUserAndGame(userId: number, gameId: number): Promise<Bet | undefined>;
  updateBetCashout(betId: number, cashoutAt: number, profit: number): Promise<Bet | undefined>;
  updateBetsStatusForGame(gameId: number, status: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: number, status: string): Promise<Transaction | undefined>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBalance(userId: number, amount: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ balance: user.balance + amount })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Game operations
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async getActiveGame(): Promise<Game | undefined> {
    const [game] = await db
      .select()
      .from(games)
      .where(
        or(
          eq(games.status, "active"),
          eq(games.status, "waiting")
        )
      );
    
    return game;
  }

  async getGameById(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async updateGameStatus(gameId: number, status: string): Promise<Game | undefined> {
    const updateData: any = { status };
    
    if (status === "crashed") {
      updateData.endedAt = new Date();
    }
    
    const [updatedGame] = await db
      .update(games)
      .set(updateData)
      .where(eq(games.id, gameId))
      .returning();
    
    return updatedGame;
  }

  async getRecentGames(limit: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .orderBy(desc(games.startedAt))
      .limit(limit);
  }

  // Bet operations
  async createBet(insertBet: InsertBet): Promise<Bet> {
    const [bet] = await db.insert(bets).values(insertBet).returning();
    return bet;
  }

  async getBetsByGameId(gameId: number): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.gameId, gameId));
  }

  async getBetsByUserId(userId: number): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.userId, userId));
  }

  async getBetByUserAndGame(userId: number, gameId: number): Promise<Bet | undefined> {
    const [bet] = await db
      .select()
      .from(bets)
      .where(
        and(
          eq(bets.userId, userId),
          eq(bets.gameId, gameId)
        )
      );
    
    return bet;
  }

  async updateBetCashout(betId: number, cashoutAt: number, profit: number): Promise<Bet | undefined> {
    const [updatedBet] = await db
      .update(bets)
      .set({
        cashoutAt,
        profit,
        status: "won"
      })
      .where(eq(bets.id, betId))
      .returning();
    
    return updatedBet;
  }

  async updateBetsStatusForGame(gameId: number, status: string): Promise<void> {
    await db
      .update(bets)
      .set({ status })
      .where(
        and(
          eq(bets.gameId, gameId),
          eq(bets.status, "active")
        )
      );
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        completedAt: insertTransaction.status === "completed" ? new Date() : null
      })
      .returning();
    
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(transactionId: number, status: string): Promise<Transaction | undefined> {
    const updateData: any = { status };
    
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    
    const [updatedTransaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, transactionId))
      .returning();
    
    return updatedTransaction;
  }
}

// Use DatabaseStorage for persistent storage
export const storage = new DatabaseStorage();
