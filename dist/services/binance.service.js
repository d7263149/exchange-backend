"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMarkPrice = fetchMarkPrice;
const axios_1 = __importDefault(require("axios"));
async function fetchMarkPrice(symbol) {
    const url = `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`;
    const res = await axios_1.default.get(url);
    return Number(res.data.markPrice);
}
