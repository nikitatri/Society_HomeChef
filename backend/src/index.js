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

const isProd = process.env.NODE_ENV === "production";
app.use(
  cors({
    origin(origin, callback) {
      if (!isProd) return callback(null, true);
      const list = (process.env.CLIENT_ORIGIN || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!list.length) return callback(null, true);
      if (!origin || list.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req, res) => {
  res.type("html").send(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Society HomeChef API</title></head>
<body style="font-family:system-ui;max-width:40rem;margin:2rem;line-height:1.5">
<h1>Society HomeChef API</h1>
<p>This is the <strong>backend</strong>. There is no web UI here.</p>
<ul>
<li>Open the app: <a href="http://localhost:5173">http://localhost:5173</a> (run <code>npm run dev</code> in <code>frontend/</code>)</li>
<li>Health check: <a href="/health">/health</a></li>
<li>API routes: <code>/api/auth</code>, <code>/api/chef</code>, <code>/api/customer</code>, <code>/api/rider</code></li>
</ul>
</body></html>`
  );
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/chef", chefRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/rider", riderRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

/** Default 5050: Windows often reserves 5000 (e.g. AirPlay); 5000 + --watch also races on quick restarts. */
const port = Number(process.env.PORT) || 5050;

connectDb()
  .then(() => {
    const server = app.listen(port, () => console.log(`API http://localhost:${port}`));
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `\nPort ${port} is already in use. Stop other backends / debugger sessions, or set a different PORT in backend/.env (and match vite.config.js proxy).\n`
        );
      } else {
        console.error(err);
      }
      process.exit(1);
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
