"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
// 🔥 Force import Redis (ioredis instance)
const redisModule = require("./utils/redis");
const redis = redisModule.redis; // actual client
// console.log("REDIS TYPE:", redisModule);
// console.log("REDIS METHODS:", Object.keys(redis));
// console.log("SERVER STARTED FROM:", __filename);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: env_1.CONFIG.CLIENT_ORIGIN,
}));
// ----------------------------------
// API Routes
// ----------------------------------
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const position_routes_1 = __importDefault(require("./routes/position.routes"));
app.use("/api", order_routes_1.default);
app.use("/api", position_routes_1.default);
app.get("/", (_req, res) => res.json({ ok: true, message: "Backend working" }));
// ----------------------------------
// HTTP Server
// ----------------------------------
app.listen(env_1.CONFIG.PORT, () => {
    console.log(`🚀 HTTP API running on port ${env_1.CONFIG.PORT}`);
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
const ws_1 = __importDefault(require("ws"));
const ioredis_1 = __importDefault(require("ioredis"));
const WS_PORT = 5001;
const wss = new ws_1.default.Server({ port: WS_PORT });
console.log(`🟢 WebSocket started: ws://localhost:${WS_PORT}`);
// ⚠️ Separate Redis client only for XREAD (do NOT reuse main client)
const redisStream = new ioredis_1.default(env_1.CONFIG.REDIS_URL);
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
    redisStream.xread("BLOCK", 0, "STREAMS", "stream:orders", lastId, (err, res) => {
        if (err) {
            console.error("🔴 XREAD ERROR:", err.message);
            return setTimeout(listenRedis, 500);
        }
        if (!res)
            return listenRedis();
        const stream = res[0];
        const entries = stream[1];
        for (const [eventId, fields] of entries) {
            lastId = eventId;
            const data = { id: eventId };
            for (let i = 0; i < fields.length; i += 2) {
                data[fields[i]] = fields[i + 1];
            }
            // Broadcast WebSocket update
            const msg = JSON.stringify({ type: "position", data });
            wss.clients.forEach((c) => c.send(msg));
        }
        listenRedis();
    });
}
