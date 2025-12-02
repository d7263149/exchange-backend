"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const router = (0, express_1.Router)();
// THIS MAKES: /api/order/create
router.post("/order/create", order_controller_1.insertOrderRaw);
exports.default = router;
