import {
  renderClients,
  isMobileDevice,
  language,
  closeClientDetails,
  setExperienceDuration,
  experienceStartDate,
} from "./common.js";

const experienceContainer = document.querySelector(".experience-container");
var experienceItem = experienceContainer.children[0];

// Need to wait for the container to render properly
setTimeout(() => {
  experienceItem = experienceContainer.children[0].clientWidth;
}, 100);

document.addEventListener("DOMContentLoaded", () => {
  setupSwipe();
  resetExperienceIndicatorPosition();
  const spanExperienceDuration = document.querySelector(".experience-duration");
  let experienceDuration = setExperienceDuration(experienceStartDate);
  spanExperienceDuration.innerHTML = experienceDuration;
  renderClients();
  setNavigationButtonsVisibility();
});

const nextButton = document.querySelector(".scroll-horizontally.next");
const prevButton = document.querySelector(".scroll-horizontally.prev");
nextButton.addEventListener("click", function () {
  if (this.disabled) {
    return;
  }

  this.disabled = true;
  experienceContainer.scrollBy({
    left: language.isRTL ? -experienceItem : experienceItem,
    behavior: "smooth",
  });
  moveExperienceIndicatorByStep(1);
  setTimeout(() => {
    this.disabled = false;
  }, 300);
});

prevButton.addEventListener("click", function () {
  if (this.disabled) {
    return;
  }

  this.disabled = true;
  experienceContainer.scrollBy({
    left: language.isRTL ? experienceItem : -experienceItem,
    behavior: "smooth",
  });
  moveExperienceIndicatorByStep(-1);
  setTimeout(() => {
    this.disabled = false;
  }, 300);
});

let experienceIndicatorPosition;

function resetExperienceIndicatorPosition() {
  experienceIndicatorPosition = isMobileDevice ? [0] : [0, 1, 2];
}

function moveExperienceIndicatorByStep(step) {
  const recentlyAdded =
    experienceIndicatorPosition[experienceIndicatorPosition.length - 1] + step;
  if (step < 0) {
    if (experienceIndicatorPosition[0] - 1 >= 0) {
      experienceIndicatorPosition.unshift(experienceIndicatorPosition[0] - 1);
      experienceIndicatorPosition.pop();
    }
  } else {
    if (recentlyAdded < document.querySelectorAll(".experience-item").length) {
      experienceIndicatorPosition.push(recentlyAdded);
      experienceIndicatorPosition.shift();
    }
  }

  updateExperienceIndicator();
}

function updateExperienceIndicator() {
  const lis = document.querySelectorAll(".experience.indicator li");
  lis.forEach((li, i) => {
    if (experienceIndicatorPosition.includes(i)) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });

  const counter = document.querySelector(".experience.indicator .counter");
  if (counter) {
    const count = document.querySelectorAll(".experience-item").length;
    counter.textContent = `${experienceIndicatorPosition[0] + 1} / ${count}`;
  }

  setNavigationButtonsVisibility();
}

export function resetClientsView() {
  resetExperienceIndicatorPosition();
  document.querySelector(".experience-container").scroll({ left: 0 });
  updateExperienceIndicator();
}

function setNavigationButtonsVisibility() {
  // Arrows are hidden in swipe mode
  const lis = document.querySelectorAll(".experience.indicator li");
  if (isSwipeMode || !lis.length) {
    return;
  }

  prevButton.style.visibility = lis[0].classList.contains("active")
    ? "hidden"
    : "visible";
  nextButton.style.visibility = lis[lis.length - 1].classList.contains("active")
    ? "hidden"
    : "visible";
}

document
  .querySelector(".experience-details-container .close")
  .addEventListener("click", () => {
    console.log("closing");
    closeClientDetails();
  });

let isSwipeMode = false;
let hasSwiped = false;

// Clients fully visible at once: one on phones, three otherwise
function visibleClientsCount() {
  return isMobileDevice ? 1 : 3;
}

export function setSwipeMode(enabled) {
  isSwipeMode = enabled;
  hasSwiped = false;
  document.querySelector("#clients").classList.toggle("swipe-mode", enabled);
  resetClientsView();
}

