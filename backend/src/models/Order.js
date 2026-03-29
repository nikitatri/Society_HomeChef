import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
    name: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    societyName: { type: String, required: true, trim: true, lowercase: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    deliveryLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: [
        "placed",
        "rider_assigned",
        "accepted",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
  },
  { timestamps: true }
);

orderSchema.index({ riderId: 1, status: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ chefId: 1 });

export const Order = mongoose.model("Order", orderSchema);
