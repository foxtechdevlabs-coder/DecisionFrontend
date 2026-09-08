const ADMIN_KEY = "foxtech_admin_token";

// There is no equivalent participant-session store: the decision wheel is
// reached only via its own shared link/QR and always requires entering a
// coupon code there (see CouponEntry) — no persisted session bypasses that.
export const adminSession = {
  save(token) {
    localStorage.setItem(ADMIN_KEY, token);
  },
  load() {
    return localStorage.getItem(ADMIN_KEY);
  },
  clear() {
    localStorage.removeItem(ADMIN_KEY);
  },
};
