import { lockPage, unlockPage, showBusy, hideBusy } from "./overlay.js";

import { t } from "./i18n.js";
import { isMobileDevice } from "./clients.js";

const txtFeedback = document.querySelector("#txtFeedback");
const feedbackForm = document.querySelector("form.feedback");
const notificationBox = document.querySelector(".notification");
const message = document.querySelector(".notification .message");
const submitButton = document.querySelector(".feedback button[type='submit']");
const cloudinaryName = "dxvgozjup";
const cloudinaryUploadPreset = "personalWebsite";
export const feedbackIcon = document.querySelector(".feedback-icon");
const consentStep = document.querySelector(".feedback-consent");
const entryStep = document.querySelector(".feedback-entry");
const FEEDBACK_CONSENT_KEY = "feedbackConsent";
// Also kept in memory, so consent holds for this visit even when storage is blocked
let consentGiven = false;

// The IP and a screenshot go out with each feedback, so ask once before showing the form
function hasFeedbackConsent() {
  try {
    return consentGiven || localStorage.getItem(FEEDBACK_CONSENT_KEY) === "true";
  } catch {
    return consentGiven;
  }
}

function showFeedbackStep() {
  const consented = hasFeedbackConsent();
  consentStep.hidden = consented;
  entryStep.hidden = !consented;
}

// Most visitors never send feedback, so its libraries load the first time they're needed
// html2canvas-pro: a drop-in fork of html2canvas, which throws on modern colors such as color-mix()
const HTML2CANVAS_URL = "https://cdn.jsdelivr.net/npm/html2canvas-pro@2.4.5/dist/html2canvas-pro.min.js";
const EMAILJS_URL = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
const EMAILJS_PUBLIC_KEY = "ONBs1kJm-53DoguLS"; // from the EmailJS dashboard
const scriptLoads = new Map();

// Loads a script once; a failed load can be tried again later
function loadScript(url) {
  if (!scriptLoads.has(url)) {
    scriptLoads.set(url, new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = () => {
        scriptLoads.delete(url);
        script.remove();
        reject(new Error(`Couldn't load ${url}`));
      };
      document.head.appendChild(script);
    }));
  }
  return scriptLoads.get(url);
}

let emailjsReady = null;
function loadEmailjs() {
  emailjsReady ??= loadScript(EMAILJS_URL).then(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    return emailjs;
  }).catch((error) => {
    emailjsReady = null;
    throw error;
  });
  return emailjsReady;
}

const FEEDBACK_TIMEOUT_MS = 15000;
const formUrl =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLScEsx_ueZVOLSeN7nT6LAF1aD7Uk7j-1CSOhZhZcHtAKFjI8w/formResponse";

export function closeFeedbackForm() {
  document.querySelector(".notification").classList.remove("active");
  document.querySelector(".feedback").classList.remove("active");
  // Stays locked if a side panel is still open under the feedback form
  unlockPage("feedback");
}

// The feedback button, consent step and form. Called once from main.js at start-up
export function initFeedback() {
  feedbackIcon.addEventListener("click", function () {
    // Start fetching the screenshot library now, so it's usually ready by the time feedback is sent
    loadScript(HTML2CANVAS_URL).catch((error) => console.log(error.message));
    this.children[0].classList.remove("pulse");
    showFeedbackStep();
    feedbackForm.classList.add("active");
    // The notification belongs to the form: clicking it doesn't count as outside
    lockPage("feedback", {
      elements: [feedbackForm, notificationBox],
      close: closeFeedbackForm,
    });
  });

  document
    .querySelector("#btnAcceptFeedbackConsent")
    .addEventListener("click", () => {
      consentGiven = true;
      try {
        localStorage.setItem(FEEDBACK_CONSENT_KEY, "true");
      } catch (error) {
        console.log("Couldn't save feedback consent:", error);
      }
      showFeedbackStep();
      txtFeedback.focus();
    });

  const closeFeedbackFormButton = document.querySelector(".feedback .close");
  closeFeedbackFormButton.addEventListener("click", () => {
    closeFeedbackForm();
  });
  document.querySelector(".notification .close").addEventListener("click", closeFeedbackForm);

  // Disable submit button when the textarea is empty.
  txtFeedback.addEventListener("input", function () {
    submitButton.toggleAttribute("disabled", txtFeedback.value.trim() === "");
  });

  feedbackForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (entryStep.hidden) return;
    var content = txtFeedback.value;
    try {
      await sendFeedback(content);
    } catch (error) {
      console.log(error);
      showNotification("error");
      reportFailedFeedback(content, error);
    }
  });
}

