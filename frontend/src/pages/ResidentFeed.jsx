import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DishCard from "../components/DishCard.jsx";
import DashboardHero, { DASHBOARD_IMAGES } from "../components/DashboardHero.jsx";

export default function ResidentFeed() {
  const [dishes, setDishes] = useState([]);
  const [filters, setFilters] = useState({ veg: false, highProtein: false, lowCalorie: false });
  const [orderingId, setOrderingId] = useState(null);
  const [note, setNote] = useState("");
  const [orders, setOrders] = useState([]);

  const loadFeed = async () => {
    const params = {};
    if (filters.veg) params.veg = "true";
    if (filters.highProtein) params.highProtein = "true";
    if (filters.lowCalorie) params.lowCalorie = "true";
    const d = await api.feed(params);
    setDishes(d);
  };

  const loadOrders = async () => {
    const o = await api.myOrders();
    setOrders(o);
  };

  useEffect(() => {
    loadFeed().catch(() => setNote("Could not load feed"));
  }, [filters]);

  useEffect(() => {
    loadOrders().catch(() => {});
  }, []);

  const place = async (dish) => {
    setNote("");
    setOrderingId(dish._id);
    try {
      await api.placeOrder({
        items: [{ dishId: dish._id, quantity: 1 }],
      });
      setNote("Order placed! Check history below.");
      await loadFeed();
      await loadOrders();
    } catch (e) {
      setNote(e.message || "Order failed");
    } finally {
      setOrderingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-left space-y-8">
      <DashboardHero
        title="Dishes in your society"
        subtitle="Browse home-cooked meals from neighbors. Filter by veg, protein, or calories."
        imageUrl={DASHBOARD_IMAGES.resident}
        tintClass="from-red-950/80 via-orange-900/45 to-rose-900/40"
      />

      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.veg}
            onChange={(e) => setFilters((f) => ({ ...f, veg: e.target.checked }))}
          />
          Veg
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.highProtein}
            onChange={(e) => setFilters((f) => ({ ...f, highProtein: e.target.checked }))}
          />
          High protein
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.lowCalorie}
            onChange={(e) => setFilters((f) => ({ ...f, lowCalorie: e.target.checked }))}
          />
          Low calorie (≤350 kcal)
        </label>
      </div>

      {note && <p className="text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{note}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((d) => (
          <DishCard
            key={d._id}
            dish={d}
            onOrder={place}
            ordering={orderingId === d._id}
          />
        ))}
      </div>
      {dishes.length === 0 && <p className="text-slate-400 text-sm">No dishes match filters.</p>}

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Your orders</h2>
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o._id} className="border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm">
              <span className="font-medium capitalize">{o.status.replace("_", " ")}</span>
              <span className="text-slate-500 ml-2">₹{o.totalAmount}</span>
              <span className="text-slate-400 ml-2">
                {o.items?.map((i) => `${i.name}×${i.quantity}`).join(", ")}
              </span>
            </li>
          ))}
        </ul>
        {orders.length === 0 && <p className="text-slate-400 text-sm">No orders yet.</p>}
      </section>
    </div>
  );
}
