"use strict";

const setSectionsStylesForScrolling = () => {
  $('section').each(function(index) {
    $(this).css('z-index', index + 1);
    $(this).css('top', `${index * 8}px`);
    $(this).height(`calc(100vh - ${index * 8}px)`)
  });
};

function renderScreenIndicator() {
  var count = $("section").length;
console.log(count)
  var content = '';
  for(let i=0; i<count; i++){
    content = content.concat('<li></li>')
  }
  let screenIndicator = $('.screen-indicator');
  screenIndicator.html(content)
  console.log(content)
}

function setScreenIndicator(index) {
  $(".screen-indicator li").each(function () {
    $(this).removeClass("active");
  });
  $($(".screen-indicator li")[index]).addClass("active");
}

function setScreenIndicatorAccordingToScroll() {
  var b = $(window).scrollTop() + 4;
  var sections = $("section");
  if (
    b > $(sections[0]).offset().top - $(window).height() / 2 &&
    b < $(sections[1]).offset().top - $(window).height() / 2
  ) {
    setScreenIndicator(0);
  } else if (
    b > $(sections[1]).offset().top - $(window).height() / 2 &&
    b < $(sections[2]).offset().top - $(window).height() / 2
  ) {
    setScreenIndicator(1);
  } else if (
    b > $(sections[2]).offset().top - $(window).height() / 2 &&
    b < $(sections[3]).offset().top - $(window).height() / 2
  ) {
    setScreenIndicator(2);
  } else if (b > $(sections[3]).offset().top - $(window).height() / 2) {
    setScreenIndicator(3);
  }
}

$(document).ready(function () {
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
  $(window).scroll(function () {
      setScreenIndicatorAccordingToScroll();
    });
    setScreenIndicator(0);  

  $("footer .logo").click(function () {
    $(window).scrollTop(0, 0);
    console.log("back to top");
  });

  $(".navigation .close").click(function () {
    if(document.querySelector('.navigation').style.marginLeft!=='50%'){
    $(".content").animate({ "margin-left": 0 }, 500);
    $("section").css("filter", "");
    $(".screen-indicator").removeClass("show-nav");
    $(".screen-indicator").css("right", "0");
    $(".menu-icon").show();
    }
  });

  $(".menu-icon").click(function () {
    console.log('show menu');
    if ($(".content").css("margin-left") === "0px") {
      $(".content").animate({ "margin-left": "-100%" }, 500);
      $("section").css("filter", "blur(8px)");
    }
  });

  $('.settings').click(()=>{
    console.log('this is coming soon')
return;
      $(".navigation").animate({ "margin-left": "50%" }, 500);
      $("section").css("filter", "blur(8px)");
      $('.navigation > :not(.settings-container)').css("filter", "blur(8px)");
  })

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

  $(".links a").click(function () {
    $(".navigation .close").click();
  });
});

