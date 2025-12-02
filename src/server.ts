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
// ----------------------------------
// WebSocket — Live Position Stream
// ----------------------------------
// ----------------------------------
// WebSocket — Live Position Stream
// ----------------------------------
import WebSocket from "ws";
import IORedis from "ioredis";

const WS_PORT = 5001;
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`🟢 WebSocket started: ws://localhost:${WS_PORT}`);

// ⚠️ Separate Redis client only for XREAD (do NOT reuse main client)
const redisStream = new IORedis(CONFIG.REDIS_URL);

let lastId = "$";

redisStream.on("connect", () => {
  console.log("🚀 redisStream connected → listening for live orders...");
  listenRedis();
});

redisStream.on("error", (err) => {
  console.error("❌ redisStream ERROR:", err.message);
});

// Loop XREAD forever
function listenRedis() {
  redisStream.xread(
    "BLOCK",
    0,
    "STREAMS",
    "stream:orders",
    lastId,
    (err, res) => {
      if (err) {
        console.error("🔴 XREAD ERROR:", err.message);
        return setTimeout(listenRedis, 500);
      }

      if (!res) return listenRedis();

      const stream = res[0];
      const entries = stream[1];

      for (const [eventId, fields] of entries) {
        lastId = eventId;
        const data: any = { id: eventId };

        for (let i = 0; i < fields.length; i += 2) {
          data[fields[i]] = fields[i + 1];
        }

        // Broadcast WebSocket update
        const msg = JSON.stringify({ type: "position", data });
        wss.clients.forEach((c) => c.send(msg));
      }

      listenRedis();
    }
  );
}
