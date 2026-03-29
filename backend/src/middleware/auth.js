import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden for this role" });
    }
    next();
  };
}

/** Attach full user doc when needed */
export async function loadUser(req, res, next) {
  try {
    const u = await User.findById(req.user.id).select("-passwordHash").lean();
    if (!u) return res.status(401).json({ message: "User not found" });
    req.profile = u;
    next();
  } catch {
    return res.status(500).json({ message: "Failed to load user" });
  }
}
