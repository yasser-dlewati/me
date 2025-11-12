import { setBodyScroll, toggleCloseMenuOnOutsideClick, closeFeedbackForm } from "./common.js";

const txtFeedback = document.querySelector("#txtFeedback");
const feedbackForm = document.querySelector(".feedback-form");
export const feedbackIcon = document.querySelector(".feedback-icon");

feedbackIcon.addEventListener("click", function() {
  this.children[0].classList.remove("pulse");
  feedbackForm.classList.add("active");
  document.querySelector('.navigation').style.filter = 'blur(8px)';
  document.querySelector('.settings-container').style.filter = 'blur(8px)';
  setBodyScroll(false);
  toggleCloseMenuOnOutsideClick(true, [document.querySelector('.navigation'), document.querySelector('.settings-container')]);
});

const closeFeedbackFormButton = document.querySelector(".feedback-form .close");
closeFeedbackFormButton.addEventListener("click", () => {
  closeFeedbackForm();
});

(function () {
  emailjs.init("ONBs1kJm-53DoguLS");
})();

const scriptURL = "https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbyZoQyiZ918cIyPK6uOwHHAAr3Uc-Yv5B3yPQzOQPIfWnxjYUZ0yYEAvwR-zwHFvkYmRQ/exec"; // paste your Apps Script URL


document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.feedback-form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const form = event.target;
    // if (window.location.hostname === "localhost") {
    //   document.querySelector(".notification").classList.add("active");
    //   form.reset();

    //   return;
    // }
    // Option 1: Send by passing template params manually
    // emailjs
    //   .send("service_6gtyqvg", "template_olpb3hy", {
    //     from_name: "feedback_form",
    //     message: txtFeedback.value,
    //   })
    //   .then((response) => {
    //     form.reset();
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });



    const payload = {
      content: form.txtFeedback.value,
    };

    console.log(event);
  
    console.log(payload);
    // Send to Google Sheet
    try {
      const res = await fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
  
      const result = await res.json();
      if (result.status === 'success') {
        alert('✅ Feedback sent successfully!');
        form.reset();
      } else {
        alert('⚠️ Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Failed to send feedback.' + err.message);
    }
  });

  });




