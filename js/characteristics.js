"use strict"
import { escapeHtml } from "./html.js";
import { t } from "./i18n.js";

// Edit the chips here: icon (Font Awesome solid icon name) and order. Their label and tooltip text
// live in js/i18n.js under traitList, keyed by id.
// Order is priority: wide screens and phones show all, tablets the first five; the first chip
// gets the innermost ring.
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
    id: "mentor",
    icon: "fa-chalkboard-user",
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

// Motion tuning. The chips orbit like planets: every chip has its own ring, all rings share
// the logo's center and are nested from inner to outer, so routes never cross. Each ring has
// its own speed (inner ones faster), plus a light random wander and speed drift on top
const MOTION = {
  period: [24, 60],           // seconds per lap, innermost ring to outermost
  periodJitter: 0.08,         // random +/- share on each lap time, so speeds aren't a neat series
  reverseChance: 0,           // share of chips orbiting counter-clockwise (0 = all the same way)
  speedDrift: 0.15,           // how much each chip speeds up / slows down over time (0-1)
  innerHeight: 0.6,           // innermost ring's height relative to the logo; lower rings pass behind it
  wander: 10,                 // max px of random drift off the ring (kept under half the ring spacing)
  narrowWidth: [0.8, 1],      // phones: ring widths, as a share of the widest that stays on screen
  narrowSideBoost: 4,         // phones: extra speed while passing behind the logo's sides, so more
                              // of each lap is spent in view above and below it (0 = even speed)
  introDelay: 1.2,            // s before the first chip appears (after the photo fades in)
  stagger: 0.1,               // s between chips appearing
};

// Page chrome the chips fade away from, so they never sit on top of it
const PROTECTED = [".menu-icon", "ul.screen.indicator", "#top .scroll", ".feedback-icon .circle"];
const EDGE_MARGIN = 12;
const CHROME_MARGIN = 40;

const rand = ([min, max]) => min + Math.random() * (max - min);
const TAU = Math.PI * 2;

// Orbit/wander parameters survive re-renders (language switch), so chips don't jump
const motionById = new Map();
let chips = [];
let geometry = null;
// Clicking the logo hides the chips; they fade back in one after another when shown again
let traitsHidden = false;
let showFrom = MOTION.introDelay;
let lastElapsed = 0;
let lastFrame = 0;
let startTime = 0;
let frameRequested = false;

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

