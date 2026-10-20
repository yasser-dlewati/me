import { escapeHtml } from "./html.js";
import { lockPage, unlockPage, removeShadowAfterClosing } from "./overlay.js";
import { getSetting } from "./settings.js";
import { t, language } from "./i18n.js";
import { observeReveal } from "./reveal.js";
import { attachLiquidDrop } from "./liquidIndicator.js";
import { experienceJson, experienceStartDate, setExperienceDuration } from "./experience.js";

export const isMobileDevice = /android|iphone|kindle|ipad/i.test(navigator.userAgent);

const experienceContainer = document.querySelector(".experience-container");
// Measured on each click so the step stays right after resizing or re-rendering
function getScrollStep() {
  return experienceContainer.children[0]?.clientWidth ?? 0;
}

const nextButton = document.querySelector(".scroll-horizontally.next");
const prevButton = document.querySelector(".scroll-horizontally.prev");
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

  // Only the clients in view can be tabbed to: focusing one out of view would scroll the carousel
  // without the arrows, leaving the indicator behind
  document.querySelectorAll(".experience-item .client-button").forEach((button, i) => {
    button.tabIndex = experienceIndicatorPosition.includes(i) ? 0 : -1;
  });

  setNavigationButtonsVisibility();
}

export function resetClientsView() {
  resetExperienceIndicatorPosition();
  document.querySelector(".experience-container").scroll({ left: 0 });
  updateExperienceIndicator();
}

function setNavigationButtonsVisibility() {
  // Arrows are hidden in swipe mode
  if (isSwipeMode) {
    return;
  }

  // Worked out from the position, not the indicator dots: past 9 clients a phone shows a counter instead
  const count = document.querySelectorAll(".experience-item").length;
  const last = experienceIndicatorPosition[experienceIndicatorPosition.length - 1];
  prevButton.style.visibility = experienceIndicatorPosition[0] <= 0 ? "hidden" : "visible";
  nextButton.style.visibility = last >= count - 1 ? "hidden" : "visible";
}


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

// Carousel controls, swipe and the clients list. Called once from main.js at start-up
export function initClients() {
  nextButton.addEventListener("click", function () {
    if (this.disabled) {
      return;
    }

    this.disabled = true;
    experienceContainer.scrollBy({
      left: language.isRTL ? -getScrollStep() : getScrollStep(),
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
      left: language.isRTL ? getScrollStep() : -getScrollStep(),
      behavior: "smooth",
    });
    moveExperienceIndicatorByStep(-1);
    setTimeout(() => {
      this.disabled = false;
    }, 300);
  });

  document
    .querySelector(".experience-details-container .close")
    .addEventListener("click", closeClientDetails);

  setupSwipe();
  resetExperienceIndicatorPosition();
  // Also sets the About section's experience duration
  renderClients();
  attachLiquidDrop(document.querySelector(".experience.indicator"), { vertical: false });
  setNavigationButtonsVisibility();
}

export function renderClients() {
  var clients = experienceJson;
  let isShowingUnderGraduateExperience = getSetting("showUndergraduate");

  if (isShowingUnderGraduateExperience) {
    clients = experienceJson;
  } else {
    clients = experienceJson.filter((x) => x.id >= 0);
  }

  let clientsContainer = document.querySelector(".experience-container");
  let indicatorContent = "";
  let clientsContent = "";
  for (let i = 0; i < clients.length; i++) {
    // A button so the logo opens its details from the keyboard too; the image's alt names it
    clientsContent += `<div class='experience-item'>
      <button type="button" class="client-button" data-key="${escapeHtml(clients[i].key)}">
        <img src="./images/${escapeHtml(clients[i].imageSrc)}" class="img-fluid bounce" alt="${escapeHtml(t(`clientList.${clients[i].key}.company`))}" loading="lazy">
      </button>
      </div>`;
    indicatorContent +=
      (!isMobileDevice && i < 3) || (isMobileDevice && i === 0)
        ? "<li class='active'></li>"
        : "<li></li>";
  }

  // Too many dots crowd a phone screen, so switch to a numeric counter
  if (isMobileDevice && clients.length > 9) {
    indicatorContent = `<span class='counter'>1 / ${clients.length}</span>`;
  }

  clientsContainer.innerHTML = clientsContent;
  document.querySelector(".experience.indicator").innerHTML = indicatorContent;
  const experienceItems = document.querySelectorAll(".experience-item .client-button");
  experienceItems.forEach((item) => {
    item.addEventListener("click", showClientDetails);
  });

  // Stagger only the clients visible at first; the rest reveal one at a time as the carousel scrolls.
  // Those only fade: sliding would pull them past the carousel edge into view and make them flicker.
  const clientItems = [...clientsContainer.children];
  const initiallyVisibleCount = isMobileDevice ? 1 : 3;
  const laterItems = clientItems.slice(initiallyVisibleCount);
  laterItems.forEach((item) => item.classList.add("reveal-fade"));
  observeReveal(clientItems.slice(0, initiallyVisibleCount), 0.15);
  observeReveal(laterItems);

  updateAboutSectionExperienceDuration();
  resetClientsView();
}

