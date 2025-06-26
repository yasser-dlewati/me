const userAgent = navigator.userAgent;
const regexp = /android|iphone|kindle|ipad/i;
const isMobileDevice = regexp.test(userAgent);
const divExperience = $(".experience-container");
const scrollLeftButton = $(".scroll-horizontly.prev");
const scrollRightButton = $(".scroll-horizontly.next");
const maxDivExperienceWidth =
  divExperience[0].scrollWidth - divExperience.width();
var scrollPosition = 0;

function setExperienceDuration() {
  var spanExperienceDuration = $(".experience-duration");
  if (spanExperienceDuration != undefined) {
    var firstWorkingDate = new Date("2016-06-23");
    var todayDate = new Date();
    var workingDurationInYears =
      todayDate.getFullYear() - firstWorkingDate.getFullYear();
    var monthsDifference = todayDate.getMonth() - firstWorkingDate.getMonth();
    var resultText = "";
    if (monthsDifference < 5) {
      resultText = "more than " + workingDurationInYears + " years";
    } else if (monthsDifference >= 5 && monthsDifference < 6) {
      resultText = "about" + workingDurationInYears + " years and a half";
    } else if (monthsDifference >= 6 && monthsDifference <= 11) {
      resultText = "more than " + workingDurationInYears + " years and a half";
    } else {
      resultText = "about " + (workingDurationInYears + 1) + " years";
    }

    spanExperienceDuration.html(resultText);
  }
}

function setScrollRightButtonVisibility() {
  if (divExperience.scrollLeft() > maxDivExperienceWidth - 1) {
    scrollRightButton.css("display", "none");
  } else {
    scrollRightButton.css("display", "inline");
  }
}

function setScrollLeftButtonVisibility() {
  if (divExperience.scrollLeft() === 0) {
    scrollLeftButton.css("display", "none");
  } else {
    scrollLeftButton.css("display", "inline");
  }
}

divExperience.scroll(() => {
  setScrollRightButtonVisibility();
  setScrollLeftButtonVisibility();
  scrollPosition = divExperience.scrollLeft();
});

scrollLeftButton.click(function () {
  if (scrollPosition > 0) {
    scrollPosition -= $(".experience-item").width();
  }

  divExperience.animate({
    scrollLeft: scrollPosition,
  });

  setExperienceIndicatorByStep(-1);
  let isFirstIndicatorItemActive =
    $(".experience-indicator li").first().attr("class") === "active";
  if (isFirstIndicatorItemActive) {
    divExperience.animate({
      scrollLeft: 0,
    });
  }
});

scrollRightButton.click(function () {
  if (scrollPosition < maxDivExperienceWidth) {
    scrollPosition += $(".experience-item").width();
  }

  divExperience.animate({
    scrollLeft: scrollPosition,
  });

  setExperienceIndicatorByStep(1);
  let isLastIndicatorItemActive =
    $(".experience-indicator li").last().attr("class") === "active";
  if (isLastIndicatorItemActive) {
    divExperience.animate({
      scrollLeft: maxDivExperienceWidth,
    });
  }
});

var experienceIndicatorPosition = isMobileDevice ? [0] : [0, 1, 2];

function setExperienceIndicatorByStep(step) {
  let recentlyAdded =
    experienceIndicatorPosition[experienceIndicatorPosition.length - 1] + step;
  if (step < 0) {
    if (experienceIndicatorPosition[0] - 1 >= 0) {
      experienceIndicatorPosition.unshift(experienceIndicatorPosition[0] - 1);
      experienceIndicatorPosition.pop();
    }
  } else {
    if (recentlyAdded < $(".experience-itm").length) {
      experienceIndicatorPosition.push(recentlyAdded);
      experienceIndicatorPosition.shift();
    }
  }

  updateExperienceIndicator();
}

function updateExperienceIndicator() {
  let lis = $(".experience-indicator li");
  lis.each((i) => {
    if (experienceIndicatorPosition.includes(i)) {
      $(lis[i]).addClass("active");
    } else {
      $(lis[i]).removeClass("active");
    }
  });
}

function renderExperienceIndicator() {
  var count = $(".experience-item").length;
  var content = "";
  for (var i = 0; i < count; i++) {
    if ((!isMobileDevice && i < 3) || (isMobileDevice && i == 0)) {
      content += "<li class='active'></li>";
    } else {
      content += "<li></li>";
    }
  }

  $(".experience-indicator").html(content);
}

$(document).ready(() => {
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
  },
  {
    id: 1,
    company: "Menumiz",
    position: "Senior web developer",
    duration: 32,
    isCurrentCompany: false,
    description:
      "A place where I graded from a junior level to a senior. Learning a lot of the development cycle, collaporate with other departments to learn more, working hard to proof myself professionally and stepping up to be a team leader to keep the wheel rooling.",
  },
  {
    id: 2,
    company: "Touchless",
    position: "Senior software engineer",
    duration: 2,
    isCurrentCompany: false,
    description:
      "Being the principle software engineer is something very hard but very rewarding at the same time. During this period of time, I got the chance to meet the brightest minds and not only work with, but learn from as well.",
  },
  {
    id: 3,
    company: "Boostorder",
    position: "Senior software engineer",
    duration: 15,
    isCurrentCompany: false,
    description:
      "Being the principle software engineer is something very hard but very rewarding at the same time. During this period of time, I got the chance to meet the brightest minds and not only work with, but learn from as well.",
  },
  {
    id: 4,
    company: "Monster",
    position: "Software engineer",
    duration: 24,
    isCurrentCompany: false,
    description:
      "First experiment working in such a big corporate which is the perfect time to engage and see how the collaporation should be done. In addition to feel proud as a working in a such a good reputation enterprises.",
  },
  {
    id: 5,
    company: "Timelog",
    position: "Senior software engineer",
    duration: 18,
    isCurrentCompany: true,
    description:
      "Woring in a team to delive a first class tier code. paricipating in mind storm sessions to detect the weakness points in the app and workin with task force team to present a solid plan to migrate to the legacy solutions to the latest technology.",
  },
];

$('.experience-item').append('<div class="overlay"></div>')

$('.overlay').append('<button>details</button>');

$(document).on('click', '.overlay button', function() {
  if ($(".content").css("margin-left") === "0px") {
    $(".experience-details-container").animate({ "margin-left": "50%" }, 500);
    $("section,footer").css("filter", "blur(8px)");
    $(".experience-details-container").css("box-shadow", "-8px 0px 32px");
    let imageSrc = $(this).parent().prev().attr("src");
    let companyName = $(this).parent().prev().attr("alt");
    let reltatedExpericence = experienceJson.find(
      (x) => x.company === companyName
    );
    let html = `<div class="container">
    <div class="row">
    <div class="col-12">
    <img src="${imageSrc}" alt="${companyName}" class="company-logo">
    <h4 class="company-name">${reltatedExpericence.company}</h2>
    <h5 class="position">${reltatedExpericence.position}</h3>
    <p class="duration">Duration: ${reltatedExpericence.duration} months</p>
    <p> ${reltatedExpericence.description}</p>
    </div>
    </div>
    </div>
    `;
    $(".experience-details").html(html);
    console.log(reltatedExpericence.description);
  }
});

$(".experience-details-container .close").click(function () {
  if ($(".content").css("margin-left") !== "0%") {
    $(".experience-details-container").animate({ "margin-left": "100%" }, 500);
    $("section,footer").css("filter", "");
    $(".experience-details-container").css("box-shadow", "none");
  }
});
