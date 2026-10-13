"use strict";
import { lockPage, unlockPage, removeShadowAfterClosing } from "./overlay.js";

// The "Schedule a session" panel, with Calendly's scheduler embedded in it

const CALENDLY_URL = "https://calendly.com/yasdle/30min";
let isCalendlyRendered = false;

// Calendly only accepts 6-digit hex colors, so resolve the theme's CSS variables through the browser.
// Always the light palette (the probe is marked data-theme="light"); dark mode inverts the
// iframe in CSS, so it works on any Calendly plan and follows theme toggles without a reload.
function themeColorAsHex(variableName) {
  const probe = document.createElement("span");
  probe.dataset.theme = "light";
  probe.style.color = `var(${variableName})`;
  document.documentElement.appendChild(probe);
  const [r, g, b] = getComputedStyle(probe).color.match(/\d+/g).map(Number);
  probe.remove();
  return [r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function getCalendlyUrl() {
  const params = new URLSearchParams({
    hide_gdpr_banner: "1",
    background_color: themeColorAsHex("--bg-dark-color"),
    text_color: themeColorAsHex("--text-dark-color"),
    primary_color: themeColorAsHex("--text-darkest-color"),
  });
  return `${CALENDLY_URL}?${params}`;
}

// Calendly's script loads async, so it may not be ready on the first click
function whenCalendlyReady(callback) {
  if (window.Calendly) {
    callback();
  } else {
    document
      .querySelector('script[src*="calendly.com"]')
      .addEventListener("load", callback, { once: true });
  }
}

export function openCalendly() {
  const panel = document.querySelector(".calendly-container");
  panel.classList.add("active");
  panel.style.boxShadow = "var(--menu-box-shadow)";
  lockPage("calendly", { elements: [panel], close: closeCalendly });

  // Render once and keep it, so reopening doesn't reload the scheduler
  if (!isCalendlyRendered) {
    isCalendlyRendered = true;
    const content = panel.querySelector(".calendly-content");
    showSpinnerUntilLoaded(content);
    whenCalendlyReady(() => {
      Calendly.initInlineWidget({
        url: getCalendlyUrl(),
        parentElement: content,
      });
    });
  }
}

// Calendly posts "calendly.event_type_viewed" once the scheduler is on screen; the timeout
// reveals the frame anyway if that message never comes (e.g. Calendly shows an error page)
function showSpinnerUntilLoaded(content) {
  content.classList.add("loading");
  const reveal = () => {
    content.classList.remove("loading");
    window.removeEventListener("message", onMessage);
    clearTimeout(fallback);
  };
  const onMessage = (event) => {
    if (event.origin === "https://calendly.com" && event.data?.event === "calendly.event_type_viewed") {
      reveal();
    }
  };
  const fallback = setTimeout(reveal, 15000);
  window.addEventListener("message", onMessage);
}

export function closeCalendly() {
  const panel = document.querySelector(".calendly-container");
  panel.classList.remove("active");
  removeShadowAfterClosing(panel);
  unlockPage("calendly");
}
