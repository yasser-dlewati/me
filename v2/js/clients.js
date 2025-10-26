import { setBodyScroll, renderClients, isMobileDevice } from "./common.js";

function setExperienceDuration() {
  const spanExperienceDuration = document.querySelector(".experience-duration");
  if (spanExperienceDuration) {
    const firstWorkingDate = new Date("2016-06-23");
    const todayDate = new Date();
    const workingDurationInYears =
      todayDate.getFullYear() - firstWorkingDate.getFullYear();
    const monthsDifference = todayDate.getMonth() - firstWorkingDate.getMonth();
    let resultText = "";
    if (monthsDifference < 5) {
      resultText = "more than " + workingDurationInYears + " years";
    } else if (monthsDifference >= 5 && monthsDifference < 6) {
      resultText = "about " + workingDurationInYears + " years and a half";
    } else if (monthsDifference >= 6 && monthsDifference <= 11) {
      resultText = "more than " + workingDurationInYears + " years and a half";
    } else {
      resultText = "about " + (workingDurationInYears + 1) + " years";
    }

    spanExperienceDuration.innerHTML = resultText;
  }
}

const experienceContainer = document.querySelector(".experience-container");
var experienceItem = experienceContainer.children[0];

document.addEventListener("DOMContentLoaded", () => {
  setExperienceDuration();
  renderClients();
  setNavigationButtonsVisibility();
});

const nextButton = document.querySelector(".scroll-horizontally.next");
const prevButton = document.querySelector(".scroll-horizontally.prev");
setTimeout(() => {
  experienceItem = experienceContainer.children[0].clientWidth;
}, 100);

nextButton.addEventListener("click", function () {
  if (this.disabled) {
    return;
  }

  this.disabled = true;
  experienceContainer.scrollBy({ left: experienceItem, behavior: "smooth" });
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
  experienceContainer.scrollBy({ left: -experienceItem, behavior: "smooth" });
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
  .addEventListener("click", function () {
    document
      .querySelector(".experience-details-container")
      .classList.remove("active");
    document.querySelector(".experience-details-container").style.boxShadow =
      "none";
    setBodyScroll(true);
  });
