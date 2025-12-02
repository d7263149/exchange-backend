"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrder = calculateOrder;
const binance_service_1 = require("./binance.service");
async function calculateOrder(symbol, amount, leverage) {
    const markPrice = await (0, binance_service_1.fetchMarkPrice)(symbol);
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
