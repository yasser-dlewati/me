const userAgent = navigator.userAgent;
const regexp = /android|iphone|kindle|ipad/i;
const isMobileDevice = regexp.test(userAgent);
const divExperience = document.querySelector(".experience-container");
const scrollLeftButton = document.querySelector(".scroll-horizontly.prev");
const scrollRightButton = document.querySelector(".scroll-horizontly.next");
const maxDivExperienceWidth =
  divExperience.scrollWidth - divExperience.clientWidth;
let scrollPosition = 0;

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

function setScrollRightButtonVisibility() {
  scrollRightButton.style.display =
    divExperience.scrollLeft > maxDivExperienceWidth - 1 ? "none" : "inline";
}

function setScrollLeftButtonVisibility() {
  scrollLeftButton.style.display =
    divExperience.scrollLeft === 0 ? "none" : "inline";
}

divExperience.addEventListener("scroll", () => {
  setScrollRightButtonVisibility();
  setScrollLeftButtonVisibility();
  scrollPosition = divExperience.scrollLeft;
});

scrollLeftButton.addEventListener("click", function () {
  if (scrollPosition > 0) {
    scrollPosition -= document.querySelector(".experience-item").clientWidth;
  }

  divExperience.scrollTo({
    left: scrollPosition,
    behavior: "smooth",
  });

  setExperienceIndicatorByStep(-1);
  const isFirstIndicatorItemActive =
    document.querySelector(".experience-indicator li.active") ===
    document.querySelector(".experience-indicator li");
  if (isFirstIndicatorItemActive) {
    divExperience.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  }
});

scrollRightButton.addEventListener("click", function () {
  if (scrollPosition < maxDivExperienceWidth) {
    scrollPosition += document.querySelector(".experience-item").clientWidth;
  }

  divExperience.scrollTo({
    left: scrollPosition,
    behavior: "smooth",
  });

  setExperienceIndicatorByStep(1);
  const isLastIndicatorItemActive =
    document.querySelector(".experience-indicator li:last-child.active") ===
    document.querySelector(".experience-indicator li:last-child");
  if (isLastIndicatorItemActive) {
    divExperience.scrollTo({
      left: maxDivExperienceWidth,
      behavior: "smooth",
    });
  }
});

let experienceIndicatorPosition = isMobileDevice ? [0] : [0, 1, 2];

function setExperienceIndicatorByStep(step) {
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
  const lis = document.querySelectorAll(".experience-indicator li");
  lis.forEach((li, i) => {
    if (experienceIndicatorPosition.includes(i)) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });
}

function renderExperienceIndicator() {
  const count = document.querySelectorAll(".experience-item").length;
  let content = "";
  for (let i = 0; i < count; i++) {
    content +=
      (!isMobileDevice && i < 3) || (isMobileDevice && i === 0)
        ? "<li class='active'></li>"
        : "<li></li>";
  }

  document.querySelector(".experience-indicator").innerHTML = content;
}

document.addEventListener("DOMContentLoaded", () => {
  setExperienceDuration();
  renderExperienceIndicator();
  setScrollRightButtonVisibility();
  setScrollLeftButtonVisibility();
});

