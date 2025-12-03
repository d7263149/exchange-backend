import express from "express";
import cors from "cors";
import http from "http";
import { CONFIG } from "./config/env";

// Redis main client
const redisModule = require("./utils/redis");
const redis = redisModule.redis;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: CONFIG.CLIENT_ORIGIN || "*",
  })
);

// Routes
import orderRoutes from "./routes/order.routes";
import positionRoutes from "./routes/position.routes";
import markRoutes from "./routes/mark.route";
app.use("/api", markRoutes);

app.use("/api", orderRoutes);
app.use("/api", positionRoutes);

app.get("/", (_req, res) => res.json({ ok: true, message: "Backend working" }));

// ----------------------------------------------------
// Create SINGLE HTTP server (Render exposes only one)
// ----------------------------------------------------
const PORT = process.env.PORT || CONFIG.PORT || 4000;
const server = http.createServer(app);

server.listen(PORT, () =>
  console.log(`🚀 Server running (API + WS) on port ${PORT}`)
);

// ----------------------------------------------------
// WebSocket on same server
// ----------------------------------------------------
import WebSocket from "ws";
import IORedis from "ioredis";

const wss = new WebSocket.Server({ server });
console.log("🟢 WebSocket bound to same HTTP server");

// Redis stream client for XREAD
const redisStream = new IORedis(CONFIG.REDIS_URL);

let lastId = "$";

redisStream.on("connect", () => {
  console.log("🚀 redisStream connected → listening for completed trades...");
  listenRedis();
});

redisStream.on("error", (err) => {
  console.error("❌ redisStream ERROR:", err.message);
});

function listenRedis() {
  redisStream.xread(
    "BLOCK",
    0,
    "STREAMS",
    "stream:completed",
    lastId,
    (err, res) => {
      if (err) {
        console.error("🔴 XREAD ERROR:", err.message);
        return setTimeout(listenRedis, 500);
      }

      if (!res) return listenRedis();

      const entries = res[0][1];

      for (const [eventId, fields] of entries) {
        lastId = eventId;

        // const data: Record<string, string> = { id: eventId };
        const data: Record<string, any> = { id: eventId };


        for (let i = 0; i < fields.length; i += 2) {
          const key = fields[i];
          const value = fields[i + 1];
          data[key] = value; // ✔ TypeScript-safe now
        }

        const msg = JSON.stringify({ type: "completed_trade", data });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
          }
        });
      }

      listenRedis();
    }
  );
}
