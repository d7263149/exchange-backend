"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CONFIG = {
    PORT: process.env.PORT || 4000,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    // Redis URL (add this 👇)
    REDIS_URL: process.env.REDIS_URL || "",
    // Binance (we may use later)
    BINANCE_API_KEY: process.env.BINANCE_API_KEY || "",
    BINANCE_API_SECRET: process.env.BINANCE_API_SECRET || "",
};
