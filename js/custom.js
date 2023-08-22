
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

const divExperience = $('.experience-container');
const scrollLeftButton = $('.scroll-horizontly.prev')
const scrollRightButton = $('.scroll-horizontly.next')

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

divExperience.scroll(function () {
    setScrollRightButtonVisibility();
    setScrollLeftButtonVisibility();
    scrollPosition = divExperience.scrollLeft();
});

var scrollPosition = 0

scrollLeftButton.click(function () {
    if (scrollPosition > 0) {
        scrollPosition -= divExperience.width() * 0.3;
    }

    divExperience.animate({
        scrollLeft: scrollPosition
    })

});

scrollRightButton.click(function () {
    if (scrollPosition < divExperience.width()) {
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

$('#btnSubmit').click(function () {
    const senderEmail = "yasdle@outlook.com";
    var isEmailVerified = tryVerifyEmailAddress(txtEmail.val());
    var isAnyInputInValid = invalidatedInput(txtEmail) || invalidatedInput(txtName) || invalidatedInput(txtMessage)
    if (isAnyInputInValid) {
        setSubmitButtonAppearance(isAnyInputInValid)
        showSnackbar(alertClass, alertMessage)
        return;
    }

    if (isEmailVerified) {
        Email.send({
            SecureToken: "8c1ba5c8-5c06-4fba-9abb-cb57b4168999",
            To: 'yasdle@outlook.com',
            From: senderEmail,
            Subject: "New Message from " + txtName.val() + " (" + txtEmail.val() + ")",
            Body: txtMessage.val().replace(/\n/g, "<br />")
        }).then(() => showSnackbar(successClass, successMessage))
            .catch(err => showSnackbar(failClass, failMessage + '\n ' + err))

    }
})

const successClass = 'success-snackbar';
const successMessage = 'Your message is on its way, Thanks!';
const failClass = 'fail-snackbar';
const failMessage = 'Something went wrong, please try again later!';
const alertClass = 'alert-snackbar';
const alertMessage = 'Please make sure you filled them up correctly.';


function showSnackbar(snackbarClass, snackbarMessage) {
    var snackbar = $('#snackbar');
    $('#snackbar-text').html(snackbarMessage);
    snackbar.addClass('show ' + snackbarClass);
    var width = snackbar.width()
    console.log(width)
    snackbar.css('left', 'calc(50% - ' + width / 2 + 'px)')
    setTimeout(() => {
        snackbar.removeClass('show');
    }, 3000);
}

function tryVerifyEmailAddress(email) {
    const regex = "^([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]\@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3}$"
    return (new RegExp(regex).test(email));
}

const txtName = $('#txtName')
const txtEmail = $('#txtEmail')
const txtMessage = $('#txtMessage')

function invalidatedInput(input) {
    var invalid = false;
    if (input === txtName || input == txtMessage) {
        invalid = $(input).val() === '' || $(input).val() === ' ' || $(input).val().length < 2
    }
    else if (input === txtEmail) {
        invalid = !tryVerifyEmailAddress($(input).val())
    }

    if (invalid) {
        $(input.addClass('required'))
    }
    else {
        $(input.removeClass('required'))
    }

    return invalid;

}

function validateInputsOnFocusout(input) {
    $(input).focusout(() => {
        var isAnyInputInValid = invalidatedInput(txtEmail) || invalidatedInput(txtName) || invalidatedInput(txtMessage)
        setSubmitButtonAppearance(isAnyInputInValid)
    })
}

function setSubmitButtonAppearance(toDisable) {
    if (toDisable) {
        $(':submit').addClass('disabled').removeClass('form-control')
    }
    else {
        $(':submit').removeClass('disabled').addClass('form-control')
    }
    $(':submit').prop('disabled', toDisable)
}

function setExperienceDurationContent() {
    var spanRollingExperience = $('.rolling-experience')
    let userAgent = navigator.userAgent;
    let regexp = /android|iphone|kindle|ipad/i;
    let isMobileDevice = regexp.test(userAgent);
    let oldContent = $(spanRollingExperience).html()
    let newContent = 'who started his journey since 2016'
    let content = [oldContent, newContent]
    let i = 0;
    if (isMobileDevice) {
        setInterval(() => {
            if (i === content.length) {
                i = 0;
            }

            $(spanRollingExperience).html(content[i])
            i++
        }, 3000);
    }
    else {
        $(spanRollingExperience).hover(() => {
            $(spanRollingExperience).html(content[1])
        }, () => {
            $(spanRollingExperience).html(content[0])
        })
    }
}

$(document).ready(function () {
    setTimeout(() => {
        window.scrollTo(0, 0);
        var $loader = $(".loader").removeClass("loader");
        $loader.remove();
    }, 800);

    setExperienceDurationContent()

    validateInputsOnFocusout(txtName)
    validateInputsOnFocusout(txtEmail)
    validateInputsOnFocusout(txtMessage)

    $('i#close').click(() => $('#snackbar').removeClass('show'))
})