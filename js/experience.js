const userAgent = navigator.userAgent
const regexp = /android|iphone|kindle|ipad/i
const isMobileDevice = regexp.test(userAgent)
const divExperience = $('.experience-container')
const scrollLeftButton = $('.scroll-horizontly.prev')
const scrollRightButton = $('.scroll-horizontly.next')
const maxDivExperienceWidth = divExperience[0].scrollWidth - divExperience.width()
var scrollPosition = 0

function setExperienceDuration() {
    var spanExperienceDuration = $('.experience-duration')
    if (spanExperienceDuration != undefined) {
        var firstWorkingDate = new Date('2016-06-23')
        var todayDate = new Date()
        var workingDurationInYears = todayDate.getFullYear() - firstWorkingDate.getFullYear()
        var monthsDifference = todayDate.getMonth() - firstWorkingDate.getMonth()
        var resultText = ''
        if (monthsDifference < 5) {
            resultText = 'more than ' + workingDurationInYears + ' years'
        }
        else if (monthsDifference >= 5 && monthsDifference < 6) {
            resultText = 'about' + workingDurationInYears + ' years and a half'
        }
        else if (monthsDifference >= 6 && monthsDifference <= 11) {
            resultText = 'more than ' + workingDurationInYears + ' years and a half'
        }
        else {
            resultText = 'about ' + (workingDurationInYears + 1) + ' years'
        }

        spanExperienceDuration.html(resultText)
    }
}

function setScrollRightButtonVisibility() {
    if (divExperience.scrollLeft() >= maxDivExperienceWidth - 20) {
        scrollRightButton.hide()
    }
    else {
        scrollRightButton.show()
    }
}

function setScrollLeftButtonVisibility() {
    if (divExperience.scrollLeft() === 0) {
        scrollLeftButton.hide()
    }
    else {
        scrollLeftButton.show()
    }
}

divExperience.scroll(() => {
    setScrollRightButtonVisibility()
    setScrollLeftButtonVisibility()
    scrollPosition = divExperience.scrollLeft()
})

scrollLeftButton.click(function () {
    if (scrollPosition > 0) {
        scrollPosition -= $('.experience').width()
    }

    divExperience.animate({
        scrollLeft: scrollPosition
    })

    setExperienceIndicatorByStep(-1)
})

scrollRightButton.click(function () {
    if (scrollPosition < maxDivExperienceWidth) {
        scrollPosition += $('.experience').width()
    }

    divExperience.animate({
        scrollLeft: scrollPosition
    })

    setExperienceIndicatorByStep(1)
})

var experienceIndicatorPosition = isMobileDevice ? [0] : [0, 1, 2]

function setExperienceIndicatorByStep(step) {
    let recentlyAdded = experienceIndicatorPosition[experienceIndicatorPosition.length - 1] + step
    if (step < 0) {
        if (experienceIndicatorPosition[0] - 1 >= 0) {
            experienceIndicatorPosition.unshift(experienceIndicatorPosition[0] - 1)
            experienceIndicatorPosition.pop()
        }
    }
    else {
        if (recentlyAdded < $('.experience').length) {
            experienceIndicatorPosition.push(recentlyAdded)
            experienceIndicatorPosition.shift()
        }
    }

    updateExperienceIndicator()
}

function updateExperienceIndicator() {
    let lis = $('.experience-indicator li')
    lis.each((i) => {
        if (experienceIndicatorPosition.includes(i)) {
            $(lis[i]).addClass('active')
        }
        else {
            $(lis[i]).removeClass('active')
        }
    })
}

function renderExperienceIndicator() {
    var count = $('.experience').length
    var content = ''
    for (var i = 0; i < count; i++) {
        if ((!isMobileDevice && i < 3) || (isMobileDevice && i == 0)) {
            content += "<li class='active'></li>"
        }
        else {
            content += '<li></li>'
        }
    }

    $('.experience-indicator').html(content)
}

$(document).ready(() => {
    setExperienceDuration()
    renderExperienceIndicator()
    setScrollRightButtonVisibility()
    setScrollLeftButtonVisibility()
})