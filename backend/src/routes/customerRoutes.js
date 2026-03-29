import { Router } from "express";
import { feed, placeOrder, myOrders } from "../controllers/customerController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const r = Router();
r.use(authRequired, requireRole("resident"));
r.get("/feed", feed);
r.post("/orders", placeOrder);
r.get("/orders", myOrders);

export default r;
