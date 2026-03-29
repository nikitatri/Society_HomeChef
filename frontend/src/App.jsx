import { useState, useEffect } from "react";
import { Link, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ChefDashboard from "./pages/ChefDashboard.jsx";
import ResidentFeed from "./pages/ResidentFeed.jsx";
import RiderDashboard from "./pages/RiderDashboard.jsx";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Society HomeChef. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function RequireAuth({ role }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">Loading…</div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    const home =
      user.role === "chef" ? "/chef" : user.role === "resident" ? "/feed" : "/rider";
    return <Navigate to={home} replace />;
  }
  return <Outlet />;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1371&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dp",
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589778655375-3e622a9fc91c?q=80&w=1131&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

function Home() {
  const { user, loading } = useAuth();
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    if (user || loading) return;
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [user, loading]);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading…</div>;
  if (!user) {
    return (
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative flex-1 flex items-center justify-center min-h-[600px] md:min-h-[80vh] bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0">
            {HERO_IMAGES.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt={`Delicious food spread ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  idx === currentImg ? "opacity-40" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mt-[-4rem]">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-sm">
              Society <span className="text-red-500">HomeChef</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-200 mb-10 font-medium max-w-2xl mx-auto drop-shadow">
              Your neighborhood's best home meals, cooked with love and delivered fresh to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold shadow-lg text-lg"
              >
                Join your community
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm transition-colors text-white font-semibold text-lg"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How it works</h2>
              <p className="text-slate-500 mt-4 text-lg">Hyperlocal food delivery designed exclusively for gated communities.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Chefs Cook</h3>
                <p className="text-slate-600 leading-relaxed">
                  Passionate home chefs in your society prepare delicious, healthy, and hygienic meals.
                </p>
              </div>
              <div className="text-center">
                 <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Residents Order</h3>
                <p className="text-slate-600 leading-relaxed">
                  Browse the daily menu and order right from your phone. Satisfy your cravings instantly.
                </p>
              </div>
              <div className="text-center">
                 <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Riders Deliver</h3>
                <p className="text-slate-600 leading-relaxed">
                  Local community riders pick up your food and drop it at your doorstep within minutes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
  if (user.role === "chef") return <Navigate to="/chef" replace />;
  if (user.role === "resident") return <Navigate to="/feed" replace />;
  return <Navigate to="/rider" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<RequireAuth role="chef" />}>
          <Route path="/chef" element={<ChefDashboard />} />
        </Route>
        <Route element={<RequireAuth role="resident" />}>
          <Route path="/feed" element={<ResidentFeed />} />
        </Route>
        <Route element={<RequireAuth role="rider" />}>
          <Route path="/rider" element={<RiderDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
