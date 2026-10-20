"use strict";

// A thin scrollbar for phones, which have no section dots. The phone's own doesn't show here: a swipe
// is turned into a scripted jump to the next section (js/sectionScroll.js), and phones only show
// theirs while a finger moves the page. Like the native one it shows while the page moves and fades
// out after; it's only drawn on phones (see PAGE SCROLLBAR in css/main.css)
const HIDE_AFTER_MS = 900;

export function initPageScrollBar() {
  const track = document.createElement("div");
  track.className = "page-scrollbar";
  track.setAttribute("aria-hidden", "true");
  const thumb = document.createElement("div");
  thumb.className = "page-scrollbar-thumb";
  track.appendChild(thumb);
  document.body.appendChild(track);

  let frame = null;
  let hideTimer;

  function update() {
    frame = null;
    const root = document.documentElement;
    const scrollable = root.scrollHeight - root.clientHeight;
    if (scrollable <= 0) return;
    const trackLength = track.clientHeight;
    // The thumb's share of the track is the screen's share of the page, never too short to see
    const thumbLength = Math.max(32, (trackLength * root.clientHeight) / root.scrollHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    thumb.style.height = `${thumbLength}px`;
    thumb.style.transform = `translateY(${progress * (trackLength - thumbLength)}px)`;
  }

  function show() {
    if (!frame) frame = requestAnimationFrame(update);
    track.classList.add("visible");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => track.classList.remove("visible"), HIDE_AFTER_MS);
  }

  window.addEventListener("scroll", show, { passive: true });
  window.addEventListener("resize", () => {
    if (!frame) frame = requestAnimationFrame(update);
  });
  update();
}
