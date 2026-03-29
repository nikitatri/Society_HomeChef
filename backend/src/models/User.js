import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["chef", "resident", "rider"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    societyName: { type: String, required: true, trim: true, lowercase: true },
    location: { type: locationSchema, default: () => ({}) },
    /** Rider-only: whether they are accepting deliveries */
    isOnline: { type: Boolean, default: false },
    /** Chef profile extras */
    chefBio: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

userSchema.index({ societyName: 1, role: 1 });

export const User = mongoose.model("User", userSchema);