async function getIP() {
  const res = await fetch("https://api.ipify.org?format=json");
  const data = await res.json();
  return data.ip;
}

async function uploadScreenshot(base64) {
  if (!base64) return "";
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
  // Find the section that is currently visible at the viewport center. By position, not
  // elementFromPoint: the page is inert behind the open feedback form, so hit-testing skips it
  const centerY = window.innerHeight / 2;
  const topSection = [...document.querySelectorAll("section")].find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= centerY && rect.bottom >= centerY;
  });
  if (!topSection) return null;

  try {
    await loadScript(HTML2CANVAS_URL);
    const canvas = await html2canvas(topSection, {
      scale: 1,
      onclone: (clonedDocument) => {
        // The page is blurred behind the open feedback form (OVERLAYS in css/main.css): unblur the copy
        delete clonedDocument.documentElement.dataset.overlay;
        // With letter-spacing, html2canvas draws each letter on its own, which breaks joined Arabic letters
        const style = clonedDocument.createElement("style");
        style.textContent = 'html[dir="rtl"] * { letter-spacing: normal !important; }';
        clonedDocument.head.append(style);
      },
    });
    return canvas.toDataURL("image/png", 0.3);
  } catch (error) {
    console.log("Error capturing screenshot:", error);
    return null;
  }
}

async function sendFeedback(content) {
  showBusy(feedbackForm);
  try {
    // Screenshot and IP are extras; the feedback is sent without them if either fails
    const screenshotBase64 = await captureScreenshot();
    const imageUrl = await uploadScreenshot(screenshotBase64);
    const ip = await getIP().catch((error) => {
      console.log("Error getting IP:", error);
      return "";
    });

    const formData = new FormData();
    formData.append("entry.500212983", content);
    formData.append(
      "entry.1920882552",
      document.documentElement.getAttribute("data-theme") || "light"
    );
    formData.append(
      "entry.1705496179",
      document.documentElement.getAttribute("lang") || "en"
    );
    formData.append("entry.275842004", ip);
    formData.append("entry.1136156880", imageUrl);
    // Must match the form's choices exactly, including their case
    formData.append("entry.1110382472", isMobileDevice ? "yes" : "No");

    // Google Forms allows no CORS, so the response is opaque: only network failures
    // and timeouts can be detected here, not a rejection by the form itself
    await fetch(formUrl, {
      method: "POST",
      body: formData,
      mode: "no-cors",
      signal: AbortSignal.timeout(FEEDBACK_TIMEOUT_MS),
    });
    showNotification("success");
    feedbackForm.reset();
    // reset() fires no input event, so disable the emptied form's button here
    submitButton.disabled = true;
  } catch (error) {
    console.log(error);
    showNotification("error");
    reportFailedFeedback(content, error);
  } finally {
    hideBusy(feedbackForm);
  }
}

export function showNotification(type) {
  notificationBox.classList.add("active");
  message.innerHTML =
    type === "success"
      ? '<i class="fa-solid fa-check"></i> ' + t("feedback.success")
      : '<i class="fa-solid fa-x"></i> ' + t("feedback.fail");
}

// Email the visitor's feedback when it couldn't be submitted, so it isn't lost
function reportFailedFeedback(feedback, error) {
  loadEmailjs()
    .then((emailjs) =>
      emailjs.send("service_6gtyqvg", "template_olpb3hy", {
        from_name: "feedback_form",
        message: `Failed to send feedback.\n\nFeedback:\n${feedback}\n\nError: ${error?.message ?? error}`,
      })
    )
    .catch((emailError) => console.log("Error emailing failed feedback:", emailError));
}
