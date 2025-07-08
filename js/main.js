"use strict";

const setSectionsStylesForScrolling = () => {
  $('section').each(function(index) {
    $(this).css('z-index', index + 1);
    $(this).css('top', `${index * 8}px`);
    $(this).height(`calc(100vh - ${index * 8}px)`)
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
    const nextTop = i + 1 < sections.length
      ? $(sections[i + 1]).offset().top - windowHeight / 2
      : Infinity;

    if (scrollTop >= currentTop && scrollTop < nextTop) {
      setScreenIndicator(i);
      break;
    }
  }
}

$(document).ready(function () {
  setSectionsStylesForScrolling();
  $("body").attr("data-theme","light");
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
    if (document.querySelector(".navigation").style.marginLeft !== "50%") {
      $(".content").animate({ "margin-left": 0 }, 500);
      setTimeout(() => {
        $("section, footer").css("filter", "");
        $(".screen-indicator").removeClass("show-nav");
        $(".navigation").css("box-shadow", "none");
      }, 500);
    }
  $('.content').css('overflow', '');
  });

  $(".menu-icon").click(function () {
    console.log("show menu");
    if ($(".content").css("margin-left") === "0px") {
      $(".content").animate({ "margin-left": "-50%" }, 500);
      $("section, footer").css("filter", "blur(8px)");
      $(".navigation").css("box-shadow", "-8px 0px 32px");
    }
  });

  $(".settings").click(() => {
    console.log("this is coming soon");
    $(".settings-container").animate({ "margin-left": "8px" }, 500);
    $(".navigation > :not(.settings-container)").css("filter", "blur(8px)");
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
    $('.content').css('overflow', 'hidden');
  const targetId = $(this).attr('href');
  const target = $(targetId);
    $('html, body').animate({
      scrollTop: target.offset().top
    }, 600); // 600 =
    $(".navigation .close").click();

  });
});

$(document).on("wheel", function (e) {
  $('.content').css('overflow', '');
});

$('.copy').on('click', function (e) {
  e.preventDefault();
  const email = $('.email h5').text().trim();
  navigator.clipboard.writeText(email)
    .then(() => {
      const $tooltip = $(this).find('.tooltip');
      $tooltip.css('opacity', 1);
      
      setTimeout(() => {
        $tooltip.css('opacity', 0);
      }, 1500);
    });
});