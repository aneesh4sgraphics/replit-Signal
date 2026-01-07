import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { swManager } from "./lib/serviceWorker";
import { checkAndUpdateVersion } from "./lib/cache";

// Suppress ResizeObserver loop errors - these are harmless browser warnings
// that occur when ResizeObserver callbacks cause layout changes
const resizeObserverErr = (e: ErrorEvent) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded') {
    e.stopImmediatePropagation();
    e.preventDefault();
    return;
  }
};
window.addEventListener('error', resizeObserverErr);

// Check and update cache version on app startup
checkAndUpdateVersion().catch(error => {
  console.error('Cache version check failed:', error);
});

// Register service worker in production
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    swManager.register().catch(error => {
      console.error('Service worker registration failed:', error);
    });
  });
}

// Expose service worker manager globally for debugging
if (import.meta.env.DEV) {
  (window as any).swManager = swManager;
}

createRoot(document.getElementById("root")!).render(<App />);
