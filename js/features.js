"use strict";

// Feature flags, read at runtime from features.json at the site root, so turning a feature on or off
// only takes editing that file. A flag is on only when the file says true: if the file can't be read,
// everything flagged stays off.
// Markup marked data-feature="name" shows only while the flag is on, and data-feature-off="name" only
// while it's off (css/main.css, keyed off <html data-features>).

const FEATURES_URL = new URL("../features.json", import.meta.url);

let featuresReady = null;
function loadFeatures() {
  // no-cache: revalidated on each visit, so a flipped flag applies on the next page load
  featuresReady ??= fetch(FEATURES_URL, { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error(`Feature flags request failed: ${res.status}`);
      return res.json();
    })
    .catch((error) => {
      console.log("Feature flags unavailable, all off:", error);
      return {};
    });
  return featuresReady;
}

export async function isEnabled(name) {
  return (await loadFeatures())[name] === true;
}

export async function applyFeatures() {
  const features = await loadFeatures();
  const enabled = Object.keys(features).filter((name) => features[name] === true);
  document.documentElement.dataset.features = enabled.join(" ");
}
