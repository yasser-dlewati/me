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
    embededMapLink: "pb=!1m18!1m12!1m3!1d3983.7287107914963!2d101.6519883!3d3.166001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87b783c5818efed7%3A0xfa5b51c991c1d246!2sPlaza%20Mont%E2%80%99%20Kiara!5e0!3m2!1sen!2smy!4v1756546255158!5m2!1sen!2smy",
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
    embededMapLink:"pb=!1m18!1m12!1m3!1d3983.9404660358446!2d101.66315911147416!3d3.1104541968520425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc48f196c74b49%3A0xa754e103215446f9!2sMenumiz%20Sdn.%20Bhd.!5e0!3m2!1sen!2smy!4v1756546615873!5m2!1sen!2smy"
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
    embededMapLink:"pb=!1m18!1m12!1m3!1d3983.7088143460246!2d101.66423242602517!3d3.171170203014705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc485de491c479%3A0xa40997f3dc918ec8!2sSolaris%20Dutamas%2C%201%2C%20Jln%20Dutamas%201%2C%20Solaris%20Dutamas%2C%2050754%20Kuala%20Lumpur%2C%20Wilayah%20Persekutuan%20Kuala%20Lumpur!5e0!3m2!1sen!2smy!4v1756546841444!5m2!1sen!2smy"
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
    embededMapLink:"pb=!1m18!1m12!1m3!1d3983.9086965997476!2d101.66931198601625!3d3.1188508452488763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc49f32cabd35b%3A0x23e273f52c551332!2sBoostorder%20-%20KL%20Eco%20City!5e0!3m2!1sen!2smy!4v1756546887913!5m2!1sen!2smy"
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
    embededMapLink:"pb=!1m18!1m12!1m3!1d3983.7913515491928!2d101.7089010760252!3d3.1496712531472517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc37f6f1c8d147%3A0x8c048efb4266c0bf!2sMenara%20AIA%20Sentral!5e0!3m2!1sen!2smy!4v1756546918525!5m2!1sen!2smy"
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
    embededMapLink:"pb=!1m18!1m12!1m3!1d3983.75408995014!2d101.71612601147427!3d3.159395096802703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc37d017eaaaab%3A0xd5c2bff92ec47876!2sINSCALE%20Malaysia!5e0!3m2!1sen!2smy!4v1756547062785!5m2!1sen!2smy"
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
  let isDarkMode = document.body.attributes["data-theme"].value === "dark";
  if (
    event.target.matches("img") &&
    event.target.parentElement.classList.contains("experience-item")
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
        "var(--menu-box-shadow)";
      const imageSrc = event.target.src;
      const companyName = event.target.alt;
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
             <iframe id="map" src="https://www.google.com/maps/embed?${relatedExperience.embededMapLink}" width="100%" height="200" ${isDarkMode ? 'style="filter:invert(90%)"' : ''} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
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
