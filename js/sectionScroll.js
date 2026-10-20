"use strict";
import { isPageLocked } from "./overlay.js";

export const SECTION_STACK_OFFSET = 4;
const WHEEL_QUIET_MS = 200;
// Wheel events per average when telling a fresh swipe from a coasting one
const WHEEL_HISTORY = 8;
const SWIPE_THRESHOLD = 50;
const SCROLL_LOCK_FALLBACK_MS = 1000;
const IGNORED_AREAS =
  ".navigation, .settings-container, .experience-details-container, .feedback, .notification, .scheduler-container";

let isAnimating = false;
let lastWheelTime = 0;
let recentDeltas = [];
let gestureStepped = false;
let unlockTimeout;
let touchStart = null;

// Scroll positions where each stacked section has just slid fully into place, plus the footer
function getSnapPoints() {
  const sections = document.querySelectorAll("section");
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  let flowTop = 0;
  const points = [...sections].map((section, index) => {
    const point = flowTop - index * SECTION_STACK_OFFSET;
    flowTop += section.offsetHeight;
    return Math.min(Math.max(point, 0), maxScroll);
  });

  if (maxScroll - points[points.length - 1] > 20) {
    points.push(maxScroll);
  }
  return points;
}

function unlock() {
  clearTimeout(unlockTimeout);
  window.removeEventListener("scrollend", unlock);
  isAnimating = false;
}

// Sections stay in the viewport while stacked, so reverse their reveal as soon as we head back up
function hideRevealsBelow(index) {
  document.querySelectorAll("section").forEach((section, sectionIndex) => {
    if (sectionIndex > index) {
      section.querySelectorAll(".reveal.visible").forEach((el) => el.classList.remove("visible"));
    }
  });
}

export function scrollToSection(index) {
  const points = getSnapPoints();
  const target = points[Math.min(Math.max(index, 0), points.length - 1)];
  if (Math.abs(window.scrollY - target) < 2) return;

  if (target < window.scrollY) {
    hideRevealsBelow(index);
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  isAnimating = true;
  window.addEventListener("scrollend", unlock);
  unlockTimeout = setTimeout(unlock, SCROLL_LOCK_FALLBACK_MS);
  window.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" });
}

function step(direction) {
  if (isAnimating) return;
  const points = getSnapPoints();
  const scrollY = window.scrollY;
  const index =
    direction > 0
      ? points.findIndex((point) => point > scrollY + 2)
      : points.findLastIndex((point) => point < scrollY - 2);
  if (index !== -1) scrollToSection(index);
}

function shouldIgnore(target) {
  return (
    isPageLocked() ||
    (target instanceof Element && target.closest(IGNORED_AREAS) !== null)
  );
}

function onWheel(e) {
  if (e.ctrlKey || shouldIgnore(e.target)) return;
  e.preventDefault();

  // One gesture = one step: trackpad inertia keeps firing events, so a new gesture is either one
  // after a pause, or (once the page has settled) one that speeds up again, since inertia only
  // ever slows down; a swipe made while the last one is still coasting never leaves a pause.
  // A trackpad swipe starts with tiny deltas, so the step waits for the first real one
  // rather than writing off the whole gesture
  const now = Date.now();
  const delta = Math.abs(e.deltaY);
  if (now - lastWheelTime > WHEEL_QUIET_MS) {
    gestureStepped = false;
    recentDeltas = [];
  }
  lastWheelTime = now;
  // Speeding up is judged on averages, so the jitter in a coasting trackpad isn't mistaken for it
  recentDeltas.push(delta);
  if (recentDeltas.length > WHEEL_HISTORY * 2) recentDeltas.shift();
  if (!isAnimating && delta >= 4 && recentDeltas.length === WHEEL_HISTORY * 2) {
    const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
    const older = mean(recentDeltas.slice(0, WHEEL_HISTORY));
    const newer = mean(recentDeltas.slice(WHEEL_HISTORY));
    if (newer > older * 1.3) gestureStepped = false;
  }
  if (gestureStepped || delta < 4) return;

  gestureStepped = true;
  // Only what comes after the step counts toward the next one, not this swipe's own run-up
  recentDeltas = [];
  step(Math.sign(e.deltaY));
}

function onTouchStart(e) {
  touchStart = shouldIgnore(e.target)
    ? null
    : { x: e.touches[0].clientX, y: e.touches[0].clientY };
}

function onTouchMove(e) {
  if (!touchStart) return;
  const dx = e.touches[0].clientX - touchStart.x;
  const dy = e.touches[0].clientY - touchStart.y;
  // Leave horizontal swipes alone so the clients carousel still works
  if (Math.abs(dy) > Math.abs(dx)) e.preventDefault();
}

function onTouchEnd(e) {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = touchStart.y - e.changedTouches[0].clientY;
  touchStart = null;
  if (Math.abs(dy) > SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
    step(Math.sign(dy));
  }
}

function onKeyDown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey || shouldIgnore(e.target)) return;
  if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
  // Space presses a focused button; taking it for scrolling would make the button unusable by keyboard
  if (e.key === " " && e.target.closest?.("button, summary, [role='button']")) return;

  const directions = {
    ArrowDown: 1,
    PageDown: 1,
    ArrowUp: -1,
    PageUp: -1,
    " ": e.shiftKey ? -1 : 1,
  };

  if (e.key in directions) {
    e.preventDefault();
    step(directions[e.key]);
  } else if (e.key === "Home") {
    e.preventDefault();
    scrollToSection(0);
  } else if (e.key === "End") {
    e.preventDefault();
    scrollToSection(Infinity);
  }
}

export function initSectionScroll() {
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("keydown", onKeyDown);
}
