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
// - closes the top panel on Escape, moves focus to a panel's close button when it opens, and back
//   to what opened it when it closes.
import { panels, menuIcon, screenIndicator, footer } from "./dom.js";

const openPanels = new Map();

const pageBehind = [document.querySelector(".content"), menuIcon, screenIndicator, footer];

function sync() {
  const root = document.documentElement;
  const locked = openPanels.size > 0;
  if (locked) {
    root.dataset.overlay = [...openPanels.keys()].join(" ");
  } else {
    delete root.dataset.overlay;
  }
  pageBehind.forEach((element) => {
    if (element) element.inert = locked;
  });
}

function updateInert(panel) {
  panel.inert = !panel.classList.contains("active") || "busy" in panel.dataset;
}

// Panels open and close by their "active" class, so follow that rather than every open/close function
panels.forEach((panel) => {
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

// elements: what counts as inside the panel, the panel itself first; close: called with the click
// event on a click outside them, and with no event on Escape
export function lockPage(panelName, { elements = [], close = null } = {}) {
  // Taken before the page behind goes inert, which would drop focus from the opener. A reopened
  // panel keeps the opener it had
  const returnFocus = openPanels.get(panelName)?.returnFocus ?? document.activeElement;
  // Reopening moves a panel back to the top
  openPanels.delete(panelName);
  openPanels.set(panelName, { elements, close, returnFocus });
  sync();

  const panel = elements[0];
  if (panel) {
    // The class observer only clears inert after this task, too late to focus inside the panel
    updateInert(panel);
    panel.querySelector(".close")?.focus({ preventScroll: true });
  }
}

export function unlockPage(panelName) {
  const entry = openPanels.get(panelName);
  openPanels.delete(panelName);
  sync();
  // Back to the opener, unless it has since been re-rendered (a language change) or focus has already
  // moved on (the page behind is no longer inert after sync)
  const opener = entry?.returnFocus;
  const focusIsInPanel = entry?.elements.some((element) => element?.contains(document.activeElement));
  if (opener?.isConnected && opener !== document.body && (focusIsInPanel || document.activeElement === document.body)) {
    opener.focus({ preventScroll: true });
  }
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

// Escape closes the top panel, as a click outside it would, unless it's busy
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const top = topPanel();
  if (!top || !top.close) return;
  if (top.elements.some((element) => element && "busy" in element.dataset)) return;
  event.preventDefault();
  top.close();
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
