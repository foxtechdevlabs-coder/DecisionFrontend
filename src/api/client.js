const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body — fall through with data = null
  }

  if (!response.ok && !data) {
    throw new Error("Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  registerParticipant: (payload) => request("/participants/register", { method: "POST", body: payload }),
  getOffers: () => request("/offers"),
  spin: (token) => request("/spin", { method: "POST", token }),
  adminLogin: (payload) => request("/admin/login", { method: "POST", body: payload }),
  adminStats: (token) => request("/admin/stats", { token }),
  adminParticipants: (token, query = {}) => {
    const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== "" && v != null));
    const qs = params.toString();
    return request(`/admin/participants${qs ? `?${qs}` : ""}`, { token });
  },
  adminGetOffers: (token) => request("/admin/offers", { token }),
  adminCreateOffer: (token, payload) => request("/admin/offers", { method: "POST", body: payload, token }),
  adminUpdateOffer: (token, id, payload) =>
    request(`/admin/offers/${id}`, { method: "PUT", body: payload, token }),
  adminDeleteOffer: (token, id, { force = false } = {}) =>
    request(`/admin/offers/${id}${force ? "?force=true" : ""}`, { method: "DELETE", token }),
};
