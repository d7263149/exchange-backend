import { Request, Response } from "express";
import { redis } from "../utils/redis";

export async function insertOrderRaw(req: Request, res: Response) {
  try {
    console.log("📩 RECEIVED ORDER BODY:", req.body);

    const { symbol, side, qty, amount, leverage, event, userId } = req.body;

    if (!symbol || !side || !qty || !userId) {
      return res.status(400).json({
        ok: false,
        error: "Required: symbol, side, qty, userId",
      });
    }

    const id = await redis.xadd(
      "stream:orders",
      "*",
      "symbol", String(symbol),
      "side", String(side),
      "qty", String(qty),
      "userId", String(userId),
      "amount", String(amount ?? 0),
      "leverage", String(leverage ?? 0),
      "event", String(event ?? "insert"),
      "ts", String(Date.now())
    );

    return res.json({ ok: true, id, received: req.body });

  } catch (err) {
    console.error("❌ Redis XADD error:", err);
    return res.status(500).json({ ok: false, error: "Redis error" });
  }
}
