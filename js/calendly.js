"use strict";
import { lockPage, unlockPage, removeShadowAfterClosing } from "./overlay.js";

// The "Schedule a session" panel, with Calendly's scheduler embedded in it

const CALENDLY_URL = "https://calendly.com/yasdle/30min";
let isCalendlyRendered = false;

// Calendly only accepts 6-digit hex colors, so resolve the theme's CSS variables through the browser.
// Always the light palette (read outside <body>, which carries data-theme); dark mode inverts the
// iframe in CSS, so it works on any Calendly plan and follows theme toggles without a reload.
function themeColorAsHex(variableName) {
  const probe = document.createElement("span");
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
    whenCalendlyReady(() => {
      Calendly.initInlineWidget({
        url: getCalendlyUrl(),
        parentElement: panel.querySelector(".calendly-content"),
      });
    });
  }
}

export function closeCalendly() {
  const panel = document.querySelector(".calendly-container");
  panel.classList.remove("active");
  removeShadowAfterClosing(panel);
  unlockPage("calendly");
}
