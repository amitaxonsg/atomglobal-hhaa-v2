import React from "react";
import { createRoot } from "react-dom/client";
import AssessmentApp from "./components/AssessmentApp";
import AppErrorBoundary from "./components/shared/AppErrorBoundary";
import "./styles.css";
import "./brand-overrides.css";

function ServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return undefined;

    let mounted = true;
    const hadController = Boolean(navigator.serviceWorker.controller);
    const showUpdate = () => { if (mounted && hadController) setUpdateAvailable(true); };
    const onControllerChange = () => showUpdate();

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(__APP_BUILD_VERSION__)}`, { updateViaCache: "none" })
      .then(registration => {
        const watchInstallingWorker = worker => {
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed") showUpdate();
          });
        };
        watchInstallingWorker(registration.installing);
        registration.addEventListener("updatefound", () => watchInstallingWorker(registration.installing));
        return registration.update();
      })
      .catch(error => { if (import.meta.env.DEV) console.error("Service worker registration failed", error); });

    return () => {
      mounted = false;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!updateAvailable) return null;
  return <aside className="update-notice" role="status">
    <span>A new version is available. Reload.</span>
    <button type="button" onClick={() => window.location.reload()}>Reload</button>
  </aside>;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AssessmentApp />
      <ServiceWorkerUpdate />
    </AppErrorBoundary>
  </React.StrictMode>,
);
