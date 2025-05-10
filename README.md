# Dogecoin Crash Betting Game Bot

A Telegram-based multiplayer crash betting game with Dogecoin integration and a Hamster Kombat-inspired UI.

## Features

- 🎮 Multiplayer crash betting game
- 💰 Real-time Dogecoin wallet integration
- 🚀 Real-time game updates via WebSockets
- 📱 Responsive Telegram mini-app UI
- 📊 Game history & statistics
- 🌐 Leaderboard system

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Telegram Bot API Token

## Environment Variables

The following environment variables need to be set:

- `DATABASE_URL`: PostgreSQL connection string
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `NODE_ENV`: Set to `development` or `production`

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dogecoin-crash-game.git
   cd dogecoin-crash-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup your environment variables by creating a `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/dogecoin_crash
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   NODE_ENV=development
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment Instructions (Railway)

This project is configured for easy deployment on [Railway](https://railway.app).

1. Push this code to GitHub
2. Create a new project on Railway
3. Connect your GitHub repository
4. Add the following environment variables:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `NODE_ENV`: production
5. Railway will automatically provision a PostgreSQL database
6. Deploy and Railway will make your bot accessible worldwide

## Bot Commands

- `/start` - Start the bot
- `/play` - Launch the crash betting game
- `/deposit` - Get your deposit address
- `/withdraw` - Withdraw your Dogecoin
- `/balance` - Check your balance
- `/help` - Show help message

## Game Rules

1. Place a bet using DOGE
2. The multiplier starts at 1.00x and increases
3. Cash out before it crashes to win your bet × multiplier
4. If you don't cash out before the crash, you lose your bet

## Minimum Requirements

- Minimum deposit: 100 DOGE
- Minimum withdrawal: 20 DOGE
- Minimum bet: 1 DOGE

## License

MIT