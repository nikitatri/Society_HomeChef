import { User } from "../models/User.js";
import { Order } from "../models/Order.js";

export async function setAvailability(req, res) {
  try {
    const { isOnline, lat, lng } = req.body;
    const updates = {};
    if (isOnline != null) updates.isOnline = Boolean(isOnline);
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
    res.status(500).json({ message: "Failed" });
  }
}

export async function riderOrders(req, res) {
  const rider = await User.findById(req.user.id);
  if (!rider) return res.status(404).json({ message: "Not found" });

  const mine = await Order.find({
    riderId: rider._id,
    status: { $nin: ["delivered", "cancelled"] },
  })
    .sort({ createdAt: -1 })
    .populate("customerId", "name")
    .populate("chefId", "name location");

  const pool = await Order.find({
    societyName: rider.societyName,
    riderId: null,
    status: "placed",
  })
    .sort({ createdAt: -1 })
    .populate("customerId", "name")
    .populate("chefId", "name location");

  res.json({ assigned: mine, pool });
}

export async function acceptOrder(req, res) {
  try {
    const rider = await User.findById(req.user.id);
    if (!rider?.isOnline) return res.status(400).json({ message: "Go online to accept orders" });

    const order = await Order.findById(req.params.id);
    if (!order || order.societyName !== rider.societyName) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.riderId && String(order.riderId) !== String(rider._id)) {
      return res.status(409).json({ message: "Already assigned to another rider" });
    }

    if (!order.riderId) order.riderId = rider._id;
    if (order.status === "placed" || order.status === "rider_assigned") order.status = "accepted";
    await order.save();
    const out = await Order.findById(order._id)
      .populate("customerId", "name")
      .populate("chefId", "name location");
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Accept failed" });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["picked_up", "delivered"].includes(status)) {
      return res.status(400).json({ message: "status must be picked_up or delivered" });
    }
    const order = await Order.findOne({ _id: req.params.id, riderId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "picked_up" && order.status !== "accepted") {
      return res.status(400).json({ message: "Accept the order before marking picked up" });
    }
    if (status === "delivered" && order.status !== "picked_up") {
      return res.status(400).json({ message: "Mark picked up first" });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
}
