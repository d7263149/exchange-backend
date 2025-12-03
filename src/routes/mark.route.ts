import express from "express";
import axios from "axios";
const router = express.Router();

router.get("/mark", async (req, res) => {
  try {
    const symbol = req.query.symbol || "XRPUSDT";
    const r = await axios.get(
      `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`
    );
    res.json({ ok: true, price: r.data.markPrice });
  } catch (err) {
    res.json({ ok: false });
  }
});

export default router;
