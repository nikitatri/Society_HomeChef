import { useEffect, useState } from "react";
import { api, mediaUrl } from "../api/client.js";
import DashboardHero, {
  DASHBOARD_IMAGES,
} from "../components/DashboardHero.jsx";

export default function ChefDashboard() {
  const [dishes, setDishes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    published: true,
    media: null,
  });

  const load = async () => {
    const [d, a] = await Promise.all([api.chefDishes(), api.chefAnalytics()]);
    setDishes(d);
    setAnalytics(a);
  };

  useEffect(() => {
    load().catch(() => setMsg("Failed to load dishes"));
  }, []);

  const addDish = async (e) => {
    e.preventDefault();
    setMsg("");
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", form.price);
    fd.append("quantity", form.quantity);
    fd.append("published", String(form.published));
    if (form.media) fd.append("media", form.media);
    try {
      await api.createDish(fd);
      setForm({
        name: "",
        price: "",
        quantity: "",
        published: true,
        media: null,
      });
      await load();
      setMsg("Dish published.");
    } catch (err) {
      setMsg(err.message);
    }
  };

  const toggleSoldOut = async (dish) => {
    const fd = new FormData();
    fd.append("soldOut", String(!dish.soldOut));
    await api.updateDish(dish._id, fd);
    await load();
  };

  const togglePublish = async (dish) => {
    const fd = new FormData();
    fd.append("published", String(!dish.published));
    await api.updateDish(dish._id, fd);
    await load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-left space-y-10">
      <DashboardHero
        title="Chef dashboard"
        subtitle="List dishes, track simple analytics, and feed your society."
        imageUrl={DASHBOARD_IMAGES.chef}
        tintClass="from-red-950/85 via-stone-900/55 to-orange-950/35"
      />

      {analytics && (
        <section className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Dishes</p>
            <p className="text-2xl font-semibold">{analytics.dishCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Orders</p>
            <p className="text-2xl font-semibold">{analytics.totalOrders}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Revenue (₹)</p>
            <p className="text-2xl font-semibold">{analytics.revenue}</p>
          </div>
        </section>
      )}

      {analytics?.topDishes?.length > 0 && (
        <section>
          <h2 className="font-semibold text-slate-900 mb-2">
            Top dishes (units sold)
          </h2>
          <ul className="text-sm text-slate-600 space-y-1">
            {analytics.topDishes.map((t) => (
              <li key={String(t._id)}>
                {t.name || "Dish"} — {t.sold} sold
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl">
        <h2 className="font-semibold text-slate-900 mb-4">Add dish</h2>
        {msg && <p className="text-sm text-red-600 mb-2">{msg}</p>}
        <form onSubmit={addDish} className="space-y-3">
          <input
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Dish name (used for nutrition heuristic)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded-xl px-3 py-2"
              type="number"
              placeholder="Price ₹"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              required
              min="0"
            />
            <input
              className="border rounded-xl px-3 py-2"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: e.target.value }))
              }
              required
              min="0"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.checked }))
              }
            />
            Published to society feed
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) =>
              setForm((f) => ({ ...f, media: e.target.files?.[0] || null }))
            }
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition-colors text-white font-medium"
          >
            Save dish
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900 mb-4">Your dishes</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dishes.map((d) => (
            <div
              key={d._id}
              className="border border-slate-200 rounded-2xl overflow-hidden bg-white"
            >
              {d.videoUrl ? (
                <video
                  src={d.videoUrl}
                  className="h-36 w-full object-cover"
                  controls
                />
              ) : d.imageUrl ? (
                <img
                  src={d.imageUrl}
                  alt=""
                  className="h-36 w-full object-cover"
                />
              ) : null}
              <div className="p-4 space-y-2">
                <h3 className="font-medium">{d.name}</h3>
                <p className="text-sm text-slate-500">
                  ₹{d.price} · qty {d.quantity} · {d.calories} kcal · health{" "}
                  {d.healthScore}/10
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSoldOut(d)}
                    className="text-xs px-2 py-1 rounded-lg bg-slate-100"
                  >
                    {d.soldOut ? "Mark in stock" : "Mark sold out"}
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublish(d)}
                    className="text-xs px-2 py-1 rounded-lg bg-slate-100"
                  >
                    {d.published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
