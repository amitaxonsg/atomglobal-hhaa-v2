import React from "react";
import { createRoot } from "react-dom/client";
import "./stripe-connect-settings.css";

let csrfToken = "";
let enhancementRoot = null;
let enhancementMount = null;
let currentManualSection = null;
let currentStripeActive = false;
let manualOpenState = false;

async function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = { ...(options.headers || {}) };
  if (!["GET", "HEAD"].includes(method)) {
    if (!csrfToken) {
      const csrfResponse = await fetch("/api/csrf", { credentials: "include" });
      const csrfPayload = await csrfResponse.json().catch(() => ({}));
      if (!csrfResponse.ok || !csrfPayload.token) throw new Error(csrfPayload.message || "Unable to initialise a secure request.");
      csrfToken = csrfPayload.token;
    }
    headers["X-CSRF-Token"] = csrfToken;
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(path, { credentials: "include", ...options, method, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 419) csrfToken = "";
    throw new Error(payload.message || "Request failed.");
  }
  return payload;
}

function statusText(status) {
  if (!status) return "Checking Stripe…";
  if (status.connected) return status.checkoutReady ? "Connected and ready" : "Connected — setup incomplete";
  if (status.manualConfigured) return "Manual Stripe setup available";
  return "Not connected";
}

function StripeConnectPanel({ onManualChange }) {
  const [status, setStatus] = React.useState(null);
  const [amounts, setAmounts] = React.useState({ personal: "", newjoiner: "", manager: "", executive: "" });
  const [busy, setBusy] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");
  const [manualOpen, setManualOpen] = React.useState(false);

  const applyStatus = React.useCallback(next => {
    setStatus(next);
    setAmounts(Object.fromEntries((next.prices || []).map(item => [item.key, item.amount])));
  }, []);

  const refresh = React.useCallback(async () => {
    setError("");
    try {
      applyStatus(await request("/api/admin/stripe/status"));
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [applyStatus]);

  React.useEffect(() => { refresh(); }, [refresh]);
  React.useEffect(() => { onManualChange(manualOpen); }, [manualOpen, onManualChange]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("stripe");
    if (!result) return;
    if (result === "connected") setNotice("Stripe account connected. Confirm the four USD prices below, then create or update the Stripe prices.");
    if (result === "error") setError(params.get("message") || "Stripe connection was not completed.");
    params.delete("stripe");
    params.delete("message");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, []);

  const startConnection = async () => {
    setBusy("connect"); setError(""); setNotice("");
    try {
      const result = await request("/api/admin/stripe/connect/start", { method: "POST", body: "{}" });
      window.location.assign(result.url);
    } catch (requestError) {
      setError(requestError.message); setBusy("");
    }
  };

  const savePrices = async () => {
    setBusy("prices"); setError(""); setNotice("");
    try {
      const next = await request("/api/admin/stripe/prices", { method: "POST", body: JSON.stringify({ prices: amounts }) });
      applyStatus(next);
      setNotice("The four one-time report prices were saved in USD and their Stripe Price IDs were stored securely.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const testConnection = async () => {
    setBusy("test"); setError(""); setNotice("");
    try {
      const result = await request("/api/admin/stripe/test", { method: "POST", body: "{}" });
      setNotice(result.message);
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const disconnect = async () => {
    if (!window.confirm("Disconnect this Stripe account? Existing payment records and the manual fallback settings will remain unchanged.")) return;
    setBusy("disconnect"); setError(""); setNotice("");
    try {
      const next = await request("/api/admin/stripe/disconnect", { method: "POST", body: "{}" });
      applyStatus(next);
      setNotice("Stripe Connect was disconnected. The existing manual Stripe configuration remains available under Advanced setup.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const priceRows = status?.prices || [
    { key: "personal", label: "Personal", amount: "" },
    { key: "newjoiner", label: "New Joiner", amount: "" },
    { key: "manager", label: "Manager", amount: "" },
    { key: "executive", label: "Executive", amount: "" },
  ];

  return <section className="stripe-connect-panel" aria-label="Stripe connection and USD pricing">
    <div className="stripe-connect-panel__heading">
      <div>
        <span className="stripe-connect-panel__eyebrow">Stripe payments</span>
        <h2>Connect Stripe and manage prices in USD</h2>
        <p>Sunil can sign in to Stripe and approve the connection. Existing checkout, report unlocking, refunds, payment emails, affiliate commissions and manual configuration remain in place.</p>
      </div>
      <span className={`stripe-connect-status ${status?.checkoutReady ? "ready" : status?.connected ? "warning" : ""}`}>{statusText(status)}</span>
    </div>

    {notice && <div className="stripe-connect-message" role="status">{notice}</div>}
    {error && <div className="stripe-connect-message stripe-connect-message--error" role="alert">{error}</div>}

    <div className="stripe-connect-card">
      <div className="stripe-connect-account">
        <div>
          <h3>{status?.connected ? status.accountName || "Connected Stripe account" : "Stripe account connection"}</h3>
          {status?.connected
            ? <p>{status.accountEmail || status.accountId} · {status.accountCountry || "Country not supplied"} · {String(status.mode || "test").toUpperCase()}</p>
            : <p>Use Stripe’s secure sign-in and authorisation screen. No Stripe password is entered or stored here.</p>}
        </div>
        <div className="stripe-connect-actions">
          {!status?.connected && <button className="button button--primary" type="button" disabled={busy || !status?.platformReady} onClick={startConnection}>{busy === "connect" ? "Opening Stripe…" : "Connect with Stripe"}</button>}
          {status?.connected && <button className="button" type="button" disabled={busy} onClick={testConnection}>{busy === "test" ? "Testing…" : "Test connection"}</button>}
          {status?.connected && <button className="button stripe-connect-danger" type="button" disabled={busy} onClick={disconnect}>{busy === "disconnect" ? "Disconnecting…" : "Disconnect"}</button>}
        </div>
      </div>
      {!status?.platformReady && <p className="stripe-connect-requirement">The button will activate after the VPS environment receives the Stripe Connect client ID, platform secret and callback URL. These values stay outside Git.</p>}
      {status?.connected && !status.connectWebhookReady && <p className="stripe-connect-requirement">Connected account webhook signing is still missing on the VPS. Checkout will remain unavailable until it is configured and tested.</p>}
    </div>

    <div className="stripe-connect-card">
      <div className="stripe-connect-pricing-heading">
        <div><h3>Full Report prices</h3><p>All four amounts are one-time prices in <strong>USD</strong>.</p></div>
        <strong className="stripe-connect-currency">USD</strong>
      </div>
      <div className="stripe-connect-price-grid">
        {priceRows.map(item => <label key={item.key}>
          <span>{item.label}</span>
          <span className="stripe-connect-money"><b>USD</b><input type="number" inputMode="decimal" min="0.50" max="10000" step="0.01" value={amounts[item.key] ?? item.amount ?? ""} onChange={event => setAmounts(current => ({ ...current, [item.key]: event.target.value }))} /></span>
          <small>{item.configured ? "Stripe Price configured" : "Stripe Price not created yet"}</small>
        </label>)}
      </div>
      <div className="stripe-connect-price-actions">
        <button className="button button--primary" type="button" disabled={busy || (!status?.connected && !status?.manualConfigured)} onClick={savePrices}>{busy === "prices" ? "Saving USD prices…" : "Create or update Stripe prices"}</button>
        <button className="button" type="button" disabled={busy} onClick={refresh}>Refresh status</button>
      </div>
      {!status?.connected && !status?.manualConfigured && <p className="hint">Connect Stripe first, or open Advanced manual configuration and save the existing API credentials.</p>}
    </div>

    <div className="stripe-connect-advanced">
      <button type="button" className="stripe-connect-advanced__toggle" aria-expanded={manualOpen} onClick={() => setManualOpen(open => !open)}>{manualOpen ? "Hide" : "Show"} advanced manual configuration</button>
      <p>The original test/live mode, API keys, webhook secret and four Price ID fields are preserved as a fallback.</p>
    </div>
  </section>;
}

function stripeSettingsElements() {
  const tabs = document.querySelector(".settings-tabs");
  if (!tabs) return null;
  const stripeTab = [...tabs.querySelectorAll("button")].find(button => button.textContent.trim().toLowerCase() === "stripe");
  let grid = tabs.nextElementSibling;
  while (grid && !grid.classList.contains("admin-grid")) grid = grid.nextElementSibling;
  const manualSection = grid?.querySelector(":scope > section.admin-card.editor-form") || null;
  return { tabs, stripeTab, grid, manualSection };
}

function updateEnhancement() {
  if (!window.location.pathname.startsWith("/admin")) return;
  const elements = stripeSettingsElements();
  if (!elements) {
    currentManualSection = null;
    currentStripeActive = false;
    document.documentElement.classList.remove("stripe-connect-settings-active");
    return;
  }
  const active = elements.stripeTab?.classList.contains("active");

  if (!enhancementMount || !enhancementMount.isConnected) {
    if (enhancementRoot) enhancementRoot.unmount();
    enhancementMount = document.createElement("div");
    enhancementMount.id = "stripe-connect-settings-root";
    elements.tabs.insertAdjacentElement("afterend", enhancementMount);
    enhancementRoot = createRoot(enhancementMount);
    enhancementRoot.render(<StripeConnectPanel onManualChange={open => {
      manualOpenState = open;
      currentManualSection?.classList.toggle("stripe-manual-config--open", open && currentStripeActive);
    }} />);
  }

  currentManualSection = elements.manualSection;
  if (currentManualSection) {
    currentManualSection.classList.add("stripe-manual-config");
    currentManualSection.classList.toggle("stripe-manual-config--open", Boolean(active && manualOpenState));
  }
  enhancementMount.hidden = !active;
  document.documentElement.classList.toggle("stripe-connect-settings-active", Boolean(active));
  currentStripeActive = Boolean(active);
}

function openStripeSettingsFromReturn() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("stripe")) return;
  const settingsButton = [...document.querySelectorAll(".admin-sidebar nav button")].find(button => button.textContent.trim() === "Settings");
  if (settingsButton && !settingsButton.classList.contains("active")) settingsButton.click();
  window.setTimeout(() => {
    const stripeTab = [...document.querySelectorAll(".settings-tabs button")].find(button => button.textContent.trim().toLowerCase() === "stripe");
    if (stripeTab && !stripeTab.classList.contains("active")) stripeTab.click();
  }, 80);
}

function installStripeSettingsEnhancement() {
  if (!window.location.pathname.startsWith("/admin")) return;
  const observer = new MutationObserver(() => {
    openStripeSettingsFromReturn();
    const previousActive = currentStripeActive;
    updateEnhancement();
    if (previousActive !== currentStripeActive) window.dispatchEvent(new Event("resize"));
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  openStripeSettingsFromReturn();
  updateEnhancement();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installStripeSettingsEnhancement, { once: true });
else installStripeSettingsEnhancement();
