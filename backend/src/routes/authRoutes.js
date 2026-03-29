import { Router } from "express";
import { signup, login, me, updateProfile } from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";

const r = Router();
r.post("/signup", signup);
r.post("/login", login);
r.get("/me", authRequired, me);
r.patch("/profile", authRequired, updateProfile);

export default r;
