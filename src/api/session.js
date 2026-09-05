const PARTICIPANT_KEY = "foxtech_participant_session";
const ADMIN_KEY = "foxtech_admin_token";

export const participantSession = {
  save({ token, participantId, name }) {
    sessionStorage.setItem(PARTICIPANT_KEY, JSON.stringify({ token, participantId, name }));
  },
  load() {
    try {
      const raw = sessionStorage.getItem(PARTICIPANT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clear() {
    sessionStorage.removeItem(PARTICIPANT_KEY);
  },
};

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
