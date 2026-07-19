const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";

async function post(path, payload) {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export function requestAdminPasswordReset(email) {
  return post("/admin/password-reset/request", { email });
}

export function confirmAdminPasswordReset(token, password) {
  return post("/admin/password-reset/confirm", { token, password });
}
