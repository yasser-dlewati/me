"use strict";

// Elements used by more than one module, each looked up once. Module scripts run after the page's
// HTML is parsed, so they all exist by now. Elements used by a single module are looked up there.

export const sections = [...document.querySelectorAll("section")];
export const topScrollDiv = document.querySelector("#top .scroll");
export const menuIcon = document.querySelector(".menu-icon");
export const screenIndicator = document.querySelector("ul.screen.indicator");
export const footer = document.querySelector("footer");
export const feedbackIcon = document.querySelector(".feedback-icon");

// The side panels
export const navigation = document.querySelector(".navigation");
export const settingsContainer = document.querySelector(".settings-container");
export const experienceDetailsContainer = document.querySelector(".experience-details-container");
export const schedulerContainer = document.querySelector(".scheduler-container");
export const feedbackForm = document.querySelector("form.feedback");
export const notificationBox = document.querySelector(".notification");
export const panels = [navigation, settingsContainer, experienceDetailsContainer, schedulerContainer, feedbackForm, notificationBox];
