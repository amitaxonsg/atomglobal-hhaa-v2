const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

async function publicRequest(path, payload) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const requestAdminPasswordReset = email => publicRequest("/admin/password-reset/request", { email });
export const confirmAdminPasswordReset = (token, password) => publicRequest("/admin/password-reset/confirm", { token, password });
