"use strict"

// Edit the chips here: label, icon (Font Awesome solid icon name) and tooltip copy.
// Order is priority: wide screens show all, tablets the first five; on desktop the first chip
// gets the innermost ring. Phones show all of them, each travelling its own straight route.
// Colors and sizes live in css/main.css under CHARACTERISTICS; motion is tuned in MOTION below
export const characteristics = [
  {
    id: "engineer",
    label: "Software engineer",
    labelAr: "مهندس برمجيات",
    tooltip: "Placeholder: what I build and how I like to work.",
    tooltipAr: "نص مؤقت: ما أبنيه وطريقتي في العمل.",
    icon: "fa-code",
  },
  {
    id: "dad",
    label: "Dad",
    labelAr: "أب",
    tooltip: "Placeholder: a line about family life.",
    tooltipAr: "نص مؤقت: سطر عن الحياة العائلية.",
    icon: "fa-heart",
  },
  {
    id: "cars",
    label: "Car enthusiast",
    labelAr: "عاشق للسيارات",
    tooltip: "Placeholder: the cars I love and why.",
    tooltipAr: "نص مؤقت: السيارات التي أحبها ولماذا.",
    icon: "fa-car",
  },
  {
    id: "self-taught",
    label: "Self-taught",
    labelAr: "تعلّم ذاتي",
    tooltip: "Placeholder: how I taught myself to code.",
    tooltipAr: "نص مؤقت: كيف علّمت نفسي البرمجة.",
    icon: "fa-book-open",
  },
  {
    id: "team-lead",
    label: "Team lead",
    labelAr: "قائد فريق",
    tooltip: "Placeholder: what leading a team taught me.",
    tooltipAr: "نص مؤقت: ما تعلمته من قيادة الفريق.",
    icon: "fa-people-group",
  },
  {
    id: "mentor",
    label: "Mentor",
    labelAr: "مرشد",
    tooltip: "Placeholder: who I mentor and how.",
    tooltipAr: "نص مؤقت: من أرشدهم وكيف.",
    icon: "fa-chalkboard-user",
  },
  {
    id: "problem-solver",
    label: "Problem solver",
    labelAr: "محب لحل المشكلات",
    tooltip: "Placeholder: the kind of problems I enjoy.",
    tooltipAr: "نص مؤقت: نوع المشكلات التي أستمتع بحلها.",
    icon: "fa-puzzle-piece",
  },
  {
    id: "learner",
    label: "Lifelong learner",
    labelAr: "متعلم دائم",
    tooltip: "Placeholder: what I'm learning right now.",
    tooltipAr: "نص مؤقت: ما أتعلمه حاليًا.",
    icon: "fa-seedling",
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
  // Phones: each chip travels its own straight route across the screen, then waits and takes a new one
  mobileSpeed: [30, 60],      // px per second, picked per route
  mobilePause: [0.5, 4],      // s a chip waits off-screen before its next route
  maxTravelling: [3, 5],      // chips on screen at once: one free area (short phones) / two
  mobileWander: 3,            // px each chip drifts off its line
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
// Phones: traffic above the logo flows one way and below it the other, picked once per visit
const laneDirection = Math.random() < 0.5 ? 1 : -1;
let lastFrame = 0;
let startTime = 0;
let frameRequested = false;

const desktopQuery = window.matchMedia("(min-width: 768px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

export function renderCharacteristics() {
  const list = document.querySelector("#top .characteristics");
  if (!list) return;

  const isArabic = document.documentElement.lang === "ar";

  list.setAttribute("aria-label", isArabic ? "عني باختصار" : "A bit about me");
  list.innerHTML = characteristics.map((trait, index) => `
    <li class="trait" style="--i: ${index};" data-id="${trait.id}">
      <div class="trait-float">
        <button type="button" class="trait-chip" aria-describedby="trait-tip-${trait.id}">
          <i class="trait-icon fa-solid ${trait.icon}" aria-hidden="true"></i>
          <span class="trait-label" dir="auto">${isArabic ? trait.labelAr : trait.label}</span>
        </button>
        <span class="trait-tooltip" role="tooltip" id="trait-tip-${trait.id}" dir="auto">${isArabic ? trait.tooltipAr : trait.tooltip}</span>
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

  const isArabic = document.documentElement.lang === "ar";
  const label = traitsHidden
    ? (isArabic ? "إظهار الصفات" : "Show traits")
    : (isArabic ? "إخفاء الصفات" : "Hide traits");
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
  visible.forEach((chip, index) => {
    chip.w = chip.float.offsetWidth;
    chip.h = chip.float.offsetHeight;
    chip.motion ??= createMotion(index);
    motionById.set(chip.li.dataset.id, chip.motion);
    fitOrbit(chip, index, visible.length);
  });
  if (!desktopQuery.matches) {
    geometry.zones = freeZones(visible);
    let fresh = false;
    visible.forEach((chip) => {
      const route = chip.route;
      if (!route || route.vw !== geometry.vw) {
        newRoute(chip, true);
        fresh = true;
      } else if (route.zonesKey !== geometry.zones.key) fitRoute(route);
    });
    if (fresh) spreadOut(visible);
  }
}

// Phones have no room for rings around the logo, so chips travel straight routes through the
// free space instead: the strip between the menu button and the logo, and the strip between the
// logo and the scroll cue when the phone is tall enough. Values are ranges for a chip's center
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
  // Very short phones: no clear room above, so routes graze the logo's top edge and slip behind it
  const top = [topFrom, Math.max(topFrom, cy - halfH - 8 - half)];
  const bottomFrom = cy + halfH + 8 + half;
  const bottomTo = cueTop - 8 - half;
  const bottom = bottomTo >= bottomFrom ? [bottomFrom, bottomTo] : null;
  return { top, bottom, key: `${Math.round(top[0])}:${Math.round(top[1])}:${bottom ? Math.round(bottomTo) : "-"}` };
}

// A fresh straight route from one side of the screen to the other, in screen coordinates
function newRoute(chip, initial = false) {
  const { vw, zones } = geometry;
  const off = chip.w / 2 + 8;
  // A gently sloped line through one free area (the taller area picked more often); random ends
  // give every route its own slope. Diagonals across the logo were tried, but on a phone the logo
  // spans nearly the full width, so they only showed as slivers at the screen edges
  const size = (zone) => (zone ? zone[1] - zone[0] + 20 : 0);
  const zone = Math.random() * (size(zones.top) + size(zones.bottom)) < size(zones.top) ? zones.top : zones.bottom;
  const y0 = rand(zone);
  const y1 = rand(zone);
  const leftToRight = (zone === zones.top ? laneDirection : -laneDirection) > 0;

  const x0 = leftToRight ? -off : vw + off;
  const x1 = leftToRight ? vw + off : -off;
  const length = Math.hypot(x1 - x0, y1 - y0);
  chip.route = {
    x0, y0, x1, y1, length,
    speed: rand(MOTION.mobileSpeed),
    // Each route sits at its own depth, so crossing chips pass in front of / behind each other
    depth: Math.random(),
    zone: zone === zones.top ? "top" : "bottom",
    progress: 0,
    wait: initial ? 0 : rand(MOTION.mobilePause),
    zonesKey: zones.key,
    vw,
  };
}

// The free areas shift a little once the menu button and scroll cue appear; keep each route's
// progress and just pull its ends into the nearest free area, so nothing jumps
function fitRoute(route) {
  const { zones } = geometry;
  const nearest = (y) => {
    const options = [zones.top, zones.bottom].filter(Boolean)
      .map((zone) => Math.min(Math.max(y, zone[0]), zone[1]));
    return options.reduce((best, option) => (Math.abs(option - y) < Math.abs(best - y) ? option : best));
  };
  route.y0 = nearest(route.y0);
  route.y1 = nearest(route.y1);
  route.length = Math.hypot(route.x1 - route.x0, route.y1 - route.y0);
  route.zonesKey = zones.key;
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

  const innerRx = halfW + chip.w / 2 + 24;
  const outerRx = Math.max(innerRx, vw / 2 - chip.w / 2 - 56);
  const innerRy = halfH * MOTION.innerHeight;
  // Extra room at the top and bottom: the menu button sits above and the next section peeks in below
  const outerRy = Math.max(innerRy, vh / 2 - chip.h / 2 - 48);

  m.rx = lerp(innerRx, outerRx);
  m.ry = lerp(innerRy, outerRy);
  m.speed = (m.direction * TAU) / (lerp(...MOTION.period) * m.periodJitter);
  const spacing = rings > 1 ? Math.min(outerRx - innerRx, outerRy - innerRy + 40) / (rings - 1) : MOTION.wander * 2;
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
  const orbiting = desktopQuery.matches;

  // Sections stack over the hero, so skip the work while it's covered
  if (window.scrollY < window.innerHeight) {
    const visible = chips.filter((chip) => chip.li.offsetParent !== null && chip.motion);
    if (!orbiting && !reduced) travel(visible, dt);
    visible.forEach((chip) => position(chip, dt, orbiting, reduced));
    if (orbiting && !reduced) separate(visible, dt);
    visible.forEach((chip, index) => apply(chip, index, dt, elapsed, orbiting, reduced));
  }

  // Once hidden chips have faded out there's nothing to animate until they're shown again
  const settled = traitsHidden && chips.every((chip) => chip.opacity === 0);
  if (!reduced && !settled) requestFrame();
}

// At first, a few chips are already spaced out along their free areas; the rest queue up
function spreadOut(visible) {
  const limit = MOTION.maxTravelling[geometry.zones.bottom ? 1 : 0];
  const onScreen = visible.slice(0, limit);
  ["top", "bottom"].forEach((zone) => {
    const lane = onScreen.filter((chip) => chip.route.zone === zone);
    lane.forEach((chip, index) => {
      chip.route.progress = chip.route.length * (index + 0.5 + rand([-0.1, 0.1])) / lane.length;
    });
  });
  visible.slice(limit).forEach((chip, index) => {
    chip.route.wait = (index + 1) * rand([1, 2.5]);
  });
}

// Where a phone chip is on screen right now
function routePoint(route) {
  const along = Math.min(route.progress / route.length, 1);
  return {
    x: route.x0 + (route.x1 - route.x0) * along,
    y: route.y0 + (route.y1 - route.y0) * along,
    dir: Math.sign(route.x1 - route.x0),
  };
}

// Move each phone chip along its route like traffic: a faster chip slows down behind a slower one
// (or a held one) instead of driving through it, and a chip only sets off once the way in is clear.
// A finished chip waits, then takes a new route, and only while there's a free spot on screen
function travel(visible, dt) {
  const limit = MOTION.maxTravelling[geometry.zones.bottom ? 1 : 0];
  const moving = visible.filter((chip) => chip.route && chip.route.wait <= 0);
  const spot = new Map(moving.map((chip) => [chip, routePoint(chip.route)]));
  const blocks = (a, b, gap) => {
    const pa = spot.get(a);
    const pb = spot.get(b);
    const ahead = (pb.x - pa.x) * pa.dir;
    const clearance = ahead - (a.w + b.w) / 2;
    return b.route.zone === a.route.zone && ahead > 0 && clearance < gap &&
      Math.abs(pb.y - pa.y) < (a.h + b.h) / 2 + 4 ? clearance : null;
  };

  // Front-most first, so each chip knows how fast the one ahead is going
  const speed = new Map();
  [...moving]
    .sort((a, b) => (spot.get(b).x - spot.get(a).x) * spot.get(b).dir)
    .forEach((chip) => {
      let pace = chip.paused ? 0 : chip.route.speed;
      moving.forEach((other) => {
        const clearance = other !== chip ? blocks(chip, other, 40) : null;
        if (clearance === null) return;
        const leader = speed.get(other) ?? (other.paused ? 0 : other.route.speed);
        pace = Math.min(pace, clearance < 8 ? leader * 0.5 : leader);
      });
      speed.set(chip, pace);
    });

  let travelling = moving.length;
  visible.forEach((chip) => {
    const route = chip.route;
    if (!route || chip.paused) return;
    if (route.wait > 0) {
      route.wait -= dt;
      if (route.wait > 0) return;
      // Hold back while the screen is full or the entrance to this lane is taken
      const entranceTaken = moving.some((other) => other.route.zone === route.zone &&
        Math.abs(spot.get(other).x - route.x0) < (chip.w + other.w) / 2 + 24);
      if (travelling >= limit || entranceTaken) route.wait = rand([0.5, 1.5]);
      else travelling++;
      return;
    }
    route.progress += (speed.get(chip) ?? route.speed) * dt;
    if (route.progress >= route.length) {
      newRoute(chip);
      travelling--;
    }
  });
}

function position(chip, dt, orbiting, reduced) {
  const m = chip.motion;
  const [a, b, c, d, e] = m.waves;

  // A chip being read stays exactly where it is
  if (chip.paused && chip.x !== undefined) return;

  if (!chip.paused && !reduced) {
    m.time += dt;
    m.angle += m.speed * (1 + MOTION.speedDrift * Math.sin(a.f * m.time + a.p)) * dt;
  }

  const t = m.time;
  const amount = orbiting ? m.wander ?? MOTION.wander : MOTION.mobileWander;
  const wanderX = reduced ? 0 : amount * (Math.sin(b.f * t + b.p) + 0.5 * Math.sin(c.f * 1.7 * t + c.p)) / 1.5;
  const wanderY = reduced ? 0 : amount * (Math.sin(d.f * t + d.p) + 0.5 * Math.sin(e.f * 1.9 * t + e.p)) / 1.5;
  chip.rotate = reduced ? 0 : 2.5 * Math.sin(c.f * t + d.p);

  if (!orbiting) {
    const route = chip.route;
    if (!route) return;
    const { cx, cy, vw } = geometry;
    if (reduced) {
      placeStill(chip);
      return;
    }
    const point = routePoint(route);
    const screenX = point.x;
    chip.x = screenX - cx;
    // The drift stays inside the free areas, clear of the menu button and scroll cue
    const { zones } = geometry;
    const lowest = (zones.bottom ?? zones.top)[1];
    chip.y = Math.min(Math.max(point.y + wanderY, zones.top[0]), lowest) - cy;
    chip.rotate *= 0.4;
    chip.depth = route.depth;
    // Nearer routes a touch bigger; never below full size, so chips stay 44px tall to tap
    chip.scale = 1 + 0.06 * route.depth;
    // Hidden while waiting for the next route, and faded in and out at the screen edges
    const inside = Math.min(screenX - chip.w / 2, vw - (screenX + chip.w / 2));
    chip.edgeFade = route.wait > 0 ? 0 : Math.min(1, Math.max(0, (inside + chip.w * 0.4) / (chip.w * 0.4 + 8)));
    return;
  }

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

function apply(chip, index, dt, elapsed, orbiting, reduced) {
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
    // On phones chips are meant to slide in and out at the sides (edgeFade handles that)
    const offScreen = orbiting && (rect.left < EDGE_MARGIN || rect.right > vw - EDGE_MARGIN ||
      rect.top < EDGE_MARGIN || rect.bottom > vh - EDGE_MARGIN);
    // Orbits fade out well before reaching the chrome (the scroll cue bounces, so it gets extra room
    // above); phone routes are already laid out clear of it, so they only need a thin margin
    const margin = orbiting ? CHROME_MARGIN : 4;
    const bounce = orbiting ? 24 : 0;
    const onChrome = geometry.protected.some((r) =>
      rect.left < r.right + margin && rect.right > r.left - margin &&
      rect.top < r.bottom + margin && rect.bottom > r.top - margin - bounce);
    if (offScreen || onChrome) target = 0;
  }
  if (!orbiting) target *= chip.edgeFade ?? 1;
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
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { measure(); requestFrame(); }, 150);
});
desktopQuery.addEventListener("change", () => { measure(); requestFrame(); });
reducedMotionQuery.addEventListener("change", () => { measure(); requestFrame(); });
// The menu button and scroll cue only appear after the intro, so keep their positions fresh
setInterval(() => { if (geometry) measure(); }, 1000);

// Escape closes an open tooltip (hovered or focused) without moving focus;
// it can show again once the pointer or focus leaves the chip
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  document.querySelectorAll("#top .trait-chip:hover, #top .trait-chip:focus").forEach((chip) => {
    chip.classList.add("tooltip-dismissed");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  renderCharacteristics();
});
