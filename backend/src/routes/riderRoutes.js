import { Router } from "express";
import {
  setAvailability,
  riderOrders,
  acceptOrder,
  updateOrderStatus,
} from "../controllers/riderController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const r = Router();
r.use(authRequired, requireRole("rider"));
r.patch("/availability", setAvailability);
r.get("/orders", riderOrders);
r.post("/orders/:id/accept", acceptOrder);
r.patch("/orders/:id/status", updateOrderStatus);

export default r;
