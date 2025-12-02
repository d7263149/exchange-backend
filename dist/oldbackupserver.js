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
const ws_1 = __importDefault(require("ws"));
const WS_PORT = 5001;
const wss = new ws_1.default.Server({ port: WS_PORT });
console.log(`🟢 WebSocket started: ws://localhost:${WS_PORT}`);
let lastId = "$";
// ▶ Start Redis XREAD only after Redis connects
redis.on("connect", () => {
    console.log("🔗 Redis connected → Start listening for live trades...");
    listenRedis();
});
redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
});
function listenRedis() {
    redis.xread("BLOCK", 0, "STREAMS", "stream:orders", lastId, (err, res) => {
        if (err) {
            console.error("Redis Stream Error =>", err.message);
            return setTimeout(listenRedis, 1000); // retry safely
        }
        if (!res)
            return listenRedis(); // blocking wait
        const [[, [[eventId, fields]]]] = res;
        lastId = eventId;
        const data = { id: eventId };
        for (let i = 0; i < fields.length; i += 2) {
            data[fields[i]] = fields[i + 1];
        }
        // 🔥 Broadcast new position update
        const msg = JSON.stringify({ type: "position", data });
        wss.clients.forEach((c) => c.send(msg));
        listenRedis();
    });
}
