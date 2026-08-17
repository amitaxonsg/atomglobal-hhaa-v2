import React from "react";
import { createRoot } from "react-dom/client";
import { api } from "./api/client";

function UatPaymentToggle() {
  const [enabled, setEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await api.adminSettings(["system"]);
      const system = data?.system || {};
      setEnabled(Boolean(system.uatNoPaymentEnabled ?? system.uat_no_payment_enabled ?? false));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const toggle = async () => {
    const next = !enabled;
    setBusy(true);
    setMessage("");
    try {
      await api.saveSettings("system", { uatNoPaymentEnabled: next });
      setEnabled(next);
      setMessage(next ? "UAT no-payment checkout is ON." : "UAT no-payment checkout is OFF.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return <section className="admin-card" style={{ marginBottom: 18 }}>
    <div className="card-heading">
      <div>
        <h2>UAT checkout</h2>
        <small>Temporary client-testing bypass. Stripe remains unchanged.</small>
      </div>
      <button className={`button ${enabled ? "button--primary" : ""}`} type="button" disabled={loading || busy} onClick={toggle}>
        {loading ? "Checking…" : busy ? "Saving…" : enabled ? "Disable no-payment UAT" : "Enable no-payment UAT"}
      </button>
    </div>
    <p className="hint">When enabled, a completed participant sees a separate “UAT test — unlock without payment” option beside the normal Stripe checkout. Disable this immediately after UAT.</p>
    {message && <p className="hint" role="status">{message}</p>}
  </section>;
}

let mount = null;
let root = null;

function updateMount() {
  if (!window.location.pathname.startsWith("/admin")) return;
  const main = document.querySelector(".admin-main");
  const active = document.querySelector(".admin-context-bar strong")?.textContent?.trim() === "Payments";
  if (!main || !active) {
    if (mount) mount.hidden = true;
    return;
  }

  if (!mount || !mount.isConnected) {
    mount = document.createElement("div");
    mount.id = "uat-payment-admin-root";
    const contextBar = main.querySelector(".admin-context-bar");
    if (contextBar?.nextSibling) main.insertBefore(mount, contextBar.nextSibling);
    else main.appendChild(mount);
    root = createRoot(mount);
    root.render(<UatPaymentToggle />);
  }
  mount.hidden = false;
}

function install() {
  if (!window.location.pathname.startsWith("/admin")) return;
  const observer = new MutationObserver(updateMount);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  updateMount();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
else install();
