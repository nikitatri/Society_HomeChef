import mongoose from "mongoose";
import { Dish } from "../models/Dish.js";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { computeNutrition, deriveTagsFromName } from "../utils/nutrition.js";

export async function createDish(req, res) {
  try {
    const chef = await User.findById(req.user.id);
    if (!chef || chef.role !== "chef") return res.status(403).json({ message: "Not a chef" });

    const { name, price, quantity, published, videoUrl } = req.body;
    if (!name || price == null || quantity == null) {
      return res.status(400).json({ message: "name, price, quantity required" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const { calories, healthScore } = computeNutrition(name);
    const autoTags = deriveTagsFromName(name);
    let manualTags = [];
    if (Array.isArray(req.body.tags)) manualTags = req.body.tags;
    else if (typeof req.body.tags === "string" && req.body.tags.trim()) {
      try {
        manualTags = JSON.parse(req.body.tags);
      } catch {
        manualTags = [];
      }
    }
    const tags = [...new Set([...autoTags, ...manualTags])];

    const dish = await Dish.create({
      chefId: chef._id,
      societyName: chef.societyName,
      name: name.trim(),
      price: Number(price),
      quantity: Number(quantity),
      imageUrl,
      videoUrl: videoUrl || "",
      published: published === true || published === "true",
      soldOut: false,
      tags,
      calories,
      healthScore,
    });
    res.status(201).json(dish);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || "Create dish failed" });
  }
}

export async function listMyDishes(req, res) {
  const dishes = await Dish.find({ chefId: req.user.id }).sort({ updatedAt: -1 });
  res.json(dishes);
}

export async function updateDish(req, res) {
  try {
    const dish = await Dish.findOne({ _id: req.params.id, chefId: req.user.id });
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    const { name, price, quantity, published, soldOut, videoUrl } = req.body;
    if (name != null) {
      dish.name = name.trim();
      const { calories, healthScore } = computeNutrition(dish.name);
      dish.calories = calories;
      dish.healthScore = healthScore;
      dish.tags = [...new Set([...deriveTagsFromName(dish.name), ...dish.tags])];
    }
    if (price != null) dish.price = Number(price);
    if (quantity != null) dish.quantity = Number(quantity);
    if (published != null) dish.published = published === true || published === "true";
    if (soldOut != null) dish.soldOut = soldOut === true || soldOut === "true";
    if (videoUrl != null) dish.videoUrl = videoUrl;
    if (req.file) dish.imageUrl = `/uploads/${req.file.filename}`;

    await dish.save();
    res.json(dish);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Update failed" });
  }
}

export async function chefAnalytics(req, res) {
  const chefId = new mongoose.Types.ObjectId(req.user.id);
  const dishCount = await Dish.countDocuments({ chefId });
  const orderAgg = await Order.aggregate([
    { $match: { chefId: chefId, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const topDishes = await Order.aggregate([
    { $match: { chefId: chefId } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.dishId",
        name: { $first: "$items.name" },
        sold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ]);
  const summary = orderAgg[0] || { totalOrders: 0, revenue: 0 };
  res.json({
    dishCount,
    totalOrders: summary.totalOrders,
    revenue: summary.revenue,
    topDishes,
  });
}
