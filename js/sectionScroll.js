"use strict";

export const SECTION_STACK_OFFSET = 8;
const WHEEL_QUIET_MS = 200;
const SWIPE_THRESHOLD = 50;
const SCROLL_LOCK_FALLBACK_MS = 1000;
const IGNORED_AREAS =
  ".navigation, .settings-container, .experience-details-container, .feedback, .notification, .calendly-container";

let isAnimating = false;
let lastWheelTime = 0;
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
    document.body.style.overflowY === "hidden" ||
    (target instanceof Element && target.closest(IGNORED_AREAS) !== null)
  );
}

function onWheel(e) {
  if (e.ctrlKey || shouldIgnore(e.target)) return;
  e.preventDefault();

  // One gesture = one step: trackpad inertia keeps firing events, so wait for a pause
  const now = Date.now();
  const isNewGesture = now - lastWheelTime > WHEEL_QUIET_MS;
  lastWheelTime = now;
  if (!isNewGesture || Math.abs(e.deltaY) < 4) return;

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
