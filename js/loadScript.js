"use strict";

// For third-party scripts most visitors never need (feedback, Calendly): loaded the first time
// they're used instead of on every visit
const scriptLoads = new Map();

// Loads a script once; a failed load can be tried again later
export function loadScript(url) {
  if (!scriptLoads.has(url)) {
    scriptLoads.set(url, new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = () => {
        scriptLoads.delete(url);
        script.remove();
        reject(new Error(`Couldn't load ${url}`));
      };
      document.head.appendChild(script);
    }));
  }
  return scriptLoads.get(url);
}
