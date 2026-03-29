import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

function finiteCoord(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function signup(req, res) {
  try {
    const { email, password, role, name, societyName, lat, lng } = req.body;
    const roleNorm = typeof role === "string" ? role.trim() : role;
    if (!email || !password || !roleNorm || !name || !societyName) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!["chef", "resident", "rider"].includes(roleNorm)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: String(email).trim(),
      passwordHash,
      role: roleNorm,
      name: String(name).trim(),
      societyName: String(societyName).trim(),
      location: {
        lat: finiteCoord(lat, 0),
        lng: finiteCoord(lng, 0),
      },
      ...(roleNorm === "rider" ? { isOnline: false } : {}),
    });

    const token = signToken(user);
    const safe = user.toObject();
    delete safe.passwordHash;
    res.status(201).json({ token, user: safe });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error(e);
    res.status(500).json({ message: e?.message || "Signup failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });
    const token = signToken(user);
    const safe = user.toObject();
    delete safe.passwordHash;
    res.json({ token, user: safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Login failed" });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash").lean();
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, societyName, lat, lng, chefBio } = req.body;
    const updates = {};
    if (name != null) updates.name = name;
    if (req.user.role === "chef" && societyName != null) updates.societyName = societyName.trim();
    if (req.user.role === "chef" && chefBio != null) updates.chefBio = chefBio;
    if (lat != null || lng != null) {
      const u = await User.findById(req.user.id);
      updates.location = {
        lat: lat != null ? Number(lat) : u.location?.lat ?? 0,
        lng: lng != null ? Number(lng) : u.location?.lng ?? 0,
      };
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select(
      "-passwordHash"
    );
    res.json(user);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
}
