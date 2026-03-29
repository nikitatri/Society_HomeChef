import { mediaUrl } from "../api/client.js";

export default function DishCard({ dish, onOrder, ordering }) {
  const img = mediaUrl(dish.imageUrl);
  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col text-left max-w-sm w-full">
      <div className="aspect-[4/3] bg-slate-100 relative">
        {img ? (
          <img src={img} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            No image
          </div>
        )}
        {dish.soldOut && (
          <span className="absolute top-2 right-2 bg-rose-600 text-white text-xs px-2 py-1 rounded-full">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-slate-900 line-clamp-2">{dish.name}</h3>
        <p className="text-sm text-slate-500">Chef: {dish.chefName || "—"}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {dish.tags?.map((t) => (
            <span key={t} className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm mt-auto pt-2">
          <span className="font-semibold text-red-600 text-lg">₹{dish.price}</span>
          <span className="text-slate-500">{dish.calories} kcal</span>
          <span className="text-amber-700 font-medium">Health {dish.healthScore}/10</span>
        </div>
        {onOrder && (
          <button
            type="button"
            disabled={ordering || dish.soldOut || dish.quantity < 1}
            onClick={() => onOrder(dish)}
            className="mt-2 w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ordering ? "Ordering…" : "Place order"}
          </button>
        )}
      </div>
    </article>
  );
}
