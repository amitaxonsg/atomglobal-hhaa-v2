import { dashboardData, emailTemplates, stageContent } from "./mockData";

const mode = import.meta.env.VITE_API_MODE || "mock";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const storageKey = "hhaa-v2-preview-session";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Request failed");
  return response.json();
}

const mock = {
  async createSession(payload) {
    const session = { id: crypto.randomUUID(), token: crypto.randomUUID().replaceAll("-", ""), status: "in_progress", updatedAt: new Date().toISOString(), ...payload };
    localStorage.setItem(storageKey, JSON.stringify(session));
    return session;
  },
  async saveSession(payload) {
    const current = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const session = { ...current, ...payload, updatedAt: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(session));
    return session;
  },
  async loadSession() { return JSON.parse(localStorage.getItem(storageKey) || "null"); },
  async completeSession(payload) { return this.saveSession({ ...payload, status: "completed", completedAt: new Date().toISOString() }); },
  async createCheckout(payload) { return { preview: true, url: `${location.pathname}?payment=success&session=${payload.sessionId}` }; },
  async getReport() { return null; },
  async adminDashboard() { return dashboardData; },
  async adminContent() { return stageContent; },
  async emailTemplates() { return emailTemplates; },
};

const production = {
  createSession: (payload) => request("/survey-sessions", { method: "POST", body: JSON.stringify(payload) }),
  saveSession: ({ id, ...payload }) => request(`/survey-sessions/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  loadSession: () => Promise.resolve(null),
  completeSession: ({ id, ...payload }) => request(`/survey-sessions/${id}/complete`, { method: "POST", body: JSON.stringify(payload) }),
  createCheckout: (payload) => request("/payments/checkout", { method: "POST", body: JSON.stringify(payload) }),
  getReport: (token) => request(`/reports/${encodeURIComponent(token)}`),
  adminDashboard: () => request("/admin/dashboard"),
  adminContent: () => request("/admin/content-stages"),
  emailTemplates: () => request("/admin/email-templates"),
};

export const api = mode === "mock" ? mock : production;
export const isMockMode = mode === "mock";
