import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { swManager } from "./lib/serviceWorker";

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
