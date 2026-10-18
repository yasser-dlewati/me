"use strict"
import { escapeHtml } from "./html.js";
import { t } from "./i18n.js";

// Edit the chips here: icon (Font Awesome solid icon name) and order. Their label and tooltip text
// live in js/i18n.js under traitList, keyed by id.
// Which chips show, how many and where is random; tabbing through the list brings each one out in turn.
// Colors and sizes live in css/main.css under CHARACTERISTICS; motion is tuned in MOTION below
export const characteristics = [
  {
    id: "engineer",
    icon: "fa-code",
  },
  {
    id: "dad",
    icon: "fa-heart",
  },
  {
    id: "cars",
    icon: "fa-car",
  },
  {
    id: "diy",
    icon: "fa-book-open",
  },
  {
    id: "team-lead",
    icon: "fa-people-group",
  },
  {
    id: "problem-solver",
    icon: "fa-puzzle-piece",
  },
  {
    id: "learner",
    icon: "fa-seedling",
  },
  {
    id: "tech-enthusiast",
    icon: "fa-microchip",
  },
  {
    id: "marvel",
    icon: "fa-mask",
  },
  {
    id: "millennial",
    icon: "fa-hourglass-half",
  },
];

// Motion tuning. The chips play peek-a-boo with the logo: every so often a chip peeks out from
// behind a random point of one of its edges, stays out for a moment, then dives back in. They
// come out on their own clocks, so several are out at once. Every chip gets a turn (in random
// order) before any repeats.
// Ranges are [min, max] and a fresh random value is picked each time
const MOTION = {
  hold: [2, 3],               // s a chip stays out (it also stays while hovered or focused)
  pause: [0.4, 1.2],          // s between one chip peeking out and the next
  maxOut: 4,                  // most chips out at once
  peek: [6, 14],              // px gap between a chip and the logo's edge
  emerge: [0.45, 0.7],        // s to travel out, scaled by how far the spot is from the logo
  dive: 0.5,                  // s to travel back in
  lingerAfterHover: 1,        // s a chip stays once the pointer or focus leaves it, if its time is up
  tilt: [3, 8],               // degrees a chip is tilted at its spot, randomly left or right
  introDelay: 1.2,            // s before the first round (after the photo fades in)
};

// Page chrome the chips never land on
const PROTECTED = [".menu-icon", "ul.screen.indicator", "#top .scroll", ".feedback-icon .circle"];
const EDGE_MARGIN = 12;
const CHROME_MARGIN = 32;
// Kept under MOTION.peek, so the closest spots still count as clear of the logo
const LOGO_MARGIN = 4;
const CHIP_GAP = 16;
const SPOT_TRIES = 60;

const rand = ([min, max]) => min + Math.random() * (max - min);

let chips = [];
let roundTimer = 0;
let rendered = false;
// Clicking the logo hides the chips: those out dive back in and no new rounds start until shown again
let traitsHidden = false;

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

