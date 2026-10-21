"use strict";
import { lockPage, unlockPage, removeShadowAfterClosing } from "./overlay.js";
import { t } from "./i18n.js";
import { schedulerContainer as panel } from "./dom.js";

// The "Schedule a session" panel, with a Google Calendar appointment schedule embedded in it.
// Google books the slot, adds a Meet link and emails the invite to both sides.

const SCHEDULE_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ389ko-jngYFkqNBZZpGf1UjAgEe6bJ6Qp4wWtGr00YD3-gLuWEOxibMXjdpFhrBRNchAHYPYAB?gv=true";
const content = panel.querySelector(".scheduler-content");
let isScheduleRendered = false;

export function openScheduler() {
  panel.classList.add("active");
  panel.style.boxShadow = "var(--menu-box-shadow)";
  lockPage("scheduler", { elements: [panel], close: closeScheduler });

  // Loaded on the first open rather than with the page (most visitors never schedule a session),
  // then kept, so reopening doesn't reload the schedule
  if (!isScheduleRendered) {
    isScheduleRendered = true;
    const frame = document.createElement("iframe");
    frame.src = SCHEDULE_URL;
    frame.title = t("about.session");
    showSpinnerUntilLoaded(content, frame);
    content.appendChild(frame);
  }
}

// The timeout reveals the frame anyway if it never finishes loading (e.g. a stalled connection)
function showSpinnerUntilLoaded(content, frame) {
  content.classList.add("loading");
  const reveal = () => {
    content.classList.remove("loading");
    clearTimeout(fallback);
  };
  const fallback = setTimeout(reveal, 15000);
  frame.addEventListener("load", reveal, { once: true });
}

export function closeScheduler() {
  panel.classList.remove("active");
  removeShadowAfterClosing(panel);
  unlockPage("scheduler");
}