export function renderCharacteristics() {
  const list = document.querySelector("#top .characteristics");
  if (!list) return;

  list.setAttribute("aria-label", t("traits.list"));
  list.innerHTML = characteristics.map((trait, index) => `
    <li class="trait" style="--i: ${index};" data-id="${escapeHtml(trait.id)}">
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
      motion: motionById.get(li.dataset.id),
      paused: false,
      opacity: 0,
      sepX: 0,
      sepY: 0,
    };

    const button = chip.button;
    const hold = () => { chip.paused = true; placeTooltip(chip); };
    const release = () => {
      chip.paused = li.matches(":hover") || li.contains(document.activeElement);
      if (!chip.paused) button.classList.remove("tooltip-dismissed");
    };
    li.addEventListener("mouseenter", hold);
    li.addEventListener("focusin", hold);
    li.addEventListener("mouseleave", release);
    li.addEventListener("focusout", () => setTimeout(release));
    return chip;
  });

  setupToggle();
  updateToggle();
  measure();
  requestFrame();
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
    chips.forEach((chip) => { chip.paused = false; });
  } else {
    showFrom = lastElapsed;
  }
  updateToggle();
  requestFrame();
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
  const rect = chip.float.getBoundingClientRect();
  chip.li.classList.toggle("tip-up", rect.top + rect.height / 2 > window.innerHeight / 2);
  chip.li.classList.toggle("tip-end", rect.left + rect.width / 2 > window.innerWidth / 2);
}

function measure() {
  const logo = document.querySelector("#top .logo");
  if (!logo) return;
  const box = logo.getBoundingClientRect();

  geometry = {
    cx: box.left + box.width / 2,
    cy: box.top + box.height / 2,
    halfW: logo.offsetWidth / 2,
    halfH: logo.offsetHeight / 2,
    vw: window.innerWidth,
    vh: window.innerHeight,
    protected: PROTECTED.map((selector) => document.querySelector(selector)?.getBoundingClientRect())
      .filter((rect) => rect && rect.width > 0),
  };

  const visible = chips.filter((chip) => chip.li.offsetParent !== null);
  visible.forEach((chip) => {
    chip.w = chip.float.offsetWidth;
    chip.h = chip.float.offsetHeight;
  });
  // Phones: no room for rings beside the logo (it spans nearly the whole width)
  const widest = Math.max(0, ...visible.map((chip) => chip.w));
  geometry.narrow = geometry.vw / 2 - widest / 2 - 56 < geometry.halfW + widest / 2 + 64;
  visible.forEach((chip, index) => {
    chip.motion ??= createMotion(index);
    motionById.set(chip.li.dataset.id, chip.motion);
    fitOrbit(chip, index, visible.length);
  });
  if (geometry.narrow) geometry.zones = freeZones(visible);
}

// The free space on a phone, for chips without motion (placeStill): the strip between the menu
// button and the logo, and the strip between the logo and the scroll cue when the phone is tall
// enough. Values are ranges for a chip's center
function freeZones(visible) {
  const { cy, halfH, vh } = geometry;
  const rectOf = (selector) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
    return rect && rect.height > 0 ? rect : null;
  };
  const half = Math.max(22, ...visible.map((chip) => chip.h / 2));
  // Both only appear after the intro, so fall back to where they will be
  const menuBottom = rectOf(".menu-icon")?.bottom ?? 72;
  const cueTop = (rectOf("#top .scroll")?.top ?? vh * 0.98 - 96) - 25; // it bounces up ~25px

  const topFrom = menuBottom + 8 + half;
  // Very short phones: no clear room above, so the top row grazes the logo's top edge
  const top = [topFrom, Math.max(topFrom, cy - halfH - 8 - half)];
  const bottomFrom = cy + halfH + 8 + half;
  const bottomTo = cueTop - 8 - half;
  const bottom = bottomTo >= bottomFrom ? [bottomFrom, bottomTo] : null;
  return { top, bottom };
}

function createMotion(index) {
  const wave = () => ({ f: rand([0.15, 0.6]), p: rand([0, TAU]) });
  return {
    // Golden-angle start positions keep the chips spread out around the logo
    angle: index * 2.39996 + rand([-0.2, 0.2]),
    direction: Math.random() < MOTION.reverseChance ? -1 : 1,
    periodJitter: 1 + rand([-1, 1]) * MOTION.periodJitter,
    time: 0,
    // Incommensurate sine waves read as random drift rather than a repeating swing
    waves: [wave(), wave(), wave(), wave(), wave()],
  };
}

// Ring sizes run evenly from just outside the logo to the edge of the screen, and lap times
// from fast to slow, so every chip has its own track and its own speed
function fitOrbit(chip, ring, rings) {
  const { halfW, halfH, vw, vh } = geometry;
  const m = chip.motion;
  const t = rings > 1 ? ring / (rings - 1) : 0.5;
  const lerp = (from, to) => from + (to - from) * t;

  let innerRx, outerRx, innerRy;
  if (geometry.narrow) {
    // Phones: rings reach out to the screen's sides, where chips slip behind the logo, and fan out
    // above and below it instead, from just clear of the logo to the screen's top and bottom
    const widestRx = vw / 2 - chip.w / 2 - EDGE_MARGIN;
    [innerRx, outerRx] = MOTION.narrowWidth.map((share) => widestRx * share);
    // The innermost ring grazes the logo's top and bottom edges, chips half tucked behind it
    innerRy = halfH + 8;
  } else {
    innerRx = halfW + chip.w / 2 + 24;
    outerRx = Math.max(innerRx, vw / 2 - chip.w / 2 - 56);
    innerRy = halfH * MOTION.innerHeight;
  }
  // Extra room at the top and bottom: the menu button sits above and the next section peeks in below
  const outerRy = Math.max(innerRy, vh / 2 - chip.h / 2 - 48);

  m.rx = lerp(innerRx, outerRx);
  m.ry = lerp(innerRy, outerRy);
  m.speed = (m.direction * TAU) / (lerp(...MOTION.period) * m.periodJitter);
  // On phones the rings are spread out vertically only
  const spread = geometry.narrow ? outerRy - innerRy : Math.min(outerRx - innerRx, outerRy - innerRy + 40);
  const spacing = rings > 1 ? spread / (rings - 1) : MOTION.wander * 2;
  m.wander = Math.min(MOTION.wander, spacing / 2);
}

function requestFrame() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(frame);
}

function frame(now) {
  frameRequested = false;
  if (!geometry) return;
  startTime ||= now;
  const dt = Math.min((now - (lastFrame || now)) / 1000, 0.05);
  lastFrame = now;
  const elapsed = (now - startTime) / 1000;
  lastElapsed = elapsed;
  const reduced = reducedMotionQuery.matches;
  // Phones without motion: chips sit still in rows above and below the logo
  const rows = reduced && geometry.narrow;

  // Sections stack over the hero, so skip the work while it's covered
  if (window.scrollY < window.innerHeight) {
    const visible = chips.filter((chip) => chip.li.offsetParent !== null && chip.motion);
    visible.forEach((chip) => position(chip, dt, rows, reduced));
    if (!reduced) separate(visible, dt);
    visible.forEach((chip, index) => apply(chip, index, dt, elapsed, rows, reduced));
  }

  // Once hidden chips have faded out there's nothing to animate until they're shown again
  const settled = traitsHidden && chips.every((chip) => chip.opacity === 0);
  if (!reduced && !settled) requestFrame();
}

function position(chip, dt, rows, reduced) {
  const m = chip.motion;
  const [a, b, c, d, e] = m.waves;

  // A chip being read stays exactly where it is
  if (chip.paused && chip.x !== undefined) return;

  if (rows) {
    placeStill(chip);
    return;
  }

  if (!chip.paused && !reduced) {
    m.time += dt;
    const sideBoost = geometry.narrow ? 1 + MOTION.narrowSideBoost * Math.cos(m.angle) ** 2 : 1;
    m.angle += m.speed * (1 + MOTION.speedDrift * Math.sin(a.f * m.time + a.p)) * sideBoost * dt;
  }

  const t = m.time;
  const amount = m.wander ?? MOTION.wander;
  const wanderX = reduced ? 0 : amount * (Math.sin(b.f * t + b.p) + 0.5 * Math.sin(c.f * 1.7 * t + c.p)) / 1.5;
  const wanderY = reduced ? 0 : amount * (Math.sin(d.f * t + d.p) + 0.5 * Math.sin(e.f * 1.9 * t + e.p)) / 1.5;
  chip.rotate = reduced ? 0 : 2.5 * Math.sin(c.f * t + d.p);

  if (reduced) {
    // Without motion, settle into two loose columns beside the logo instead of orbit spots
    const index = chips.indexOf(chip);
    const side = index % 2 === 0 ? -1 : 1;
    const row = Math.floor(index / 2);
    const rows = Math.ceil(chips.filter((other) => other.li.offsetParent !== null).length / 2);
    chip.x = side * (geometry.halfW + chip.w / 2 + 32 + (row % 2) * 28);
    chip.y = -geometry.halfH * 0.75 + (row + 0.5) * ((geometry.halfH * 1.5) / rows);
    chip.scale = 1;
    chip.depth = 0;
    return;
  }

  // Wander and nudges never push a chip past the screen edge (even faded out, it would widen the page)
  const { cx, cy, vw, vh } = geometry;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  chip.x = clamp(m.rx * Math.cos(m.angle) + wanderX + chip.sepX, EDGE_MARGIN - cx + chip.w / 2, vw - EDGE_MARGIN - cx - chip.w / 2);
  chip.y = clamp(m.ry * Math.sin(m.angle) + wanderY + chip.sepY, EDGE_MARGIN - cy + chip.h / 2, vh - EDGE_MARGIN - cy - chip.h / 2);
  // The lower half of each ring reads as nearer, like a tilted solar system: a touch bigger,
  // and stacked in front, so a chip overtaking a neighbor on the next ring passes cleanly
  chip.depth = (Math.sin(m.angle) + 1) / 2;
  chip.scale = 0.92 + 0.1 * chip.depth;
}

// Phones without motion: chips sit in rows in the free areas, as many as fit
function placeStill(chip) {
  const { cx, cy, vw, zones } = geometry;
  const visible = chips.filter((other) => other.li.offsetParent !== null);
  const rows = [zones.top, zones.bottom].filter(Boolean).map((zone) => (zone[0] + zone[1]) / 2);
  let row = 0;
  let x = 16;
  for (const other of visible) {
    if (x + other.w > vw - 16) {
      row++;
      x = 16;
    }
    if (other === chip) break;
    x += other.w + 12;
  }
  chip.x = x + chip.w / 2 - cx;
  chip.y = (rows[row] ?? rows[0]) - cy;
  chip.edgeFade = row < rows.length ? 1 : 0;
  chip.rotate = 0;
  chip.depth = 0.5;
  chip.scale = 1;
}

// Chips on crossing orbits nudge each other aside instead of stacking up:
// each overlapping pair is pushed apart along whichever axis they overlap least
function separate(visible, dt) {
  for (let i = 0; i < visible.length; i++) {
    for (let j = i + 1; j < visible.length; j++) {
      const p = visible[i];
      const q = visible[j];
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const overlapX = (p.w + q.w) / 2 + 16 - Math.abs(dx);
      const overlapY = (p.h + q.h) / 2 + 16 - Math.abs(dy);
      if (overlapX <= 0 || overlapY <= 0) continue;

      // A held chip doesn't move, so the other one takes the whole push
      const share = (chip, other) => (chip.paused ? 0 : other.paused ? 1 : 0.5);
      const step = Math.min(dt * 10, 1);
      if (overlapX < overlapY) {
        const push = overlapX * step * (dx === 0 ? 1 : Math.sign(dx));
        p.sepX -= push * share(p, q);
        q.sepX += push * share(q, p);
      } else {
        const push = overlapY * step * (dy === 0 ? 1 : Math.sign(dy));
        p.sepY -= push * share(p, q);
        q.sepY += push * share(q, p);
      }
    }
  }
  // Ease back onto the orbit once the way is clear
  visible.forEach((chip) => {
    if (chip.paused) return;
    const decay = Math.exp(-dt * 0.6);
    chip.sepX = Math.max(-90, Math.min(90, chip.sepX * decay));
    chip.sepY = Math.max(-90, Math.min(90, chip.sepY * decay));
  });
}

function apply(chip, index, dt, elapsed, rows, reduced) {
  const { cx, cy, vw, vh } = geometry;
  let target = elapsed > showFrom + index * MOTION.stagger || reduced ? 1 : 0;

  if (!chip.paused) {
    const s = chip.scale;
    const rect = {
      left: cx + chip.x - (chip.w * s) / 2,
      right: cx + chip.x + (chip.w * s) / 2,
      top: cy + chip.y - (chip.h * s) / 2,
      bottom: cy + chip.y + (chip.h * s) / 2,
    };
    // Rows of still chips fade at the screen edges by themselves (edgeFade)
    const offScreen = !rows && (rect.left < EDGE_MARGIN || rect.right > vw - EDGE_MARGIN ||
      rect.top < EDGE_MARGIN || rect.bottom > vh - EDGE_MARGIN);
    // Orbits fade out well before reaching the chrome (the scroll cue bounces, so it gets extra room
    // above). Phones have little room to spare, so there they fade closer to it; still rows are
    // already laid out clear of it, so they only need a thin margin
    const margin = rows ? 4 : geometry.narrow ? CHROME_MARGIN / 3 : CHROME_MARGIN;
    const bounce = rows ? 0 : 24;
    const onChrome = geometry.protected.some((r) =>
      rect.left < r.right + margin && rect.right > r.left - margin &&
      rect.top < r.bottom + margin && rect.bottom > r.top - margin - bounce);
    if (offScreen || onChrome) target = 0;
  }
  if (rows) target *= chip.edgeFade ?? 1;
  if (chip.paused) target = 1;
  if (traitsHidden) target = 0;

  chip.opacity = reduced ? target : chip.opacity + (target - chip.opacity) * Math.min(1, dt * 8);
  // Finish fades exactly, so a hidden chip doesn't linger as a faint ghost once the loop stops
  if (Math.abs(target - chip.opacity) < 0.01) chip.opacity = target;
  chip.float.style.opacity = chip.opacity.toFixed(3);
  // Hiding shrinks chips a little as they fade, so they read as tucking away rather than vanishing
  const scale = chip.scale * (traitsHidden ? 0.8 + 0.2 * chip.opacity : 1);
  chip.float.style.transform =
    `translate(${chip.x.toFixed(1)}px, ${chip.y.toFixed(1)}px) translate(-50%, -50%) rotate(${chip.rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  chip.button.style.pointerEvents = chip.opacity < 0.3 ? "none" : "";
  // Every depth level stays below 0, i.e. behind the logo; a held chip uses the CSS hover level instead
  chip.li.style.zIndex = !reduced && !chip.paused ? String(-10 + Math.round(chip.depth * 8)) : "";
}

let resizeTimer;

// Keeps the chips' motion in step with the window, preferences and keyboard. Called once from
// main.js at start-up; the chips themselves render when the language is applied
export function initTraits() {
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { measure(); requestFrame(); }, 150);
  });
  reducedMotionQuery.addEventListener("change", () => { measure(); requestFrame(); });
  // Re-measure when what the chips steer around changes, instead of on a timer:
  // - the logo, and the page chrome, which appears after the intro and the first scroll (showing or
  //   hiding an element changes its size, which is what a ResizeObserver reports)
  const resized = new ResizeObserver(() => { if (geometry) measure(); });
  ["#top .logo", ...PROTECTED].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) resized.observe(element);
  });
  // - the menu button, which shifts a little per section, once a scroll comes to rest
  //   (a debounce rather than scrollend, which Safari lacks)
  let scrollTimer;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { if (geometry) measure(); }, 150);
  }, { passive: true });
  // - the logo's and chips' sizes, once the web fonts have loaded
  document.fonts?.ready.then(() => { if (geometry) measure(); });

  // Escape closes an open tooltip (hovered or focused) without moving focus;
  // it can show again once the pointer or focus leaves the chip
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll("#top .trait-chip:hover, #top .trait-chip:focus").forEach((chip) => {
      chip.classList.add("tooltip-dismissed");
    });
  });
}
