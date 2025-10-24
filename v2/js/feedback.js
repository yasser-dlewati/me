const txtFeedback = document.querySelector('#txtFeedback');
const btnSubmitFeedback = document.querySelector('#btnSubmitFeedback');

(function() {
    emailjs.init("ONBs1kJm-53DoguLS"); // from EmailJS dashboard
  })();

  // Handle the form submission
  document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form.feedback-form");
  
    form.addEventListener("submit", function(event) {
      event.preventDefault();
  
      // Option 1: Send by passing template params manually
    emailjs.send("service_6gtyqvg", "template_olpb3hy", {
        from_name: "feedback_form",
      message: txtFeedback.value,
      })
      .then(response => {
        alert("✅ Email sent successfully!");
        form.reset();
      })
      .catch(error => {
        alert("❌ Failed to send: " + error.text);
        console.error(error);
      });
    });
  });
  