function setupSwipe() {
  // Peek at the next client whenever the carousel comes into view, until the user has swiped once
  const peekObserver = new IntersectionObserver(
    ([entry]) => {
      const visibleCount = visibleClientsCount();
      if (
        !isSwipeMode ||
        !entry.isIntersecting ||
        hasSwiped ||
        experienceContainer.children.length <= visibleCount ||
        experienceIndicatorPosition[0] !== 0
      ) {
        return;
      }

      // Let the reveal motion settle before nudging
      setTimeout(() => {
        if (isSwipeMode && !hasSwiped) {
          experienceContainer.children[visibleCount]?.classList.add("peek-next");
          experienceContainer.classList.add("peek");
        }
      }, 800);
    },
    { threshold: 0.6 }
  );
  peekObserver.observe(experienceContainer);
  experienceContainer.addEventListener("animationend", (event) => {
    if (event.animationName === "client-peek") {
      stopPeek();
    }
  });

  // Swiping scrolls the carousel natively, so derive the current clients from the scroll position
  let scrollFrame = null;
  experienceContainer.addEventListener(
    "scroll",
    () => {
      if (!isSwipeMode || scrollFrame) {
        return;
      }

      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = null;
        const count = experienceContainer.children.length;
        const visibleCount = Math.min(visibleClientsCount(), count);
        // The scroll range spans exactly the hidden clients; clientWidth would include the column padding
        const maxScroll =
          experienceContainer.scrollWidth - experienceContainer.clientWidth;
        if (count <= visibleCount || maxScroll <= 0) {
          return;
        }

        // scrollLeft is negative in RTL
        const progress = Math.abs(experienceContainer.scrollLeft) / maxScroll;
        const first = Math.min(
          count - visibleCount,
          Math.max(0, Math.round(progress * (count - visibleCount)))
        );
        if (experienceIndicatorPosition[0] !== first) {
          hasSwiped = true;
          stopPeek();
          experienceIndicatorPosition = Array.from(
            { length: visibleCount },
            (_, i) => first + i
          );
          updateExperienceIndicator();
        }
      });
    },
    { passive: true }
  );

  setupMouseDrag();
}

function stopPeek() {
  experienceContainer.classList.remove("peek");
  experienceContainer
    .querySelectorAll(".peek-next")
    .forEach((item) => item.classList.remove("peek-next"));
}

// Touch and trackpads scroll natively; a mouse needs click-and-drag to swipe
function setupMouseDrag() {
  let startX = 0;
  let startScroll = 0;
  let isPointerDown = false;
  let hasDragged = false;

  experienceContainer.addEventListener("pointerdown", (event) => {
    if (!isSwipeMode || event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    isPointerDown = true;
    hasDragged = false;
    startX = event.clientX;
    startScroll = experienceContainer.scrollLeft;
  });

  experienceContainer.addEventListener("pointermove", (event) => {
    if (!isPointerDown) {
      return;
    }

    const deltaX = event.clientX - startX;
    if (!hasDragged && Math.abs(deltaX) > 5) {
      hasDragged = true;
      experienceContainer.classList.add("dragging");
      experienceContainer.setPointerCapture(event.pointerId);
    }

    if (hasDragged) {
      experienceContainer.scrollLeft = startScroll - deltaX;
    }
  });

  const endDrag = () => {
    if (!isPointerDown) {
      return;
    }

    isPointerDown = false;
    // Restoring scroll snapping settles the carousel on the nearest client
    experienceContainer.classList.remove("dragging");
  };
  experienceContainer.addEventListener("pointerup", endDrag);
  experienceContainer.addEventListener("pointercancel", endDrag);

  // A drag that ends over a logo must not open its details
  experienceContainer.addEventListener(
    "click",
    (event) => {
      if (hasDragged) {
        event.stopPropagation();
        event.preventDefault();
        hasDragged = false;
      }
    },
    true
  );

  // Stop the browser's native image drag from hijacking the gesture
  experienceContainer.addEventListener("dragstart", (event) => {
    if (isSwipeMode) {
      event.preventDefault();
    }
  });
}
