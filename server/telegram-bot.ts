import axios from 'axios';
import { storage } from './storage';
import { insertUserSchema } from '@shared/schema';
import { generateDogeAddress } from './utils';

// Telegram Bot API
const TELEGRAM_API = 'https://api.telegram.org/bot';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN environment variable is not set!');
}

// Helper to get base URL for the bot API
const getApiUrl = (method: string) => {
  console.log(`Using API URL: ${TELEGRAM_API}${BOT_TOKEN}/${method}`);
  return `${TELEGRAM_API}${BOT_TOKEN}/${method}`;
};

// Initialize Web App URL
let webAppUrl = '';

// Initialize the bot and set commands
export async function initializeBot(host: string) {
  try {
    // Make sure the host doesn't already include http/https protocol
    const cleanHost = host.replace(/^https?:\/\//, '');
    
    // Set the web app URL based on the host
    webAppUrl = `https://${cleanHost}`;
    console.log(`Web App URL set to: ${webAppUrl}`);

    // Set bot commands
    await setCommands();
    
    // Set webhook
    await setWebhook(cleanHost);
    
    // Get bot info for verification
    const botInfo = await getBotInfo();
    console.log('Bot initialized:', botInfo?.first_name);
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Telegram bot:', error);
    return false;
  }
}

// Set webhook for the bot
async function setWebhook(host: string) {
  try {
    // Make sure the host doesn't already include http/https protocol
    const cleanHost = host.replace(/^https?:\/\//, '');
    const webhookUrl = `https://${cleanHost}/api/telegram/webhook`;
    console.log(`Setting webhook to: ${webhookUrl}`);
    
    const response = await axios.post(getApiUrl('setWebhook'), {
      url: webhookUrl,
      drop_pending_updates: true
    });
    
    if (response.data.ok) {
      console.log('Webhook set successfully');
    } else {
      console.error('Failed to set webhook:', response.data);
    }
    
    // Get webhook info to verify
    const webhookInfo = await axios.get(getApiUrl('getWebhookInfo'));
    console.log('Webhook info:', webhookInfo.data.result);
    
    return webhookInfo.data.result;
  } catch (error) {
    console.error('Error setting webhook:', error);
    return null;
  }
}

// Set bot commands
async function setCommands() {
  try {
    const commands = [
      { command: 'start', description: 'Start the bot' },
      { command: 'play', description: 'Launch the crash betting game' },
      { command: 'deposit', description: 'Make a deposit' },
      { command: 'withdraw', description: 'Withdraw your Dogecoin' },
      { command: 'balance', description: 'Check your balance' },
      { command: 'help', description: 'Get help' }
    ];
    
    await axios.post(getApiUrl('setMyCommands'), {
      commands: commands
    });
    
    console.log('Bot commands set successfully');
  } catch (error) {
    console.error('Error setting bot commands:', error);
  }
}

// Get bot information
async function getBotInfo() {
  try {
    const response = await axios.get(getApiUrl('getMe'));
    return response.data.result;
  } catch (error) {
    console.error('Error getting bot info:', error);
    return null;
  }
}

// Process incoming message
export async function processMessage(message: any) {
  try {
    const chatId = message.chat.id;
    const text = message.text;
    const user = message.from;
    
    if (!text) return;
    
    // First, ensure user is registered
    await ensureUserRegistered(user);
    
    // Handle commands
    if (text.startsWith('/start')) {
      await handleStartCommand(chatId, user);
    } else if (text.startsWith('/play')) {
      await handlePlayCommand(chatId, user);
    } else if (text.startsWith('/deposit')) {
      await handleDepositCommand(chatId, user);
    } else if (text.startsWith('/withdraw')) {
      await handleWithdrawCommand(chatId, user);
    } else if (text.startsWith('/balance')) {
      await handleBalanceCommand(chatId, user);
    } else if (text.startsWith('/help')) {
      await handleHelpCommand(chatId);
    } else {
      // Handle regular messages
      await sendMessage(chatId, 'Use /play to start the crash betting game!');
    }
    
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

// Ensure user is registered in our database
async function ensureUserRegistered(telegramUser: any) {
  try {
    const telegramId = telegramUser.id.toString();
    let user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      // User does not exist, register them
      const username = telegramUser.username || 
                     `${telegramUser.first_name || ''}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`;
      
      user = await storage.createUser(insertUserSchema.parse({
        telegramId,
        username,
        depositAddress: generateDogeAddress(),
      }));
      
      console.log(`Registered new user: ${username} (${telegramId})`);
    }
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

// Handle /start command
async function handleStartCommand(chatId: number, user: any) {
  const message = `
Hello ${user.first_name}! 👋

Welcome to the Dogecoin Crash Betting Game! 🚀🐕

Here's how to play:
1. Place a bet using DOGE
2. Watch as the multiplier increases
3. Cash out before it crashes to win!

Use /play to start the game!
  `;
  
  await sendMessage(chatId, message);
}

// Handle /play command - Launch web app
async function handlePlayCommand(chatId: number, user: any) {
  try {
    // Create an inline keyboard with a web app button
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🚀 Launch Crash Game",
            web_app: { url: webAppUrl }
          }
        ]
      ]
    };
    
    const message = "Click the button below to play the crash betting game! 🎮";
    
    await axios.post(getApiUrl('sendMessage'), {
      chat_id: chatId,
      text: message,
      reply_markup: keyboard
    });
    
  } catch (error) {
    console.error('Error handling play command:', error);
    await sendMessage(chatId, "Sorry, there was an error launching the game. Please try again.");
  }
}

// Handle /deposit command
async function handleDepositCommand(chatId: number, user: any) {
  try {
    const telegramId = user.id.toString();
    const dbUser = await storage.getUserByTelegramId(telegramId);
    
    if (!dbUser) {
      return sendMessage(chatId, "Your account is not set up. Please use /start first.");
    }
    
    const message = `
To deposit DOGE, send to this address:

\`${dbUser.depositAddress}\`

Minimum deposit: 100 DOGE
Balance will be updated after 3 confirmations.
    `;
    
    await sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error handling deposit command:', error);
    await sendMessage(chatId, "Sorry, there was an error processing your deposit request.");
  }
}

// Handle /withdraw command
async function handleWithdrawCommand(chatId: number, user: any) {
  try {
    const telegramId = user.id.toString();
    const dbUser = await storage.getUserByTelegramId(telegramId);
    
    if (!dbUser) {
      return sendMessage(chatId, "Your account is not set up. Please use /start first.");
    }
    
    if (dbUser.balance < 20) {
      return sendMessage(chatId, "Your balance is too low. Minimum withdrawal is 20 DOGE.");
    }
    
    const message = `
To withdraw, please use the format:
/withdraw <amount> <doge_address>

Example:
/withdraw 100 DNxJ5K5...

Your current balance: ${dbUser.balance} DOGE
Minimum withdrawal: 20 DOGE
    `;
    
    await sendMessage(chatId, message);
    
  } catch (error) {
    console.error('Error handling withdraw command:', error);
    await sendMessage(chatId, "Sorry, there was an error processing your withdrawal request.");
  }
}

// Handle /balance command
async function handleBalanceCommand(chatId: number, user: any) {
  try {
    const telegramId = user.id.toString();
    const dbUser = await storage.getUserByTelegramId(telegramId);
    
    if (!dbUser) {
      return sendMessage(chatId, "Your account is not set up. Please use /start first.");
    }
    
    const message = `
Your current balance: ${dbUser.balance} DOGE 💰

Use /play to bet and win more!
Use /deposit to add funds.
Use /withdraw to cash out your winnings.
    `;
    
    await sendMessage(chatId, message);
    
  } catch (error) {
    console.error('Error handling balance command:', error);
    await sendMessage(chatId, "Sorry, there was an error retrieving your balance.");
  }
}

// Handle /help command
async function handleHelpCommand(chatId: number) {
  const message = `
Here's how to use the Dogecoin Crash Betting Game:

Commands:
/start - Start the bot
/play - Launch the crash betting game
/deposit - Get your deposit address
/withdraw - Withdraw your Dogecoin
/balance - Check your balance
/help - Show this help message

Game Rules:
1. Place a bet using DOGE
2. The multiplier starts at 1.00x and increases
3. Cash out before it crashes to win your bet × multiplier
4. If you don't cash out before the crash, you lose your bet

Minimum deposit: 100 DOGE
Minimum withdrawal: 20 DOGE
Minimum bet: 1 DOGE

Need more help? Contact @admin
  `;
  
  await sendMessage(chatId, message);
}

// Send a message to a chat
export async function sendMessage(chatId: number, text: string, options: any = {}) {
  try {
    await axios.post(getApiUrl('sendMessage'), {
      chat_id: chatId,
      text: text,
      ...options
    });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}