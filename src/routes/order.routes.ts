import { Router } from "express";
import { insertOrderRaw } from "../controllers/order.controller";

const router = Router();

// THIS MAKES: /api/order/create
router.post("/order/create", insertOrderRaw);

export default router;
