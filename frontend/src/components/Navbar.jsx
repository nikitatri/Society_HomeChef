import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();

  const dash =
    user?.role === "chef"
      ? "/chef"
      : user?.role === "resident"
        ? "/feed"
        : user?.role === "rider"
          ? "/rider"
          : "/";

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to={user ? dash : "/"} className="font-bold text-red-600 text-lg tracking-tight hover:text-red-700 transition-colors">
          Society HomeChef
        </Link>
        {user ? (
          <nav className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs text-slate-500 hidden sm:inline">
              {user.name} · <span className="capitalize">{user.role}</span>
            </span>
            {user.role === "chef" && (
              <NavLink to="/chef" className={linkClass}>
                Chef
              </NavLink>
            )}
            {user.role === "resident" && (
              <NavLink to="/feed" className={linkClass}>
                Feed
              </NavLink>
            )}
            {user.role === "rider" && (
              <NavLink to="/rider" className={linkClass}>
                Rider
              </NavLink>
            )}
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Log out
            </button>
          </nav>
        ) : (
          <nav className="flex gap-2">
            <NavLink to="/login" className={linkClass}>
              Log in
            </NavLink>
            <NavLink to="/signup" className={linkClass}>
              Sign up
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
