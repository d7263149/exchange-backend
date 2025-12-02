import axios from "axios";

export async function fetchMarkPrice(symbol: string) {
  const url = `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`;
  const res = await axios.get(url);
  return Number(res.data.markPrice);
}
