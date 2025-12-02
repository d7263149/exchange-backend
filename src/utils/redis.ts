import Redis from "ioredis";
import { CONFIG } from "../config/env";

const redisUrl = CONFIG.REDIS_URL;

if (!redisUrl) {
  console.warn("⚠️ REDIS_URL not set!");
}

export const redis = new Redis(redisUrl);

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));


// import Redis from "ioredis";

// export const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   password: process.env.REDIS_PASSWORD
// });
