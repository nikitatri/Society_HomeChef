
const base = (import.meta.env.VITE_API_URL || "");


export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(t) {
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}

async function request(path, { method = "GET", body, token, isForm } = {}) {
  const headers = {};
  const auth = token ?? getToken();
  if (auth) headers.Authorization = `Bearer ${auth}`;
  let reqBody;
  if (isForm) {
    reqBody = body;
  } else if (body != null) {
    headers["Content-Type"] = "application/json";
    reqBody = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${base}${path}`, { method, headers, body: reqBody });
  } catch (e) {
    let hint = "";
    if (e?.message === "Failed to fetch") {
      hint =
        " Start the backend (cd backend → npm run dev). Use a normal browser at http://127.0.0.1:5173 or http://localhost:5173. " +
        "Leave VITE_API_URL unset so /api uses the Vite proxy. For another device on Wi‑Fi, use the Network URL Vite prints; do not use localhost in VITE_API_URL on the phone.";
    }
    throw new Error((e?.message || "Network error") + hint);
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    let msg = data?.message || res.statusText;
    if (res.status === 502) {
      msg =
        "Cannot reach API (Bad Gateway). Start the backend in a terminal: cd backend → npm run dev — then refresh.";
    }
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  signup: (body) => request("/api/auth/signup", { method: "POST", body }),
  login: (body) => request("/api/auth/login", { method: "POST", body }),
  me: () => request("/api/auth/me"),
  updateProfile: (body) => request("/api/auth/profile", { method: "PATCH", body }),

  chefDishes: () => request("/api/chef/dishes"),
  createDish: (formData) =>
    request("/api/chef/dishes", { method: "POST", body: formData, isForm: true }),
  updateDish: (id, formData) =>
    request(`/api/chef/dishes/${id}`, { method: "PATCH", body: formData, isForm: true }),
  chefAnalytics: () => request("/api/chef/analytics"),

  feed: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/customer/feed${q ? `?${q}` : ""}`);
  },
  placeOrder: (body) => request("/api/customer/orders", { method: "POST", body }),
  myOrders: () => request("/api/customer/orders"),

  riderAvailability: (body) => request("/api/rider/availability", { method: "PATCH", body }),
  riderOrders: () => request("/api/rider/orders"),
  acceptOrder: (id) => request(`/api/rider/orders/${id}/accept`, { method: "POST" }),
  riderStatus: (id, status) =>
    request(`/api/rider/orders/${id}/status`, { method: "PATCH", body: { status } }),
};

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${base}${path}`;
}
