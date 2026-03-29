import { useState } from "react";

function OrderRow({ order, onAccept, onStatus }) {
  const [busy, setBusy] = useState(false);
  const customer = order.customerId?.name || "Customer";
  const chef = order.chefId?.name || "Chef";

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="border border-slate-200 rounded-xl p-4 bg-white text-left space-y-2">
      <div className="flex justify-between gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wide text-slate-400">{order.status.replace("_", " ")}</span>
        <span className="text-sm font-medium text-slate-800">₹{order.totalAmount}</span>
      </div>
      <p className="text-sm text-slate-600">
        {customer} → {chef}
      </p>
      <ul className="text-sm text-slate-700 list-disc list-inside">
        {order.items?.map((i, idx) => (
          <li key={idx}>
            {i.name} × {i.quantity}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 pt-2">
        {onAccept && (order.status === "placed" || order.status === "rider_assigned") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onAccept(order._id))}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white text-sm disabled:opacity-50"
          >
            Accept
          </button>
        )}
        {onStatus && order.status === "accepted" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onStatus(order._id, "picked_up"))}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm disabled:opacity-50"
          >
            Picked up
          </button>
        )}
        {onStatus && order.status === "picked_up" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onStatus(order._id, "delivered"))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm disabled:opacity-50"
          >
            Delivered
          </button>
        )}
      </div>
    </li>
  );
}

export default function OrderPanel({ title, orders, pool, onAccept, onStatus }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {pool?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-2">Open pool</h3>
          <ul className="space-y-3">
            {pool.map((o) => (
              <OrderRow key={o._id} order={o} onAccept={onAccept} />
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-2">My deliveries</h3>
        {!orders?.length ? (
          <p className="text-sm text-slate-400">No active orders.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <OrderRow key={o._id} order={o} onAccept={onAccept} onStatus={onStatus} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
