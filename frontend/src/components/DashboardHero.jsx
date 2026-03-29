
export default function DashboardHero({ title, subtitle, imageUrl, tintClass = "from-red-950/80 via-red-900/50 to-slate-900/40" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm min-h-[200px] sm:min-h-[240px]">
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${tintClass}`} aria-hidden />
      <div className="relative z-10 flex h-full min-h-[200px] sm:min-h-[240px] flex-col justify-end p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-sm">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm sm:text-base text-white/90 drop-shadow-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

export const DASHBOARD_IMAGES = {
  chef: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=2000&q=80",
  resident: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=80",
  rider: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=1115&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};
