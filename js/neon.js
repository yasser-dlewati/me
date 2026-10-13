"use strict";

// The glowing parts of the page flicker now and then like neon tubes: at a random moment, one of
// them on screen stutters off and on a few times, with a new pattern each time. The "lit" look is
// the NEON GLOW in css/main.css. Nothing flickers for visitors who prefer reduced motion
const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");

const MIN_GAP_MS = 2500;
const MAX_GAP_MS = 7000;

const SINGLES = "section h2, .button, .icon-button, .scroll-horizontally, footer .social-links a, #top .scroll, " +
  ".navigation .links a";

const random = (min, max) => min + Math.random() * (max - min);

// Each target is a group that flickers as one: a single element, or a logo. A logo's glow is on the
// logo itself and its dimming on its two halves, so the trait chips inside the hero logo don't dim
function collectTargets() {
  const singles = [...document.querySelectorAll(SINGLES)].map((element) => [element]);
  const logos = [...document.querySelectorAll(".logo")].map((logo) =>
    [logo, ...logo.querySelectorAll(":scope > .top, :scope > .bottom")]);
  return [...singles, ...logos];
}

// In view, fully faded in, and not covered: sections stack as they scroll, so an element can sit
// inside the viewport under the next section, or under an open panel. A flicker's lit frames would
// jump a fading element (a reveal, or the menu's links) to full opacity
function isOnScreen(element) {
  const box = element.getBoundingClientRect();
  if (!box.width || box.bottom <= 0 || box.top >= innerHeight) return false;
  if (getComputedStyle(element).opacity !== "1") return false;
  const visibleMiddle = (Math.max(box.top, 0) + Math.min(box.bottom, innerHeight)) / 2;
  return element.contains(document.elementFromPoint(box.left + box.width / 2, visibleMiddle));
}

// steps() makes every change instant, like a tube cutting out rather than fading. The pattern is
// drawn once so a group's elements flicker in step, each from its own lit glow
function flicker(group) {
  const drops = Math.floor(random(2, 5));
  const pattern = Array.from({ length: drops * 2 }, () => random(0.05, 0.95))
    .sort((a, b) => a - b)
    .map((offset, index) => ({ offset, unlit: index % 2 === 0, dim: random(0.4, 0.75) }));
  const duration = random(400, 1100);

  group.forEach((element) => {
    const style = getComputedStyle(element);
    const dims = !element.matches(".logo");
    const lit = { opacity: 1, textShadow: style.textShadow, boxShadow: style.boxShadow, easing: "steps(1, end)" };
    const keyframes = [
      { ...lit, offset: 0 },
      ...pattern.map(({ offset, unlit, dim }) => unlit
        ? { opacity: dims ? dim : 1, textShadow: "none", boxShadow: "none", easing: "steps(1, end)", offset }
        : { ...lit, offset }),
      { ...lit, offset: 1 },
    ];
    element.animate(keyframes, duration);
  });
}

export function initNeonFlicker() {
  (function scheduleNext() {
    setTimeout(() => {
      if (!reducedMotionQuery.matches && !document.hidden) {
        const visible = collectTargets().filter((group) => group.length && isOnScreen(group[0]));
        if (visible.length) flicker(visible[Math.floor(Math.random() * visible.length)]);
      }
      scheduleNext();
    }, random(MIN_GAP_MS, MAX_GAP_MS));
  })();
}