export function renderCharacteristics() {
  const list = document.querySelector("#top .characteristics");
  if (!list) return;

  // Re-rendering (language switch) starts over: drop the old chips' animations and timers
  clearTimeout(roundTimer);
  chips.forEach((chip) => {
    clearTimeout(chip.timer);
    chip.anim?.cancel();
  });
  queue = [];

  list.setAttribute("aria-label", t("traits.list"));
  list.innerHTML = characteristics.map((trait) => `
    <li class="trait" data-id="${escapeHtml(trait.id)}">
      <div class="trait-float">
        <button type="button" class="trait-chip" aria-describedby="trait-tip-${escapeHtml(trait.id)}">
          <i class="trait-icon fa-solid ${escapeHtml(trait.icon)}" aria-hidden="true"></i>
          <span class="trait-label" dir="auto">${escapeHtml(t(`traitList.${trait.id}.label`))}</span>
        </button>
        <span class="trait-tooltip" role="tooltip" id="trait-tip-${escapeHtml(trait.id)}" dir="auto">${escapeHtml(t(`traitList.${trait.id}.tooltip`))}</span>
      </div>
    </li>
  `).join("");

  chips = [...list.querySelectorAll(".trait")].map((li) => {
    const chip = {
      li,
      float: li.querySelector(".trait-float"),
      button: li.querySelector(".trait-chip"),
      // "in" (hidden in the logo), "out" (travelling out or showing) or "diving" (travelling back in)
      state: "in",
      spot: null,
      anim: null,
      timer: 0,
      timeUp: false,
      paused: false,
    };

    const button = chip.button;
    const hold = () => {
      if (traitsHidden) return;
      chip.paused = true;
      // Tabbing to a chip still hidden in the logo brings it out
      if (chip.state !== "out") emerge(chip, { force: true });
      placeTooltip(chip);
    };
    const release = () => {
      chip.paused = li.matches(":hover") || li.contains(document.activeElement);
      if (chip.paused) return;
      button.classList.remove("tooltip-dismissed");
      if (chip.state === "out" && chip.timeUp) {
        clearTimeout(chip.timer);
        chip.timer = setTimeout(() => { if (!chip.paused) dive(chip); }, MOTION.lingerAfterHover * 1000);
      }
    };
    li.addEventListener("mouseenter", hold);
    li.addEventListener("focusin", hold);
    li.addEventListener("mouseleave", release);
    li.addEventListener("focusout", () => setTimeout(release));
    return chip;
  });

  setupToggle();
  updateToggle();
  scheduleRound(rendered ? 0.5 : MOTION.introDelay);
  rendered = true;
}

// The logo holds the page's h1, so it isn't turned into a button itself (that would hide the
// heading from screen readers). Pointer users click the logo; keyboard users get a toggle
// button that only appears when tabbed to
function setupToggle() {
  const logo = document.querySelector("#top .logo");
  if (!logo || logo.querySelector(".traits-toggle")) return;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "traits-toggle visually-hidden-focusable";
  toggle.setAttribute("aria-controls", "traits-list");
  logo.insertBefore(toggle, logo.querySelector(".characteristics"));
  toggle.addEventListener("click", toggleTraits);
  // Section scrolling takes Space for "next section"; keep it for pressing the button
  toggle.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") e.stopPropagation();
  });

  logo.addEventListener("click", (e) => {
    // Tapping a chip shows its tooltip; only the logo itself toggles
    if (e.target.closest(".characteristics, .traits-toggle")) return;
    toggleTraits();
  });
}

function toggleTraits() {
  traitsHidden = !traitsHidden;
  if (traitsHidden) {
    clearTimeout(roundTimer);
    chips.forEach((chip) => {
      chip.paused = false;
      if (chip.state === "out") dive(chip);
    });
  } else {
    scheduleRound(0.3);
  }
  updateToggle();
}

function updateToggle() {
  const logo = document.querySelector("#top .logo");
  const list = document.querySelector("#top .characteristics");
  const toggle = logo?.querySelector(".traits-toggle");
  if (!toggle || !list) return;

  const label = t(traitsHidden ? "traits.show" : "traits.hide");
  toggle.textContent = label;
  toggle.setAttribute("aria-expanded", String(!traitsHidden));
  logo.title = label;
  list.id = "traits-list";
  // Hidden chips can't be tabbed to, hovered or read out
  list.inert = traitsHidden;
}

// Open the tooltip toward the middle of the screen, whichever side of it the chip is on
function placeTooltip(chip) {
  if (!chip.spot) return;
  const { rect } = chip.spot;
  chip.li.classList.toggle("tip-up", (rect.top + rect.bottom) / 2 > window.innerHeight / 2);
  chip.li.classList.toggle("tip-end", (rect.left + rect.right) / 2 > window.innerWidth / 2);
}

function scheduleRound(delay) {
  clearTimeout(roundTimer);
  roundTimer = setTimeout(round, delay * 1000);
}

