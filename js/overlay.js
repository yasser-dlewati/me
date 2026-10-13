"use strict";

// Tracks the open side panels, newest on top, and:
// - marks <html data-overlay="..."> while any is open, so CSS can lock, blur and disable the page
//   behind them (OVERLAYS in css/main.css). The page unlocks only when the last panel closes.
// - closes the top panel when a click lands outside it.
// - keeps keyboard focus and screen readers out of what can't be seen (inert): closed panels, which
//   sit off-screen, and the page behind an open panel.
// - marks a panel <... data-busy> while it works (sending feedback), so CSS can show its loading
//   overlay and blur its contents, and makes it inert so it can't be used or closed by a click
//   outside until the work ends.
const openPanels = new Map();

const PANELS = [".navigation", ".settings-container", ".experience-details-container", ".calendly-container", "form.feedback", ".notification"];
const PAGE_BEHIND = [".content", ".menu-icon", "ul.screen.indicator", "footer"];

function sync() {
  const root = document.documentElement;
  const locked = openPanels.size > 0;
  if (locked) {
    root.dataset.overlay = [...openPanels.keys()].join(" ");
  } else {
    delete root.dataset.overlay;
  }
  PAGE_BEHIND.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.inert = locked;
  });
}

function updateInert(panel) {
  panel.inert = !panel.classList.contains("active") || "busy" in panel.dataset;
}

// Panels open and close by their "active" class, so follow that rather than every open/close function
PANELS.forEach((selector) => {
  const panel = document.querySelector(selector);
  if (!panel) return;
  updateInert(panel);
  new MutationObserver(() => updateInert(panel)).observe(panel, { attributes: true, attributeFilter: ["class"] });
});

export function showBusy(panel) {
  panel.dataset.busy = "";
  updateInert(panel);
}

export function hideBusy(panel) {
  delete panel.dataset.busy;
  updateInert(panel);
}

// elements: what counts as inside the panel; close: called with the click event on a click outside them
export function lockPage(panelName, { elements = [], close = null } = {}) {
  // Reopening moves a panel back to the top
  openPanels.delete(panelName);
  openPanels.set(panelName, { elements, close });
  sync();
}

export function unlockPage(panelName) {
  openPanels.delete(panelName);
  sync();
}

export function isPageLocked() {
  return openPanels.size > 0;
}

function topPanel() {
  return [...openPanels.values()].at(-1);
}

// The top panel when the current click started. A click that opens or closes a panel itself
// (a button, a close icon) changes the top, so it is left alone instead of closing another panel
let topAtClickStart = null;

document.addEventListener("click", () => {
  topAtClickStart = topPanel();
}, true);

document.addEventListener("click", (event) => {
  const top = topPanel();
  const startedOnSameTop = top === topAtClickStart;
  topAtClickStart = null;
  if (!top || !top.close || !startedOnSameTop) return;
  if (top.elements.some((element) => element?.contains(event.target))) return;
  // A busy panel is inert, so a click on it lands on the page and would look like a click outside.
  // It stays open until its work ends
  if (top.elements.some((element) => element && "busy" in element.dataset)) return;
  top.close(event);
});

// Keep the edge shadow while the panel slides out, then drop it so no line shows at the screen edge
export function removeShadowAfterClosing(panel) {
  let fallback;
  const removeShadow = (e) => {
    if (e && (e.target !== panel || e.propertyName !== "transform")) return;
    clearTimeout(fallback);
    panel.removeEventListener("transitionend", removeShadow);
    if (!panel.classList.contains("active")) {
      panel.style.boxShadow = "none";
    }
  };
  panel.addEventListener("transitionend", removeShadow);
  fallback = setTimeout(removeShadow, 1000);
}