function updateAboutSectionExperienceDuration() {
  let span = document.querySelector(".experience-duration");
  span.textContent = setExperienceDuration(experienceStartDate);
}

// Each client's details are built once and kept (hidden) in the panel, so the map iframe and
// logo don't reload every time the panel opens. Cleared when the language changes.
const clientDetailsCache = new Map();

export function clearClientDetailsCache() {
  clientDetailsCache.clear();
  document.querySelector(".experience-details").innerHTML = "";
}

function showClientDetails() {
  {
    document
      .querySelector(".experience-details-container")
      .classList.add("active");
    document.querySelector(".experience-details-container").style.boxShadow =
      "var(--menu-box-shadow)";
    const clientKey = this.dataset.key;
    const detailsContainer = document.querySelector(".experience-details");
    let details = clientDetailsCache.get(clientKey);
    if (!details) {
      details = buildClientDetails(clientKey);
      clientDetailsCache.set(clientKey, details);
      detailsContainer.appendChild(details);
    }
    clientDetailsCache.forEach((element) => {
      element.hidden = element !== details;
    });

    document
      .querySelectorAll(".experience-item img, .experience-item .client-button, .scroll-horizontally")
      .forEach((img) => {
        img.classList.remove("bounce");
        img.style.pointerEvents = "none";
      });
    lockPage("clientDetails", {
      elements: [document.querySelector(".experience-details-container")],
      close: closeClientDetails,
    });
  }
}

function buildClientDetails(clientKey) {
    const relatedExperience = experienceJson.find((x) => x.key === clientKey);
    const text = (field) => t(`clientList.${clientKey}.${field}`);
    const companyName = text("company");
    const html = `<div class="container">
        <div class="row">
          <div class="col-12">
          <img src="./images/${escapeHtml(
            relatedExperience.imageSrc
          )}" alt="${escapeHtml(companyName)}" class="company-logo">
          <h4 class="company-name">${escapeHtml(companyName)}</h4>
          <h5 class="position">${escapeHtml(text("position"))}</h5>
          <p>${escapeHtml(text("description"))}. 
           ${escapeHtml(
             relatedExperience.isCurrentCompany
               ? t("clientDetails.workingFor", { duration: setExperienceDuration(relatedExperience.joinedDate) })
               : t("clientDetails.workedFor", { duration: setExperienceDuration(null, relatedExperience.duration) })
           )}.</p>
          <p>${t("clientDetails.visit", {
            company: escapeHtml(companyName),
            url: escapeHtml(relatedExperience.websiteUrl),
          })}</p>
          <iframe src="https://www.google.com/maps/embed?${escapeHtml(
            relatedExperience.embededMapLink
          )}" width="100%" height="200" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>`;
    const details = document.createElement("div");
    details.innerHTML = html;
    return details;
}

export function closeClientDetails() {
  document
    .querySelector(".experience-details-container")
    .classList.remove("active");
  removeShadowAfterClosing(document.querySelector(".experience-details-container"));
  document
    .querySelectorAll(".experience-item img, .experience-item .client-button, .scroll-horizontally")
    .forEach((img) => {
      img.classList.add("bounce");
      // Removed rather than set to auto, so the overlay CSS can still disable it under other panels
      img.style.removeProperty("pointer-events");
    });
  unlockPage("clientDetails");
}
