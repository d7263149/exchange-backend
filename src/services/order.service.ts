import { fetchMarkPrice } from "./binance.service";

export async function calculateOrder(
  symbol: string,
  amount: number,
  leverage: number
) {
  const markPrice = await fetchMarkPrice(symbol);

  const positionValue = amount * leverage;
  const qty = positionValue / markPrice;

  return {
    symbol: symbol.toUpperCase(),
    amount,
    leverage,
    markPrice,
    positionValue: Number(positionValue.toFixed(2)),
    qty: Number(qty.toFixed(6)),
  };
}
