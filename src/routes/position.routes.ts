import { Router } from "express";
const redis = require("../utils/redis").redis;

const router = Router();

router.get("/positions", async (_req, res) => {
  try {
    // FAST & SAFE → read only last 10 entries
    const stream = await redis.xrevrange(
      "stream:orders",
      "+",
      "-",
      "COUNT",
      10
    );

    const result: any[] = [];

    for (const [id, fields] of stream) {
      const obj: any = { id };
      for (let i = 0; i < fields.length; i += 2) {
        obj[fields[i]] = fields[i + 1];
      }
      result.push(obj);
    }

    // reverse → newest bottom, oldest top
    return res.json({ ok: true, data: result.reverse() });

  } catch (err) {
    console.error("Positions ERR:", err);
    return res.json({ ok: false, error: "Redis stream read failed" });
  }
});

export default router;
