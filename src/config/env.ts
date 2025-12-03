import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 4000,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*",

  // Redis URL (add this 👇)
  REDIS_URL: process.env.REDIS_URL || "",

  // Binance (we may use later)
  BINANCE_API_KEY: process.env.BINANCE_API_KEY || "",
  BINANCE_API_SECRET: process.env.BINANCE_API_SECRET || "",
};
