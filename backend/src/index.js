import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chefRoutes from "./routes/chefRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import riderRoutes from "./routes/riderRoutes.js";

if (!process.env.JWT_SECRET) {
  console.error("Set JWT_SECRET in .env");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ✅ Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ✅ API routes FIRST
app.use("/api/auth", authRoutes);
app.use("/api/chef", chefRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/rider", riderRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

// ✅ Static frontend serve (AFTER routes)
app.use(express.static(path.join(__dirname, "dist")));

// ✅ SPA fallback (LAST)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5050;

connectDb()
  .then(() => {
    app.listen(port, () => console.log(`Server running on ${port}`));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });