
$(function () {
    'use strict'

    // MENU
    $('.navbar .nav-link').on('click', function () {
        $(".navbar-collapse").collapse('hide');
    });

    $(window).on('scroll', function () {

        /*----------------------------------------------------*/
        /*  Navigtion Menu Scroll
        /*----------------------------------------------------*/

        var b = $(window).scrollTop();

        if (b > 72) {
            $(".navbar").addClass("scroll");
        } else {
            $(".navbar").removeClass("scroll");
        }
    });

    // TESTIMONIALS CAROUSEL
    $('#testimonials-carousel').owlCarousel({
        loop: true,
        margin: 10,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
            },
            900: {
                items: 2,
            },
            1200: {
                items: 3,
                loop: false
            }
        }
    })

    // SMOOTHSCROLL
    $(function () {
        $('.navbar .nav-link').on('click', function (event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top - 49
            }, 1000);
            event.preventDefault();
        });
    });

});

$('#scroll-down').click(function () {
    var current = 0;
    $('html, body').animate({
        scrollTop: ($("section").next()).offset().top
    }, 500);
})

function setExperienceDuration() {
    var spanExperienceDuration = $('.experience-duration');
    if (spanExperienceDuration != undefined) {
        var firstWorkingDate = new Date('2016-06-23');
        var todayDate = new Date();
        var workingDurationInYears = todayDate.getFullYear() - firstWorkingDate.getFullYear();
        var monthsDifference = todayDate.getMonth() - firstWorkingDate.getMonth();
        var resultText = '';
        if (monthsDifference < 5) {
            resultText = 'more than ' + workingDurationInYears + ' years';
        }
        else if (monthsDifference >= 5 && monthsDifference < 6) {
            resultText = 'about' + workingDurationInYears + ' years and a half';
        }
        else if (monthsDifference >= 6 && monthsDifference <= 11) {
            resultText = 'more than ' + workingDurationInYears + ' years and a half';
        }
        else {
            resultText = 'about ' + (workingDurationInYears + 1) + ' years';
        }

        spanExperienceDuration.html(resultText);
    }
}

const divExperience = $('.experience');
const scrollLeftButton = $('.scroll-prev')
const scrollRightButton = $('.scroll-next')

function setScrollRightButtonVisibility() {
    if (divExperience.scrollLeft() >= divExperience.width()) {
        scrollRightButton.hide();
    }
    else {
        scrollRightButton.show();
    }
}

function setScrollLeftButtonVisibility() {
    if (divExperience.scrollLeft() === 0) {
        scrollLeftButton.hide();
    }
    else {
        scrollLeftButton.show();
    }
}

divExperience.scroll(function(){
    setScrollRightButtonVisibility();
    setScrollLeftButtonVisibility();
});

var scrollPosition = 0;

scrollLeftButton.click(function(){
    if(scrollPosition > 0)
    {
    scrollPosition -= divExperience.width() * 0.3;
    }
   
    divExperience.animate({
        scrollLeft: scrollPosition
    })

});

scrollRightButton.click(function() {
    if(scrollPosition < divExperience.width())
    {
        scrollPosition += divExperience.width() * 0.3;
    }

    divExperience.animate({
        scrollLeft: scrollPosition
    })
});

$(document).ready(function () {
    setExperienceDuration();
    setScrollRightButtonVisibility();
    setScrollLeftButtonVisibility();
});