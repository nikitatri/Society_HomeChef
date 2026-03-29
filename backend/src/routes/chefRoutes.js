import { Router } from "express";
import {
  createDish,
  listMyDishes,
  updateDish,
  chefAnalytics,
} from "../controllers/chefController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { uploadMedia } from "../middleware/upload.js";

const r = Router();
r.use(authRequired, requireRole("chef"));
r.post("/dishes", uploadMedia.single("media"), createDish);
r.get("/dishes", listMyDishes);
r.patch("/dishes/:id", uploadMedia.single("media"), updateDish);
r.get("/analytics", chefAnalytics);

export default r;
