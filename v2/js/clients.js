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
  const spanExperienceDuration = document.querySelector(".experience-duration");
  let experienceDuration = setExperienceDuration(experienceStartDate);
  spanExperienceDuration.innerHTML = experienceDuration;
  renderClients();
  updateExperienceIndicatorFromScroll();
});

let isWheelGestureActive = false;
let wheelScrollTimeout;
let scrollAnimationFrame;
let mobileSnapTimeout;
const scrollDuration = 450;
const wheelScrollReleaseDelay = 120;

function getExperienceItemWidth() {
  return experienceContainer.children[0]?.clientWidth || experienceItem;
}

function getVisibleItemsCount() {
  const itemWidth = getExperienceItemWidth();

  if (!itemWidth) {
    return isMobileDevice ? 1 : 3;
  }

  return Math.max(1, Math.round(experienceContainer.clientWidth / itemWidth));
}

function isMobileCarouselView() {
  return getVisibleItemsCount() === 1;
}

function getClosestExperienceItemIndex() {
  const experienceItems = [...document.querySelectorAll(".experience-item")];

  if (experienceItems.length === 0) {
    return 0;
  }

  const containerRect = experienceContainer.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;

  return experienceItems.reduce(
    (closestIndex, item, index) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(itemCenter - containerCenter);

      return distance < closestIndex.distance
        ? { index, distance }
        : closestIndex;
    },
    { index: 0, distance: Infinity },
  ).index;
}

function centerClosestMobileExperienceItem() {
  if (!isMobileCarouselView()) {
    return;
  }

  const experienceItems = document.querySelectorAll(".experience-item");
  const closestIndex = getClosestExperienceItemIndex();
  const closestItem = experienceItems[closestIndex];

  if (!closestItem) {
    return;
  }

  const containerRect = experienceContainer.getBoundingClientRect();
  const itemRect = closestItem.getBoundingClientRect();
  const centerOffset =
    itemRect.left + itemRect.width / 2 - (containerRect.left + containerRect.width / 2);

  if (Math.abs(centerOffset) > 1) {
    closestItem.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
}

function scrollExperienceByStep(step) {
  const scrollDistance = getExperienceItemWidth();
  const experienceItems = document.querySelectorAll(".experience-item");

  if (!scrollDistance || experienceItems.length === 0) {
    return;
  }

  const startLeft = experienceContainer.scrollLeft;
  const visibleItemsCount = getVisibleItemsCount();
  const maxStartIndex = Math.max(experienceItems.length - visibleItemsCount, 0);
  const currentIndex = Math.round(Math.abs(startLeft) / scrollDistance);
  const nextIndex = Math.min(Math.max(currentIndex + step, 0), maxStartIndex);
  const targetLeft = (language.isRTL ? -1 : 1) * nextIndex * scrollDistance;
  const distance = targetLeft - startLeft;
  const startTime = performance.now();

  if (distance === 0) {
    updateExperienceIndicatorFromScroll();
    return;
  }

  cancelAnimationFrame(scrollAnimationFrame);

  function animateScroll(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / scrollDuration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    experienceContainer.scrollLeft = startLeft + distance * easedProgress;
    updateExperienceIndicatorFromScroll();

    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(animateScroll);
    } else {
      experienceContainer.scrollLeft = targetLeft;
      updateExperienceIndicatorFromScroll();
    }
  }

  scrollAnimationFrame = requestAnimationFrame(animateScroll);
}

experienceContainer.addEventListener(
  "wheel",
  (event) => {
    if (isMobileCarouselView()) {
      return;
    }

    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (delta === 0) {
      return;
    }

    event.preventDefault();
    const step = delta > 0 ? 1 : -1;

    clearTimeout(wheelScrollTimeout);
    wheelScrollTimeout = setTimeout(() => {
      isWheelGestureActive = false;
    }, wheelScrollReleaseDelay);

    if (isWheelGestureActive) {
      return;
    }

    isWheelGestureActive = true;
    scrollExperienceByStep(step);
  },
  { passive: false },
);

experienceContainer.addEventListener("scroll", () => {
  requestAnimationFrame(updateExperienceIndicatorFromScroll);

  if (!isMobileCarouselView()) {
    return;
  }

  clearTimeout(mobileSnapTimeout);
  mobileSnapTimeout = setTimeout(centerClosestMobileExperienceItem, 120);
});

let experienceIndicatorPosition = isMobileDevice ? [0] : [0, 1, 2];

function updateExperienceIndicatorFromScroll() {
  const itemWidth = getExperienceItemWidth();
  const experienceItems = document.querySelectorAll(".experience-item");

  if (!itemWidth || experienceItems.length === 0) {
    return;
  }

  const visibleItemsCount = getVisibleItemsCount();
  const maxStartIndex = Math.max(experienceItems.length - visibleItemsCount, 0);
  const startIndex =
    visibleItemsCount === 1
      ? getClosestExperienceItemIndex()
      : Math.min(
          Math.round(Math.abs(experienceContainer.scrollLeft) / itemWidth),
          maxStartIndex,
        );

  experienceIndicatorPosition = Array.from(
    { length: visibleItemsCount },
    (_, index) => startIndex + index,
  ).filter((index) => index < experienceItems.length);

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
}

export function resetClientsView() {
  document.querySelector(".experience-container").scroll({ left: 0 });
  updateExperienceIndicatorFromScroll();
}

document
  .querySelector(".experience-details-container .close")
  .addEventListener("click", () => {
    closeClientDetails();
  });
