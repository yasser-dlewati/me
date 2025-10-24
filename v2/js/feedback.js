import { setBodyScroll } from "./common.js";

const txtFeedback = document.querySelector("#txtFeedback");
const feedbackForm = document.querySelector(".feedback-form");
export const feedbackIcon = document.querySelector(".feedback-icon");

feedbackIcon.addEventListener("click", function() {
  this.children[0].classList.remove("pulse");
  feedbackForm.classList.add("active");
  setBodyScroll(false);
});

const closeFeedbackFormButton = document.querySelector(".feedback-form .close");
closeFeedbackFormButton.addEventListener("click", () => {
  feedbackForm.classList.remove("active");
  setBodyScroll(true);
});

(function () {
  emailjs.init("ONBs1kJm-53DoguLS");
})();

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.feedback-form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (window.location.hostname === "localhost") {
      document.querySelector(".notification").classList.add("active");
      form.reset();

      return;
    }
    // Option 1: Send by passing template params manually
    emailjs
      .send("service_6gtyqvg", "template_olpb3hy", {
        from_name: "feedback_form",
        message: txtFeedback.value,
      })
      .then((response) => {
        form.reset();
      })
      .catch((error) => {
        console.error(error);
      });
  });
});
