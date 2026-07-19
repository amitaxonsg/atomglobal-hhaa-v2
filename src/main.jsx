import React from "react";
import { createRoot } from "react-dom/client";
import AssessmentApp from "./components/AssessmentApp";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AssessmentApp />
  </React.StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.PROD) navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
