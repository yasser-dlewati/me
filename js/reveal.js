"use strict";

// Elements fade and slide in as they come into view, and back out as they leave it (.reveal and
// .visible in css/main.css)
let revealObserver;

export function observeReveal(elements, staggerSeconds = 0) {
  revealObserver ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Keep observing so the motion replays every time the element comes back into view
        entry.target.classList.toggle("visible", entry.isIntersecting);
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${index * staggerSeconds}s`);
    element.style.setProperty("--reveal-hide-delay", `${(elements.length - 1 - index) * staggerSeconds / 2}s`);
    revealObserver.observe(element);
  });
}