// One round: the next chip in line peeks out, unless enough are out already. Rounds keep
// coming whether or not the earlier chips are back in
function round() {
  if (traitsHidden) return;
  scheduleRound(rand(MOTION.pause));
  // Sections stack over the hero, so wait while it's covered or the tab is in the background
  if (window.scrollY >= window.innerHeight || document.hidden) return;
  if (chips.filter((chip) => chip.state !== "in").length >= MOTION.maxOut) return;

  // Try the chips in line until one finds room; if none does, the next round tries again
  for (let tries = chips.length; tries > 0; tries--) {
    const chip = nextInLine();
    if (chip && chip.state === "in" && chip.li.offsetParent !== null && emerge(chip)) return;
  }
}

// A shuffled queue of the chips, refilled once everyone has had a turn
let queue = [];
function nextInLine() {
  if (queue.length === 0) {
    queue = [...chips];
    shuffle(queue);
  }
  return queue.shift();
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

// A random spot on screen, clear of the logo, the page chrome and the other chips that are out.
// Returns its offset from the logo's center (where the chips sit while hidden)
function findSpot(chip, force) {
  const logo = document.querySelector("#top .logo")?.getBoundingClientRect();
  if (!logo) return null;
  const cx = logo.left + logo.width / 2;
  const cy = logo.top + logo.height / 2;
  const w = chip.float.offsetWidth;
  const h = chip.float.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;

  const grow = (r, by, extraTop = 0) => ({
    left: r.left - by, right: r.right + by, top: r.top - by - extraTop, bottom: r.bottom + by,
  });
  const logoArea = grow(logo, LOGO_MARGIN);
  const chrome = PROTECTED.map((selector) => document.querySelector(selector)?.getBoundingClientRect())
    .filter((r) => r && r.width > 0)
    // The scroll cue bounces up, so everything gets a little extra room above
    .map((r) => grow(r, CHROME_MARGIN, 24));
  const outChips = chips.filter((other) => other !== chip && other.spot && other.state !== "in");
  const others = outChips.map((other) => grow(other.spot.rect, CHIP_GAP));
  const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  const spotAt = (left, top, side) => ({
    side,
    x: left + w / 2 - cx,
    y: top + h / 2 - cy,
    rotate: rand(MOTION.tilt) * (Math.random() < 0.5 ? -1 : 1),
    rect: { left, top, right: left + w, bottom: top + h },
  });

  // Spots hug the logo: just past a random point of one of its edges. Each edge holds one chip
  // at a time (until that chip is fully back in), so the most out at once is one per side
  const taken = new Set(outChips.map((other) => other.spot.side));
  const sides = ["top", "bottom", "left", "right"].filter((side) => !taken.has(side));
  if (sides.length === 0 && !force) return null;
  const candidate = () => {
    const gap = rand(MOTION.peek);
    const along = (from, to) => rand([from, to]);
    switch (sides[Math.floor(Math.random() * sides.length)]) {
      case "top": return spotAt(along(logo.left - w / 2, logo.right - w / 2), logo.top - gap - h, "top");
      case "bottom": return spotAt(along(logo.left - w / 2, logo.right - w / 2), logo.bottom + gap, "bottom");
      case "left": return spotAt(logo.left - gap - w, along(logo.top, logo.bottom - h), "left");
      default: return spotAt(logo.right + gap, along(logo.top, logo.bottom - h), "right");
    }
  };

  for (let i = 0; i < SPOT_TRIES && sides.length > 0; i++) {
    const spot = candidate();
    const { rect } = spot;
    if (rect.left < EDGE_MARGIN || rect.top < EDGE_MARGIN || rect.right > vw - EDGE_MARGIN || rect.bottom > vh - EDGE_MARGIN) continue;
    if ([logoArea, ...chrome, ...others].some((r) => overlaps(spot.rect, r))) continue;
    return spot;
  }
  // A chip brought out by the keyboard has to show somewhere: just below the logo
  return force ? spotAt(cx - w / 2, Math.min(logo.bottom + LOGO_MARGIN, vh - EDGE_MARGIN - h), "bottom") : null;
}

const hiddenKey = { transform: "translate(0px, 0px) translate(-50%, -50%) rotate(0deg) scale(0.3)", opacity: 0, filter: "blur(4px)" };
const spotKey = (spot) => ({
  transform: `translate(${spot.x.toFixed(1)}px, ${spot.y.toFixed(1)}px) translate(-50%, -50%) rotate(${spot.rotate.toFixed(2)}deg) scale(1)`,
  opacity: 1,
  filter: "blur(0px)",
});
// Where the chip is right now, so an animation can take over mid-flight without a jump
function currentKey(chip) {
  const style = getComputedStyle(chip.float);
  return { transform: style.transform === "none" ? hiddenKey.transform : style.transform, opacity: style.opacity, filter: style.filter };
}

function emerge(chip, { force = false } = {}) {
  const spot = chip.state === "diving" && chip.spot ? chip.spot : findSpot(chip, force);
  if (!spot) return false;
  const from = chip.state === "in" ? hiddenKey : currentKey(chip);
  const reduced = reducedMotionQuery.matches;
  const to = spotKey(spot);
  // Farther spots take a little longer to reach
  const distance = Math.hypot(spot.x, spot.y);
  const duration = reduced ? 200 : 1000 * Math.min(MOTION.emerge[1], MOTION.emerge[0] + distance / 1500);

  chip.spot = spot;
  chip.state = "out";
  chip.timeUp = false;
  chip.li.classList.add("out");
  chip.anim?.cancel();
  chip.anim = chip.float.animate(
    reduced
      ? [{ ...to, opacity: from.opacity, filter: "blur(0px)" }, to]
      // Fully visible a third of the way out, overshooting its spot a touch like it popped out
      : [from, { opacity: 1, offset: 0.35 }, to],
    { duration, easing: reduced ? "linear" : "cubic-bezier(0.34, 1.45, 0.64, 1)", fill: "forwards" },
  );

  clearTimeout(chip.timer);
  chip.timer = setTimeout(() => {
    chip.timeUp = true;
    if (!chip.paused) dive(chip);
  }, duration + rand(MOTION.hold) * 1000);
  return true;
}

function dive(chip) {
  if (chip.state !== "out") return;
  clearTimeout(chip.timer);
  const reduced = reducedMotionQuery.matches;
  const from = currentKey(chip);
  chip.state = "diving";
  chip.anim?.cancel();
  const anim = chip.float.animate(
    reduced
      ? [from, { ...from, opacity: 0 }]
      // Shrinks back toward the logo's center, fading out as it slips behind it
      : [from, { opacity: 1, offset: 0.4 }, hiddenKey],
    { duration: reduced ? 200 : MOTION.dive * 1000, easing: reduced ? "linear" : "cubic-bezier(0.55, 0, 0.75, 0.2)", fill: "forwards" },
  );
  chip.anim = anim;
  anim.finished.then(() => {
    chip.state = "in";
    chip.spot = null;
    chip.li.classList.remove("out", "tip-up", "tip-end");
  // Cancelled: something else (hover, a re-render) took over the chip
  }).catch(() => {});
}

// Called once from main.js at start-up; the chips themselves render when the language is applied
export function initTraits() {
  // Chips that are out stay where they landed on resize; those that would now sit off screen dive in
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      chips.forEach((chip) => {
        const r = chip.spot?.rect;
        if (chip.state === "out" && r && (r.right > vw || r.bottom > vh)) dive(chip);
      });
    }, 150);
  });

  // Escape closes an open tooltip (hovered or focused) without moving focus;
  // it can show again once the pointer or focus leaves the chip
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll("#top .trait-chip:hover, #top .trait-chip:focus").forEach((chip) => {
      chip.classList.add("tooltip-dismissed");
    });
  });
}
