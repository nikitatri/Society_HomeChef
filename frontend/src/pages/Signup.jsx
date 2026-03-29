import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { DASHBOARD_IMAGES } from "../components/DashboardHero.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState("resident");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    societyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ ...formData, role });
      // Route based on role after successful signup
      if (role === "chef") navigate("/chef");
      else if (role === "rider") navigate("/rider");
      else navigate("/feed");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left side: Hero Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          key={role}
          src={DASHBOARD_IMAGES[role]}
          alt={`${role} background`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        />
        <div className="relative z-20 text-center px-12">
          <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
            Society HomeChef
          </h1>
          <p className="text-xl text-gray-200 font-medium">
            Your neighborhood's best home meals, delivered fresh to your door.
          </p>
        </div>
      </div>

      {/* Right side: Signup Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join your community's food network today.
            </p>
          </div>

          <div className="mt-8">
            {/* Role Slider */}
            <div className="flex bg-gray-100 p-1 rounded-full mb-8 relative shadow-inner">
              {["resident", "chef", "rider"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 z-10 ${
                    role === r
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {role === "chef" ? "Restaurant Name / Chef Name" : "Full Name"}
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder={role === "chef" ? "e.g. Priya's Kitchen" : "e.g. John Doe"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area or city (Used to match you with locals)
                </label>
                <input
                  name="societyName"
                  type="text"
                  required
                  value={formData.societyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="e.g. Koramangala, Bangalore"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-red-600 hover:text-red-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}