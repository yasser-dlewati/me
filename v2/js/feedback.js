import {
  setBodyScroll,
  toggleCloseMenuOnOutsideClick,
  closeFeedbackForm,
} from "./common.js";

import { translations } from "./translation.js";

const txtFeedback = document.querySelector("#txtFeedback");
const feedbackForm = document.querySelector("form.feedback");
const notificationBox = document.querySelector(".notification");
const message = document.querySelector(".notification .message");
const cloudinaryName = "dxvgozjup";
const cloudinaryUploadPreset = "personalWebsite";
export const feedbackIcon = document.querySelector(".feedback-icon");

(function () {
  emailjs.init("ONBs1kJm-53DoguLS"); // from EmailJS dashboard
})();

feedbackIcon.addEventListener("click", function () {
  this.children[0].classList.remove("pulse");
  feedbackForm.classList.add("active");
  document.querySelector(".navigation").style.filter = "blur(8px)";
  document.querySelector(".settings-container").style.filter = "blur(8px)";
  document.querySelector(".experience-details-container").style.filter = "blur(8px)";
  setBodyScroll(false);
  let additionalMenus = []
  if(document.querySelector(".navigation").classList.contains("active")){
    additionalMenus.push(document.querySelector(".navigation"))
  }
  if(document.querySelector(".settings-container").classList.contains("active")){
    additionalMenus.push(document.querySelector(".settings-container"))
  }
  toggleCloseMenuOnOutsideClick(true, additionalMenus);
});

const closeFeedbackFormButton = document.querySelector(".feedback .close");
closeFeedbackFormButton.addEventListener("click", () => {
  closeFeedbackForm();
});

(function () {
  emailjs.init("ONBs1kJm-53DoguLS");
})();

const formUrl =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLScEsx_ueZVOLSeN7nT6LAF1aD7Uk7j-1CSOhZhZcHtAKFjI8w/formResponse";

document.addEventListener("DOMContentLoaded", function () {
  feedbackForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var content = txtFeedback.value;
    try {
      await sendFeedback(content);
    } catch (error) {
      console.log(error);
      showNotification("error", error.message);
    }
  });
});

async function getIP() {
  const res = await fetch("https://api.ipify.org?format=json");
  const data = await res.json();
  return data.ip;
}

async function uploadScreenshot(base64) {
  const formData = new FormData();

  // Make sure the base64 has the correct prefix
  if (!base64.startsWith("data:image")) {
    base64 = "data:image/png;base64," + base64; // assuming PNG
  }

  formData.append("file", base64);
  formData.append("upload_preset", cloudinaryUploadPreset);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Cloudinary upload error:", data);
      return "";
    }

    return data.secure_url;
  } catch (error) {
    console.log("Error uploading screenshot:", error);
    return "";
  }
}

async function captureScreenshot() {
  // Find the section that is currently visible at the viewport center
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const topSection = document.elementFromPoint(centerX, centerY).closest("section");
  if (!topSection) return null;

  const canvas = await html2canvas(topSection, { scale: 1 });
  return canvas.toDataURL("image/png", 0.3);
}

async function sendFeedback(content) {
  const loadingOverlay = document.querySelector(".feedback .loading-overlay");
  loadingOverlay.style.setProperty('display', 'flex', 'important'); 
  document.querySelectorAll("form.feedback *:not(.loading-overlay):not(.loading-overlay span)").forEach(
    (el) => {
      el.style.filter = "blur(8px)";
    }
  );
  const formData = new FormData();
  const screenshotBase64 = await captureScreenshot();
  const imageUrl = await uploadScreenshot(screenshotBase64);
  formData.append("entry.500212983", content);
  formData.append("entry.1920882552", document.body.getAttribute("data-theme") || "light");
  formData.append("entry.1705496179", document.documentElement.getAttribute("lang") || "en");
  formData.append("entry.275842004", await getIP());
  formData.append("entry.1136156880", imageUrl);
  try {
    await fetch(formUrl, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    }).then(() => {
      showNotification("success");
      feedbackForm.reset();
    });
  } catch (error) {
    console.log(error);
    showNotification("error", error.message);
  } finally {
    document.querySelectorAll("form.feedback *:not(.loading-overlay)").forEach(
      (el) => {
        el.style.filter = "";
      }
    )
    loadingOverlay.style.display = "";
  }
}

export function showNotification(type, content) {
  notificationBox.classList.add("active");
  let isArabic = document.documentElement.lang === 'ar';
  let successMessageContent = isArabic ? translations.ar.feedback.success : translations.en.feedback.success;
  let failMessageContent = isArabic ? translations.ar.feedback.fail : translations.en.feedback.fail;
  message.innerHTML =
    type === "success"
      ? '<i class="fa-solid fa-check"></i> '+ successMessageContent
      : '<i class="fa-solid fa-x"></i> '+ failMessageContent;
  if (type === "error") {
    emailjs.send("service_6gtyqvg", "template_olpb3hy", {
      from_name: "feedback_form",
      message: "Failed to send feedback: " + content,
    });
  }
}
