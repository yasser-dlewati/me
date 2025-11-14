import {
  setBodyScroll,
  toggleCloseMenuOnOutsideClick,
  closeFeedbackForm,
} from "./common.js";

const txtFeedback = document.querySelector("#txtFeedback");
const feedbackForm = document.querySelector(".feedback-form");
export const feedbackIcon = document.querySelector(".feedback-icon");

feedbackIcon.addEventListener("click", function () {
  this.children[0].classList.remove("pulse");
  feedbackForm.classList.add("active");
  document.querySelector(".navigation").style.filter = "blur(8px)";
  document.querySelector(".settings-container").style.filter = "blur(8px)";
  setBodyScroll(false);
  toggleCloseMenuOnOutsideClick(true, [
    document.querySelector(".navigation"),
    document.querySelector(".settings-container"),
  ]);
});

const closeFeedbackFormButton = document.querySelector(".feedback-form .close");
closeFeedbackFormButton.addEventListener("click", () => {
  closeFeedbackForm();
});

(function () {
  emailjs.init("ONBs1kJm-53DoguLS");
})();

const formUrl =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLScEsx_ueZVOLSeN7nT6LAF1aD7Uk7j-1CSOhZhZcHtAKFjI8w/formResponse";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.feedback-form");

  form.addEventListener("submit", async function () {
    var content = txtFeedback.value;
    sendFeedback(content);
  });
});

async function sendFeedback(content) {
  const formData = new FormData();
  formData.append("entry.500212983", content);
  try {
    await fetch(formUrl, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    }).then(() => {
      feedbackForm.reset();
      document.querySelector(".notification").classList.add("active");
    });
  } catch (error) {
    console.error("Error!", error.message);
  }
}