const experienceJson = [
  {
    id: 0,
    company: "Robotat",
    position: "Web developer",
    duration: 18,
    isCurrentCompany: false,
    description:
      "First attempt to enter the software development world by getting assigned to test some feature manually (black box method) then getting enrolled in the development cycle by delivering some simple models in both front end and back end",
    websiteUrl: "https://www.robotat.com",
    location: {
      long: 3.1661670431254234,
      lat: 101.6519775711648,
    },
  },
  {
    id: 1,
    company: "Menumiz",
    position: "Senior web developer",
    duration: 32,
    isCurrentCompany: false,
    description:
      "A place where I graded from a junior level to a senior. Learning a lot of the development cycle, collaporate with other departments to learn more, working hard to proof myself professionally and stepping up to be a team leader to keep the wheel rooling.",
    websiteUrl: "https://www.menumiz.com",
    location: {
      long: 3.1106415178193267,
      lat: 101.66577115582407,
    },
  },
  {
    id: 2,
    company: "Touchless",
    position: "Senior software engineer",
    duration: 2,
    isCurrentCompany: false,
    description:
      "Being the principle software engineer is something very hard but very rewarding at the same time. During this period of time, I got the chance to meet the brightest minds and not only work with, but learn from as well.",
    websiteUrl: "https://touchless.asia",
    location: {
      long: 2.910237,
      lat: 101.655013,
    },
  },
  {
    id: 3,
    company: "Boostorder",
    position: "Senior software engineer",
    duration: 15,
    isCurrentCompany: false,
    description:
      "Being the principle software engineer is something very hard but very rewarding at the same time. During this period of time, I got the chance to meet the brightest minds and not only work with, but learn from as well.",
    websiteUrl: "https://www.boostorder.com",
    location: {
      long: 3.1172387768337684,
      lat: 101.67229855767039,
    },
  },
  {
    id: 4,
    company: "Monster",
    position: "Software engineer",
    duration: 24,
    isCurrentCompany: false,
    description:
      "First experiment working in such a big corporate which is the perfect time to engage and see how the collaporation should be done. In addition to feel proud as a working in a such a good reputation enterprises.",
    websiteUrl: "https://www.monster.com/about",
    location: {
      long: 3.1498692224274083,
      lat: 101.71157475715616,
    },
  },
  {
    id: 5,
    company: "Timelog",
    position: "Senior software engineer",
    duration: 18,
    isCurrentCompany: true,
    description:
      "Woring in a team t delive a first class tier code. paricipating in mind storm sessions to detect the weakness points in the app and workin with task force team to present a solid plan to migrate to the legacy solutions to the latest technology.",
    websiteUrl: "https://timelog.com/en",
    location: {
      long:3.1595209066025243, 
      lat: 101.71868384232964,
    },
  },
];

const overlay = document.createElement("div");
overlay.className = "overlay";
document
  .querySelectorAll(".experience-item")
  .forEach((item) => item.appendChild(overlay.cloneNode(true)));

document.querySelectorAll(".overlay").forEach((overlay) => {
  const button = document.createElement("button");
  button.textContent = "details";
  overlay.appendChild(button);
});

document.addEventListener("click", function (event) {
  if (
    event.target.matches("button") &&
    event.target.parentElement.classList.contains("overlay")
  ) {
    if (
      document.querySelector(".content").style.marginLeft === "0px" ||
      document.querySelector(".content").style.marginLeft === ""
    ) {
      let sections = document.querySelectorAll("section");
      sections.forEach((section) => {
        section.style.filter = "blur(8px)";
      });

      document
        .querySelector(".experience-details-container")
        .animate([{ marginLeft: "50%" }], { duration: 500, fill: "forwards" });

      document.querySelector(".experience-details-container").style.boxShadow =
        "-8px 0px 32px";
      const imageSrc = event.target.parentElement.previousElementSibling.src;
      const companyName = event.target.parentElement.previousElementSibling.alt;
      const relatedExperience = experienceJson.find(
        (x) => x.company === companyName
      );
      const html = `<div class="container">
        <div class="row">
          <div class="col-12">
            <img src="${imageSrc}" alt="${companyName}" class="company-logo">
            <h4 class="company-name">${relatedExperience.company}</h4>
            <h5 class="position">${relatedExperience.position}</h5>
            <p class="duration">Duration: ${relatedExperience.duration} months</p>
            <p>${relatedExperience.description}</p>
            <p>Visit ${companyName} Website <a href="${relatedExperience.websiteUrl}" target="_blank" rel="noopener">here</a>!</p>
          </div>
        </div>
      </div>`;
      document.querySelector(".experience-details").innerHTML = html;
    }
  }
});

document
  .querySelector(".experience-details-container .close")
  .addEventListener("click", function () {
    if (document.querySelector(".content").style.marginLeft !== "0%") {
      let sections = document.querySelectorAll("section");
      document
        .querySelector(".experience-details-container")
        .animate([{ marginLeft: "100%" }], { duration: 500, fill: "forwards" })
        .finished.then(() => {
          sections.forEach((section) => {
            section.style.filter = "";
            section.style.marginLeft = "0%";
          });
          document.querySelector(
            ".experience-details-container"
          ).style.boxShadow = "none";
        });
      setTimeout(() => {}, 500);
    }
  });
