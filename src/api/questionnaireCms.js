import { landingDefaults } from "../data/assessmentExperience";

const mode = import.meta.env.VITE_API_MODE || "mock";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
let mockLanding = { ...landingDefaults };
let mockLiveTrackKey = "personal";

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload;
}

async function csrfToken() {
  const response = await fetch(`${baseUrl}/csrf`, { credentials: "include" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.token) throw new Error(payload.message || "Unable to establish a secure editing session.");
  return payload.token;
}

export async function adminQuestionnaireConfiguration() {
  if (mode === "mock") return { landing: mockLanding, liveTrackKey: mockLiveTrackKey, tracks: {} };
  return jsonRequest("/admin/assessment-experience");
}

export async function saveQuestionnaireLanding(payload) {
  if (mode === "mock") {
    mockLanding = { ...mockLanding, ...payload };
    return mockLanding;
  }
  const token = await csrfToken();
  return jsonRequest("/admin/assessment-experience/landing", {
    method: "PUT",
    headers: { "X-CSRF-Token": token },
    body: JSON.stringify(payload),
  });
}

export async function saveLiveAssessment(trackKey) {
  if (mode === "mock") {
    mockLiveTrackKey = trackKey;
    return { liveTrackKey: trackKey };
  }
  const token = await csrfToken();
  return jsonRequest("/admin/assessment-experience/live-track", {
    method: "PUT",
    headers: { "X-CSRF-Token": token },
    body: JSON.stringify({ trackKey }),
  });
}
