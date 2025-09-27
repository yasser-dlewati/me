"use strict";

const setSectionsStylesForScrolling = () => {
  $("section").each(function (index) {
    $(this).css("z-index", index + 1);
    $(this).css("top", `${index * 8}px`);
    $(this).height(`calc(100vh - ${index * 8}px)`);
  });
};

const renderNavigationLinks = () => {
  var content = getSectionsCount(true);
  $(".links").html(content);
};

const renderScreenIndicator = () => {
  var content = getSectionsCount();
  $(".screen-indicator").html(content);
};

function getSectionsCount(withNames) {
  var sections = $("section");

  var content = "";
  for (let i = 0; i < sections.length; i++) {
    if (withNames) {
      let sectionId = $($(sections)[i]).attr("id");
      content = content.concat(
        '<a href="#' + sectionId + '"><h4>' + sectionId + "</h4></a>"
      );
    } else {
      content = content.concat("<li></li>");
    }
  }
  return content;
}

function setScreenIndicator(index) {
  $(".screen-indicator li").each(function () {
    $(this).removeClass("active");
  });
  $($(".screen-indicator li")[index]).addClass("active");
}

function setScreenIndicatorAccordingToScroll() {
  const scrollTop = $(window).scrollTop() + 4;
  const sections = $("section");
  const windowHeight = $(window).height();

  for (let i = 0; i < sections.length; i++) {
    const currentTop = $(sections[i]).offset().top - windowHeight / 2;
    const nextTop =
      i + 1 < sections.length
        ? $(sections[i + 1]).offset().top - windowHeight / 2
        : Infinity;

    if (scrollTop >= currentTop && scrollTop < nextTop) {
      setScreenIndicator(i);
      break;
    }
  }
}

$(document).ready(function () {
  readSavedSettings();

  setSectionsStylesForScrolling();
  window.scrollTo(0, 0);

  $(".hero-text .message").each(function (i) {
    var $this = $(this);
    if (i >= 3) {
      $this.hide();
      setTimeout(function () {
        $this
          .hide()
          .delay((i + 1) * 1000)
          .fadeIn(1000);
      }, 6500);
    } else {
      $this
        .hide()
        .delay((i + 1) * 1000)
        .fadeIn(1000);
    }
  });
  renderScreenIndicator();
  renderNavigationLinks();
  $(window).scroll(function () {
    setScreenIndicatorAccordingToScroll();
  });
  setScreenIndicator(0);

  $(".navigation .close").click(function () {
    if (document.querySelector(".navigation").classList.contains("active")) {
      setTimeout(() => {
        $("section, footer").css("filter", "");
        $(".screen-indicator").removeClass("show-nav");
        $(".navigation").removeClass("active"); 
        $(".navigation").css("box-shadow", "none");
      }, 500);
    }
    $(".content").css("overflow", "");
    document.querySelector('body').style.removeProperty("overflow-y");
  });

  $(".settings-container .close").click(function () {
    if (
      document.querySelector(".settings-container").classList.contains("active")
    ) {
      $(".settings-container").removeClass("active");
      setTimeout(() => {
        console.log("close settings");
        $(".navigation > *").css("filter", "");
        $(".settings-container").css("box-shadow", "none");
      }, 500);
    }

    const saveSettingsLocally = document.querySelector("#saveSettingsLocally");
    if (saveSettingsLocally.checked) {
      localStorage.setItem("theme", "light");
    } else {
      console.log("Settings will not be saved locally.");
    }
  });

  $(".menu-icon").click(function () {
    console.log("show menu");
    if (!document.querySelector(".navigation").classList.contains("active")) {
      $(".navigation").addClass("active");
      $("section, footer").css("filter", "blur(8px)");
      $(".navigation").css("box-shadow", "var(--menu-box-shadow)");
      document.querySelector('body').style.overflowY = 'hidden';
    }
  });

  $(".settings").click(() => {
    console.log("this is coming soon");
    $(".settings-container").addClass("active");
    $(".navigation > :not(.settings-container)").css("filter", "blur(8px)");
    $(".settings-container").css("box-shadow", "var(--menu-box-shadow)");
    $(".content").css("overflow", "hidden");
  });

  const messages = [];
  $(function () {
    var index = 0;

    messages.push("tech enthusiast");
    messages.push("car lover");
    messages.push("Marvel fan");
    messages.push("dad");
    messages.push("millennium");

    function cycle() {
      $(".adjectives").html(messages[index]);
      index++;

      if (index === messages.length) {
        index = 0;
      }

      setTimeout(cycle, 1500);
    }

    cycle();
  });

  $(".links a").click(function (e) {
    e.preventDefault();
    $(".content").css("overflow", "hidden");
    const targetId = $(this).attr("href");
    const target = $(targetId);
    $("html, body").animate(
      {
        scrollTop: target.offset().top,
      },
      600
    ); // 600 =
    $(".navigation .close").click();
  });
});

$(document).on("wheel", function (e) {
  $(".content").css("overflow", "");
});

$(".copy").on("click", function (e) {
  e.preventDefault();
  const email = $(".email h5").text().trim();
  navigator.clipboard.writeText(email).then(() => {
    const $tooltip = $(this).find(".tooltip");
    $tooltip.css("opacity", 1);

    setTimeout(() => {
      $tooltip.css("opacity", 0);
    }, 1500);
  });
});

function readSavedSettings() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    $("body").attr("data-theme", savedTheme);
    document.querySelector("#darkModeSwitch").checked = savedTheme === "dark";
    document.querySelector("#saveSettingsLocally").checked = true;
  }

  const showUnderGraduate = localStorage.getItem("underGraduate");
  if (showUnderGraduate === "true") {
    document.querySelector("#showUnderGraduateExperience").checked = true;
    $(".undergraduate").show();
  }
}

var darkModeToggle = document.querySelector("#darkModeSwitch");
darkModeToggle.addEventListener("change", function () {
  if (saveSettingsCheckbox.checked) {
    localStorage.setItem("theme", this.checked ? "dark" : "light");
  }

  console.log("Dark mode toggled:", localStorage.getItem("theme"));

  if (this.checked) {
    $("body").attr("data-theme", "dark");
  } else {
    $("body").attr("data-theme", "light");
  }
});

var saveSettingsCheckbox = document.querySelector("#saveSettingsLocally");
saveSettingsCheckbox.addEventListener("change", function () {
  if (this.checked) {
    localStorage.setItem("theme", $("body").attr("data-theme"));
  } else {
    localStorage.removeItem("theme");
  }
});

const showUnderGraduateExperienceToggle = document.querySelector(
  "#showUnderGraduateExperience"
);

showUnderGraduateExperienceToggle.addEventListener("change", function () {
  if (saveSettingsCheckbox.checked) {
    localStorage.setItem("underGraduate", this.checked);
  }
  // if (this.checked) {
  //   console.log("Showing undergraduate experience");
  //   $(".undergraduate").show();
  //   document.querySelector(".undergraduate").show();
  // } else {
  //   console.log("Hiding undergraduate experience");
  //   $(".undergraduate").hide();
  //   document.querySelector(".undergraduate").hide();

  // }
});
