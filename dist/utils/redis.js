"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
const redisUrl = env_1.CONFIG.REDIS_URL;
if (!redisUrl) {
    console.warn("⚠️ REDIS_URL not set!");
}
exports.redis = new ioredis_1.default(redisUrl);
exports.redis.on("connect", () => console.log("✅ Redis connected"));
exports.redis.on("error", (err) => console.error("Redis error:", err));
// import Redis from "ioredis";
// export const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   password: process.env.REDIS_PASSWORD
// });
