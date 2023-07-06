
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

$(document).ready(function(){
    var spanExperienceDuration = $('.experience-duration');
    if(spanExperienceDuration != undefined){
        var firstWorkingDate = new Date('2016-06-23');
        var todayDate = new Date();
        var workingDurationInYears = todayDate.getFullYear() - firstWorkingDate.getFullYear();
        var monthsDifference = todayDate.getMonth() - firstWorkingDate.getMonth();
        var resultText = '';
        if(monthsDifference < 5){
            resultText = 'more than ' + workingDurationInYears + ' years';
        }
        if(monthsDifference >=5 && monthsDifference < 6){
            resultText = 'about' + workingDurationInYears + ' years and a half';
        }
        else if (monthsDifference >=6 && monthsDifference <= 11){
            resultText = 'more than ' + workingDurationInYears + ' years and a half';
        }
        else{
            resultText = 'about ' + workingDurationInYears + 1 + ' years';
        }

        spanExperienceDuration.val(resultText);
    }
})