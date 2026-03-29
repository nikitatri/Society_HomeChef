import mongoose from "mongoose";

const dishSchema = new mongoose.Schema(
  {
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    societyName: { type: String, required: true, index: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    published: { type: Boolean, default: false },
    soldOut: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    calories: { type: Number, default: 0 },
    healthScore: { type: Number, default: 5, min: 0, max: 10 },
  },
  { timestamps: true }
);

dishSchema.index({ societyName: 1, published: 1 });

export const Dish = mongoose.model("Dish", dishSchema);
