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

// Motion tuning. The chips play peek-a-boo with the logo: every so often a chip oozes out from
// under a random point of one of its edges, stays stuck to it for a moment (wobbling like
// jelly), then slurps back in. They come out on their own clocks, so several are out at once.
// Every chip gets a turn (in random order) before any repeats.
// Ranges are [min, max] and a fresh random value is picked each time
const MOTION = {
  hold: [2, 3],               // s a chip stays out (it also stays while hovered or focused)
  pause: [0.4, 1.2],          // s between one chip peeking out and the next
  maxOut: 4,                  // most chips out at once
  emerge: 0.9,                // s to ooze out, including the jelly settle
  dive: 0.55,                 // s to slurp back in
  lingerAfterHover: 1,        // s a chip stays once the pointer or focus leaves it, if its time is up
  stretch: 0.16,              // how far a chip stretches away from the logo as it pops out (0.16 = 16%)
  drops: [1, 5],              // liquid drops splashed off as a chip pops out or slurps in
  dropSize: [3, 9],           // px across a drop
  dropFling: [12, 38],        // px a drop flies before it falls
  dropFall: [14, 40],         // px a drop falls by the end
  dropLife: [0.45, 0.85],     // s a drop lasts
  introDelay: 1.2,            // s before the first round (after the photo fades in)
};

// Page chrome the chips never land on
const PROTECTED = [".menu-icon", "ul.screen.indicator", "#top .scroll", ".feedback-icon .circle"];
const EDGE_MARGIN = 12;
const CHROME_MARGIN = 32;
// px a chip's stuck edge sits under the logo, so no seam shows; matches --trait-tuck in css/main.css
const TUCK = 2;
// Keeps chips off the logo's rounded corners: --border-radius-large plus room for a chip's liquid
// feet (--trait-foot) in css/main.css
const CORNER_CLEARANCE = 32 + 12;
const CHIP_GAP = 16;
const SPOT_TRIES = 60;

const rand = ([min, max]) => min + Math.random() * (max - min);

let chips = [];
let roundTimer = 0;
let rendered = false;
// Clicking the logo hides the chips: those out dive back in and no new rounds start until shown again
let traitsHidden = false;

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
// Matches the mobile breakpoint in css/main.css
const narrowQuery = window.matchMedia("(max-width: 767px)");

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

// Open the tooltip away from the logo (or toward the middle of the screen for chips on its sides)
function placeTooltip(chip) {
  if (!chip.spot) return;
  const { rect, side } = chip.spot;
  const up = side === "top" || (side !== "bottom" && (rect.top + rect.bottom) / 2 > window.innerHeight / 2);
  chip.li.classList.toggle("tip-up", up);
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
    // How far the chip has to sink to hide fully behind the logo
    depth: (side === "top" || side === "bottom" ? h : w) + TUCK,
    rect: { left, top, right: left + w, bottom: top + h },
  });

  // Spots stick to the logo: a random point of one of its straight edges, tucked just under it.
  // Each edge holds one chip at a time (until that chip is fully back in), so the most out at
  // once is one per side
  // On phones the logo nearly fills the width, so chips only come out of its top and bottom edges
  const taken = new Set(outChips.map((other) => other.spot.side));
  const edges = narrowQuery.matches ? ["top", "bottom"] : ["top", "bottom", "left", "right"];
  const sides = edges.filter((side) => !taken.has(side));
  if (sides.length === 0 && !force) return null;
  // A random start along an edge, clear of its rounded corners (centered if the chip is too long)
  const along = (from, to, size) => {
    const min = from + CORNER_CLEARANCE;
    const max = to - CORNER_CLEARANCE - size;
    return max > min ? rand([min, max]) : (from + to - size) / 2;
  };
  const candidate = () => {
    switch (sides[Math.floor(Math.random() * sides.length)]) {
      case "top": return spotAt(along(logo.left, logo.right, w), logo.top + TUCK - h, "top");
      case "bottom": return spotAt(along(logo.left, logo.right, w), logo.bottom - TUCK, "bottom");
      case "left": return spotAt(logo.left + TUCK - w, along(logo.top, logo.bottom, h), "left");
      default: return spotAt(logo.right - TUCK, along(logo.top, logo.bottom, h), "right");
    }
  };

  for (let i = 0; i < SPOT_TRIES && sides.length > 0; i++) {
    const spot = candidate();
    const { rect } = spot;
    if (rect.left < EDGE_MARGIN || rect.top < EDGE_MARGIN || rect.right > vw - EDGE_MARGIN || rect.bottom > vh - EDGE_MARGIN) continue;
    if ([...chrome, ...others].some((r) => overlaps(spot.rect, r))) continue;
    return spot;
  }
  // A chip brought out by the keyboard has to show somewhere: stuck under the middle of the logo
  return force ? spotAt(cx - w / 2, logo.bottom - TUCK, "bottom") : null;
}

