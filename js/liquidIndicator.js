"use strict";

// The indicators' current dots are drops of liquid: moving on, each stretches toward its next dot
// first, then its tail catches up with a small slosh. Used by the section indicator (vertical) and
// the clients indicator (horizontal, three current dots at once on desktop, each its own drop). Both
// only toggle "active" on their dots; this follows those classes, so their own code doesn't change
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

// Past this distance the tail doesn't overshoot, so a long jump never squashes a drop flat
const SLOSH_MAX_DISTANCE = 24;
// Several drops move as a wave, the front one first, each next one once the one ahead has made room,
// so stretching never joins them
const WAVE_STEP_SECONDS = 0.22;
// ...played at this pace, so the whole wave (about 1s at full length) ends with the carousel's own
// slide, about 0.3s, the time its arrows wait between clicks. A single drop (phones, the section
// indicator) keeps the full length
const WAVE_PACE = 0.3;

export function attachLiquidDrop(container, { vertical }) {
  const [startSide, endSide] = vertical ? ["top", "bottom"] : ["left", "right"];
  // One per current dot, matched in order, each remembering where it last sat
  const drops = [];
  container.classList.add("has-drop");

  function createDrop() {
    const element = document.createElement("span");
    element.className = "indicator-drop";
    element.setAttribute("aria-hidden", "true");
    container.appendChild(element);
    return { element, last: null };
  }

  function move(drop, start, end, length, animate, delay, pace) {
    const { element, last } = drop;
    const moved = last ? start - last.start || end - last.end : 0;

    if (!animate || !moved || reducedMotion.matches) {
      element.style.transition = "none";
    } else {
      // The edge in the direction of travel leads; the other follows and settles past its mark
      const towardEnd = moved > 0;
      const slosh = Math.abs(moved) <= SLOSH_MAX_DISTANCE
        ? "cubic-bezier(0.4, 0, 0.2, 1.3)"
        : "cubic-bezier(0.4, 0, 0.2, 1)";
      const s = (seconds) => `${(seconds * pace).toFixed(3)}s`;
      const lead = `${towardEnd ? endSide : startSide} ${s(0.28)} cubic-bezier(0.3, 0, 0.2, 1) ${s(delay)}`;
      const tail = `${towardEnd ? startSide : endSide} ${s(0.42)} ${slosh} ${s(delay + 0.14)}`;
      element.style.transition = `${lead}, ${tail}`;
    }

    element.style[startSide] = `${start}px`;
    element.style[endSide] = `${length - end}px`;
    drop.last = { start, end };
  }

  function place(animate) {
    const dots = [...container.querySelectorAll("li.active")];
    const length = vertical ? container.clientHeight : container.clientWidth;
    // Not on screen yet: the resize observer places the drops once it's shown
    if (!length) {
      dots.length = 0;
    }

    // A changed number of current dots (a re-render, or none: the clients counter) starts afresh
    if (drops.length !== dots.length) {
      drops.splice(0).forEach((drop) => drop.element.remove());
      dots.forEach(() => drops.push(createDrop()));
      animate = false;
    }

    if (!dots.length) return;
    const targets = dots.map((dot) => vertical
      ? [dot.offsetTop, dot.offsetTop + dot.offsetHeight]
      : [dot.offsetLeft, dot.offsetLeft + dot.offsetWidth]);
    // The wave's front is the drop furthest along the direction of travel
    const towardEnd = drops[0].last ? targets[0][0] > drops[0].last.start : true;
    targets.forEach(([start, end], i) => {
      const ahead = targets.filter(([other]) => (towardEnd ? other > start : other < start)).length;
      move(drops[i], start, end, length, animate, ahead * WAVE_STEP_SECONDS, drops.length > 1 ? WAVE_PACE : 1);
    });
  }

  new MutationObserver((records) => {
    // A re-render (the clients list) replaces the dots, and the drops with them
    if (drops.some((drop) => !drop.element.isConnected)) {
      drops.splice(0).forEach((drop) => drop.element.remove());
      place(false);
      return;
    }
    if (records.some((record) => record.type === "attributes")) place(true);
  }).observe(container, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });

  new ResizeObserver(() => place(false)).observe(container);
  place(false);
}
