import multer from "multer";
import { storage } from "../config/cloudConfig.js";

// ✅ THIS is the real fix
export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for video
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/|^video\//.test(file.mimetype);
    if (!ok) return cb(new Error("Only image/video allowed"));
    cb(null, true);
  },
});