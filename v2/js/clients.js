import {
  renderClients,
  isMobileDevice,
  language,
closeClientDetails,
setExperienceDuration,
} from "./common.js";

const experienceContainer = document.querySelector(".experience-container");
var experienceItem = experienceContainer.children[0];

// Need to wait for the container to render properly
setTimeout(() => {
  experienceItem = experienceContainer.children[0].clientWidth;
}, 100);

document.addEventListener("DOMContentLoaded", () => {
  const spanExperienceDuration = document.querySelector(".experience-duration");
  let experienceDuration = setExperienceDuration('2016-06-23');
  spanExperienceDuration.innerHTML = experienceDuration;
  console.log("Rendering clients..."+spanExperienceDuration.innerHTML  );
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

let experienceIndicatorPosition = isMobileDevice ? [0] : [0, 1, 2];

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

  setNavigationButtonsVisibility();
}

export function resetClientsView() {
  document.querySelector(".experience-container").scroll({ left: 0 });
  experienceIndicatorPosition = isMobileDevice ? [0] : [0, 1, 2];
  updateExperienceIndicator();
}

function setNavigationButtonsVisibility() {
  const lis = document.querySelectorAll(".experience.indicator li");
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
