import { Dish } from "../models/Dish.js";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { assignNearestRider } from "../utils/assignRider.js";

export async function feed(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "resident") return res.status(403).json({ message: "Residents only" });

    const { veg, highProtein, lowCalorie } = req.query;
    const q = {
      societyName: user.societyName,
      published: true,
      soldOut: false,
      quantity: { $gt: 0 },
    };
    let dishes = await Dish.find(q).populate("chefId", "name").sort({ createdAt: -1 }).lean();

    if (veg === "true") {
      dishes = dishes.filter((d) => d.tags?.some((t) => t.toLowerCase() === "veg"));
    }
    if (highProtein === "true") {
      dishes = dishes.filter((d) => d.tags?.some((t) => t.toLowerCase().includes("protein")));
    }
    if (lowCalorie === "true") {
      dishes = dishes.filter((d) => (d.calories ?? 9999) <= 350);
    }

    const shaped = dishes.map((d) => ({
      ...d,
      chefName: d.chefId?.name || "Chef",
      chefId: d.chefId?._id || d.chefId,
    }));
    res.json(shaped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Feed failed" });
  }
}

export async function placeOrder(req, res) {
  try {
    const customer = await User.findById(req.user.id);
    if (!customer || customer.role !== "resident") return res.status(403).json({ message: "Residents only" });

    const { items, deliveryLat, deliveryLng } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "items[] required: { dishId, quantity }" });
    }

    const dLat = deliveryLat != null ? Number(deliveryLat) : customer.location?.lat ?? 0;
    const dLng = deliveryLng != null ? Number(deliveryLng) : customer.location?.lng ?? 0;

    let total = 0;
    const lineItems = [];
    let chefId = null;
    let society = customer.societyName;

    for (const line of items) {
      const dish = await Dish.findById(line.dishId);
      if (!dish || !dish.published || dish.soldOut) {
        return res.status(400).json({ message: `Dish unavailable: ${line.dishId}` });
      }
      if (dish.societyName !== society) {
        return res.status(400).json({ message: "Dish not in your society" });
      }
      const qty = Math.max(1, Number(line.quantity) || 1);
      if (dish.quantity < qty) {
        return res.status(400).json({ message: `Insufficient quantity for ${dish.name}` });
      }
      if (chefId && String(dish.chefId) !== String(chefId)) {
        return res.status(400).json({ message: "All items must be from the same chef in this MVP" });
      }
      chefId = dish.chefId;
      total += dish.price * qty;
      lineItems.push({
        dishId: dish._id,
        name: dish.name,
        quantity: qty,
        unitPrice: dish.price,
      });
    }

    for (let i = 0; i < items.length; i++) {
      const line = items[i];
      const qty = lineItems[i].quantity;
      const updated = await Dish.findOneAndUpdate(
        { _id: line.dishId, quantity: { $gte: qty } },
        { $inc: { quantity: -qty } },
        { new: true }
      );
      if (!updated) {
        return res.status(409).json({ message: "Stock changed, retry" });
      }
      if (updated.quantity === 0) {
        updated.soldOut = true;
        await updated.save();
      }
    }

    const assignment = await assignNearestRider(society, dLat, dLng);
    const order = await Order.create({
      customerId: customer._id,
      chefId,
      societyName: society,
      items: lineItems,
      totalAmount: total,
      deliveryLocation: { lat: dLat, lng: dLng },
      riderId: assignment?.rider?._id || null,
      status: assignment ? "rider_assigned" : "placed",
    });

    const populated = await Order.findById(order._id)
      .populate("chefId", "name")
      .populate("riderId", "name")
      .lean();

    res.status(201).json({
      order: populated,
      riderAssigned: Boolean(assignment),
      assignmentDistanceKm: assignment?.distanceKm,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Order failed" });
  }
}

export async function myOrders(req, res) {
  const list = await Order.find({ customerId: req.user.id })
    .sort({ createdAt: -1 })
    .populate("chefId", "name")
    .populate("riderId", "name");
  res.json(list);
}