// A chip's pose relative to its spot: `out` runs from 0 (sunk behind the logo) to 1 (at its spot);
// `along` scales it away from the logo and `across` parallel to the logo's edge. It scales from
// the edge stuck to the logo (transform-origin in css/main.css), so that edge never comes loose
const pose = (spot, { out = 1, along = 1, across = 1, opacity = 1 } = {}) => {
  const sink = spot.depth * (1 - out);
  const vertical = spot.side === "top" || spot.side === "bottom";
  const dx = spot.side === "left" ? sink : spot.side === "right" ? -sink : 0;
  const dy = spot.side === "top" ? sink : spot.side === "bottom" ? -sink : 0;
  const [sx, sy] = vertical ? [across, along] : [along, across];
  return {
    transform: `translate(${(spot.x + dx).toFixed(1)}px, ${(spot.y + dy).toFixed(1)}px) translate(-50%, -50%) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`,
    opacity,
  };
};
// Where the chip is right now, so an animation can take over mid-flight without a jump
function currentKey(chip) {
  const style = getComputedStyle(chip.float);
  return { transform: style.transform === "none" ? pose(chip.spot, { out: 0 }).transform : style.transform, opacity: style.opacity };
}

function emerge(chip, { force = false } = {}) {
  const spot = chip.state === "diving" && chip.spot ? chip.spot : findSpot(chip, force);
  if (!spot) return false;
  const reduced = reducedMotionQuery.matches;
  const s = MOTION.stretch;
  const fromIn = chip.state === "in";

  chip.spot = spot;
  chip.li.dataset.side = spot.side;
  const from = fromIn ? pose(spot, { out: 0, across: 0.75, opacity: 0 }) : currentKey(chip);
  const duration = reduced ? 200 : MOTION.emerge * 1000;
  chip.state = "out";
  chip.timeUp = false;
  chip.li.classList.add("out");
  // Its idle wobble starts at a random point, so the chips out together don't wobble in step
  chip.button.style.animationDelay = `${(-Math.random() * 3).toFixed(2)}s`;
  chip.anim?.cancel();
  chip.anim = chip.float.animate(
    reduced
      ? [{ ...pose(spot), opacity: fromIn ? 0 : from.opacity }, pose(spot)]
      // Oozes out from under the edge, overshoots into a long stretch, then settles like jelly
      : [
        { ...from, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
        { opacity: 1, offset: 0.12 },
        { ...pose(spot, { along: 1 + s, across: 1 - s * 0.6 }), offset: 0.42, easing: "ease-in-out" },
        { ...pose(spot, { along: 1 - s * 0.6, across: 1 + s * 0.35 }), offset: 0.6, easing: "ease-in-out" },
        { ...pose(spot, { along: 1 + s * 0.3, across: 1 - s * 0.15 }), offset: 0.76, easing: "ease-in-out" },
        { ...pose(spot, { along: 1 - s * 0.1, across: 1 + s * 0.05 }), offset: 0.9, easing: "ease-in-out" },
        pose(spot),
      ],
    { duration, fill: "forwards" },
  );
  // Drops spray off its feet as it hits the full stretch
  if (fromIn && !reduced) splash(spot, "emerge", duration * 0.38);

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
  const s = MOTION.stretch;
  const from = currentKey(chip);
  const { spot } = chip;
  chip.state = "diving";
  chip.anim?.cancel();
  const anim = chip.float.animate(
    reduced
      ? [from, { ...from, opacity: 0 }]
      // Bunches up against the logo, then gets slurped back under its edge, thinning as it goes
      : [
        { ...from, easing: "ease-out" },
        { ...pose(spot, { along: 1 - s, across: 1 + s * 0.5 }), offset: 0.25, easing: "cubic-bezier(0.5, 0, 0.8, 0.4)" },
        { ...pose(spot, { out: 0.55, along: 1 + s * 0.6, across: 1 - s * 0.8 }), offset: 0.6 },
        { opacity: 1, offset: 0.85 },
        pose(spot, { out: 0, across: 0.7, opacity: 0 }),
      ],
    { duration: reduced ? 200 : MOTION.dive * 1000, fill: "forwards" },
  );
  chip.anim = anim;
  // Drops pinch off its far end as it gets pulled in
  if (!reduced) splash(spot, "dive", MOTION.dive * 1000 * 0.3);
  anim.finished.then(() => {
    chip.state = "in";
    chip.spot = null;
    chip.li.classList.remove("out", "tip-up", "tip-end");
  // Cancelled: something else (hover, a re-render) took over the chip
  }).catch(() => {});
}

// A few liquid drops thrown off a chip: on "emerge" they spray out from where its feet meet the
// logo's edge; on "dive" they pinch off its far end. Either way they arc out and fall, shrinking
// away. They live in the chips' list, positioned from the logo's center like the chips
function splash(spot, mode, delay) {
  const list = document.querySelector("#top .characteristics");
  if (!list) return;
  const { rect, side } = spot;
  // Viewport to logo-center coordinates (the spot's rect was measured in the viewport)
  const ox = spot.x - (rect.left + rect.right) / 2;
  const oy = spot.y - (rect.top + rect.bottom) / 2;
  // Outward from the logo, and along its edge
  const [nx, ny] = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] }[side];
  const [tx, ty] = [Math.abs(ny), Math.abs(nx)];
  const foot = 10;

  const count = Math.round(rand(MOTION.drops));
  for (let i = 0; i < count; i++) {
    let x;
    let y;
    if (side === "top" || side === "bottom") {
      x = rand([rect.left - foot, rect.right + foot]);
      y = mode === "emerge" ? (side === "top" ? rect.bottom - TUCK : rect.top + TUCK) : (side === "top" ? rect.top : rect.bottom);
    } else {
      y = rand([rect.top - foot, rect.bottom + foot]);
      x = mode === "emerge" ? (side === "left" ? rect.right - TUCK : rect.left + TUCK) : (side === "left" ? rect.left : rect.right);
    }
    x += ox;
    y += oy;

    // Emerging drops fly farther and fan out along the edge; pinched-off ones mostly drip
    const fling = rand(MOTION.dropFling) * (mode === "emerge" ? 1 : 0.4);
    const spread = rand([-1, 1]) * fling * (mode === "emerge" ? 0.9 : 0.5);
    const vx = nx * fling + tx * spread;
    const vy = ny * fling + ty * spread;
    const fall = rand(MOTION.dropFall);
    const size = rand(MOTION.dropSize);
    const at = (dx, dy, scale) => `translate(${(x + dx).toFixed(1)}px, ${(y + dy).toFixed(1)}px) translate(-50%, -50%) scale(${scale})`;

    const drop = document.createElement("li");
    drop.className = "trait-drop";
    drop.setAttribute("aria-hidden", "true");
    drop.style.width = drop.style.height = `${size.toFixed(1)}px`;
    list.append(drop);
    drop.animate([
      { transform: at(0, 0, 0), easing: "cubic-bezier(0.2, 0.8, 0.4, 1)" },
      { transform: at(vx * 0.3, vy * 0.3, 1.15), offset: 0.15, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)" },
      { transform: at(vx * 0.85, vy * 0.85 + fall * 0.15, 1), offset: 0.5, easing: "cubic-bezier(0.5, 0, 0.9, 0.6)" },
      { transform: at(vx, vy + fall, 0), opacity: 0.6 },
    ], { duration: rand(MOTION.dropLife) * 1000, delay: delay + rand([0, 80]), fill: "both" })
      .finished.then(() => drop.remove(), () => drop.remove());
  }
}

// Called once from main.js at start-up; the chips themselves render when the language is applied
export function initTraits() {
  // The logo's size follows the screen, so a resize would leave chips that are out floating off its
  // edges: they slurp back in and the next rounds bring them out against the new edges
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      chips.forEach((chip) => {
        if (chip.state === "out") dive(chip);
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
