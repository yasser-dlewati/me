import {
  setBodyScroll,
  toggleCloseMenuOnOutsideClick,
  closeFeedbackForm,
} from "./common.js";

const txtFeedback = document.querySelector("#txtFeedback");
const feedbackForm = document.querySelector("form.feedback-form");
const notificationBox = document.querySelector(".notification")
const message = document.querySelector(".notification .message")
export const feedbackIcon = document.querySelector(".feedback-icon");

(function() {
  emailjs.init("ONBs1kJm-53DoguLS"); // from EmailJS dashboard
})();

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

const scriptURL =
  "https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbyZoQyiZ918cIyPK6uOwHHAAr3Uc-Yv5B3yPQzOQPIfWnxjYUZ0yYEAvwR-zwHFvkYmRQ/exec"; // paste your Apps Script URL

const formUrl =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLScEsx_ueZVOLSeN7nT6LAF1aD7Uk7j-1CSOhZhZcHtAKFjI8w/formResponse";

document.addEventListener("DOMContentLoaded", function () {
  feedbackForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var content = txtFeedback.value;
    sendFeedback(content);
  });
});

async function sendFeedback(content) {
  const formData = new FormData();// Replace with your entry ID
  formData.append("entry.500212983", content); 
  formData.append("entry.1920882552", document.body.getAttribute("data-theme")|| 'light'); 
  try {
    await fetch(formUrl, {
      method: "POST",
      body: formData,
      mode: "no-cors", // <--- magic trick: bypasses CORS
    }).then(() => {
      showNotification('success');
      feedbackForm.reset();
    });
  } catch (error) {
    showNotification('error', error.message);
  }
}

export function showNotification(type, content){
  notificationBox.classList.add('active');
  message.innerHTML = type === 'success' ? '<i class="fa-solid fa-check"></i> Feedback sent successfully. Thank you!' : '<i class="fa-solid fa-x"></i> An error occurred while sending feedback. Please try again later.';
  if(type ==='error'){
    emailjs.send("service_6gtyqvg", "template_olpb3hy", {
      from_name: "feedback_form",
    message: 'Failed to send feedback: ' + content,
    })
  }
}
