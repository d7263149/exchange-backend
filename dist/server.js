"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const env_1 = require("./config/env");
// Redis main client
const redisModule = require("./utils/redis");
const redis = redisModule.redis;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: env_1.CONFIG.CLIENT_ORIGIN || "*",
}));
// Routes
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const position_routes_1 = __importDefault(require("./routes/position.routes"));
app.use("/api", order_routes_1.default);
app.use("/api", position_routes_1.default);
app.get("/", (_req, res) => res.json({ ok: true, message: "Backend working" }));
// ----------------------------------------------------
// Create SINGLE HTTP server (Render exposes only one)
// ----------------------------------------------------
const PORT = process.env.PORT || env_1.CONFIG.PORT || 4000;
const server = http_1.default.createServer(app);
server.listen(PORT, () => console.log(`🚀 Server running (API + WS) on port ${PORT}`));
// ----------------------------------------------------
// WebSocket on same server
// ----------------------------------------------------
const ws_1 = __importDefault(require("ws"));
const ioredis_1 = __importDefault(require("ioredis"));
const wss = new ws_1.default.Server({ server });
console.log("🟢 WebSocket bound to same HTTP server");
// Redis stream client for XREAD
const redisStream = new ioredis_1.default(env_1.CONFIG.REDIS_URL);
let lastId = "$";
redisStream.on("connect", () => {
    console.log("🚀 redisStream connected → listening for live orders...");
    listenRedis();
});
redisStream.on("error", (err) => {
    console.error("❌ redisStream ERROR:", err.message);
});
function listenRedis() {
    redisStream.xread("BLOCK", 0, "STREAMS", "stream:orders", lastId, (err, res) => {
        if (err) {
            console.error("🔴 XREAD ERROR:", err.message);
            return setTimeout(listenRedis, 500);
        }
        if (!res)
            return listenRedis();
        const entries = res[0][1];
        for (const [eventId, fields] of entries) {
            lastId = eventId;
            const data = { id: eventId };
            for (let i = 0; i < fields.length; i += 2) {
                const key = fields[i];
                const value = fields[i + 1];
                data[key] = value; // ✔ TypeScript-safe now
            }
            const msg = JSON.stringify({ type: "position", data });
            wss.clients.forEach((client) => {
                if (client.readyState === ws_1.default.OPEN) {
                    client.send(msg);
                }
            });
        }
        listenRedis();
    });
}
