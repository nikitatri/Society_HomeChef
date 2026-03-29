import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import OrderPanel from "../components/OrderPanel.jsx";
import DashboardHero, { DASHBOARD_IMAGES } from "../components/DashboardHero.jsx";

export default function RiderDashboard() {
  const { user, refresh } = useAuth();
  const [assigned, setAssigned] = useState([]);
  const [pool, setPool] = useState([]);
  const [lat, setLat] = useState(String(user?.location?.lat ?? ""));
  const [lng, setLng] = useState(String(user?.location?.lng ?? ""));

  const load = async () => {
    const data = await api.riderOrders();
    setAssigned(data.assigned || []);
    setPool(data.pool || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const toggleOnline = async () => {
    await api.riderAvailability({
      isOnline: !user?.isOnline,
      lat: Number(lat),
      lng: Number(lng),
    });
    await refresh();
  };

  const saveLoc = async () => {
    await api.riderAvailability({ lat: Number(lat), lng: Number(lng) });
    await refresh();
  };

  const accept = async (id) => {
    await api.acceptOrder(id);
    await load();
  };

  const status = async (id, s) => {
    await api.riderStatus(id, s);
    await load();
  };

  useEffect(() => {
    if (user) {
      setLat(String(user.location?.lat ?? ""));
      setLng(String(user.location?.lng ?? ""));
    }
  }, [user?.location?.lat, user?.location?.lng]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-left space-y-8">
      <div className="space-y-4">
        <DashboardHero
          title="Rider dashboard"
          subtitle="Go online to receive assignments. Accept orders, then mark picked up and delivered."
          imageUrl={DASHBOARD_IMAGES.rider}
          tintClass="from-red-950/90 via-stone-900/50 to-neutral-900/45"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleOnline}
            className={`px-5 py-2.5 rounded-xl font-medium text-white shadow-sm transition-colors ${
              user?.isOnline ? "bg-slate-800 hover:bg-slate-900" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {user?.isOnline ? "Go offline" : "Go online"}
          </button>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 max-w-md space-y-3">
        <h2 className="font-medium text-slate-900">Simulated location</h2>
        <p className="text-xs text-slate-500">Used for nearest-rider matching (Haversine).</p>
        <div className="grid grid-cols-2 gap-2">
          <input className="border rounded-lg px-2 py-1.5 text-sm" value={lat} onChange={(e) => setLat(e.target.value)} />
          <input className="border rounded-lg px-2 py-1.5 text-sm" value={lng} onChange={(e) => setLng(e.target.value)} />
        </div>
        <button type="button" onClick={saveLoc} className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium">
          Save coordinates
        </button>
      </section>

      <OrderPanel title="Deliveries" orders={assigned} pool={pool} onAccept={accept} onStatus={status} />
    </div>
  );
}
