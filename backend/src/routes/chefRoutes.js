import { Router } from "express";
import {
  createDish,
  listMyDishes,
  updateDish,
  chefAnalytics,
} from "../controllers/chefController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const r = Router();
r.use(authRequired, requireRole("chef"));
r.post("/dishes", upload.single("media"), createDish);
r.get("/dishes", listMyDishes);
r.patch("/dishes/:id", upload.single("media"), updateDish);
r.get("/analytics", chefAnalytics);

export default r;
