import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username").notNull(),
  balance: doublePrecision("balance").notNull().default(0),
  depositAddress: text("deposit_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  telegramId: true,
  username: true,
  depositAddress: true,
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  crashPoint: doublePrecision("crash_point").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  status: text("status").notNull().default("waiting"), // waiting, active, crashed
});

export const insertGameSchema = createInsertSchema(games).pick({
  crashPoint: true,
  status: true,
});

// Bets table
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  amount: doublePrecision("amount").notNull(),
  autoCashoutAt: doublePrecision("auto_cashout_at"),
  cashoutAt: doublePrecision("cashout_at"),
  profit: doublePrecision("profit"),
  status: text("status").notNull().default("active"), // active, won, lost
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  gameId: true,
  amount: true,
  autoCashoutAt: true,
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, bet, win
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull(), // pending, completed, failed
  txHash: text("tx_hash"), // For blockchain transactions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  status: true,
  txHash: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// WebSocket message types
export interface GameStateMessage {
  type: 'gameState';
  state: 'waiting' | 'active' | 'crashed';
  gameId?: number;
  countdown?: number;
  crashPoint?: number;
  multiplier?: number;
}

export interface BetMessage {
  type: 'bet';
  userId: number;
  telegramId: string;
  username: string;
  amount: number;
  gameId: number;
}

export interface CashoutMessage {
  type: 'cashout';
  userId: number;
  telegramId: string;
  username: string;
  multiplier: number;
  amount: number;
  profit: number;
}

export interface CrashMessage {
  type: 'crash';
  gameId: number;
  crashPoint: number;
}

export interface PlayerUpdateMessage {
  type: 'playerUpdate';
  count: number;
  totalBets: number;
}

export interface LeaderboardMessage {
  type: 'leaderboard';
  topBets: {
    username: string;
    telegramId: string;
    amount: number;
    multiplier?: number | null;
    profit?: number | null;
    status: string;
  }[];
}

export type WebSocketMessage = 
  | GameStateMessage 
  | BetMessage 
  | CashoutMessage 
  | CrashMessage
  | PlayerUpdateMessage
  | LeaderboardMessage;
