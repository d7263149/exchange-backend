import express from "express";
import cors from "cors";
import { CONFIG } from "./config/env";

// 🔥 Force import Redis (ioredis instance)
const redisModule = require("./utils/redis");
const redis = redisModule.redis; // actual client

// console.log("REDIS TYPE:", redisModule);
// console.log("REDIS METHODS:", Object.keys(redis));
// console.log("SERVER STARTED FROM:", __filename);

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: CONFIG.CLIENT_ORIGIN,
  })
);

// ----------------------------------
// API Routes
// ----------------------------------
import orderRoutes from "./routes/order.routes";
import positionRoutes from "./routes/position.routes";
app.use("/api", orderRoutes);
app.use("/api", positionRoutes);

app.get("/", (_req, res) => res.json({ ok: true, message: "Backend working" }));

// ----------------------------------
// HTTP Server
// ----------------------------------
app.listen(CONFIG.PORT, () => {
  console.log(`🚀 HTTP API running on port ${CONFIG.PORT}`);
});

// ----------------------------------
// WebSocket — Live Position Stream
// ----------------------------------
import WebSocket from "ws";

const WS_PORT = 5001;
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`🟢 WebSocket started: ws://localhost:${WS_PORT}`);

let lastId = "$";

// ▶ Start Redis XREAD only after Redis connects
redis.on("connect", () => {
  console.log("🔗 Redis connected → Start listening for live trades...");
  listenRedis();
});

redis.on("error", (err: { message: any; }) => {
  console.error("❌ Redis Error:", err.message);
});

function listenRedis() {
  redis.xread(
    "BLOCK",
    0,
    "STREAMS",
    "stream:orders",
    lastId,
    (err: any, res: any) => {
      if (err) {
        console.error("Redis Stream Error =>", err.message);
        return setTimeout(listenRedis, 1000); // retry safely
      }

      if (!res) return listenRedis(); // blocking wait

      const [[, [[eventId, fields]]]] = res;
      lastId = eventId;

      const data: any = { id: eventId };
      for (let i = 0; i < fields.length; i += 2) {
        data[fields[i]] = fields[i + 1];
      }

      // 🔥 Broadcast new position update
      const msg = JSON.stringify({ type: "position", data });
      wss.clients.forEach((c) => c.send(msg));

      listenRedis();
    }
  );
}
