import { resetClientsView } from "./clients.js";
import { renderServices } from "./services.js";

// Language data object
export const translations = {
    en: {
        top:{
            navigation:"Top",
            scroll: "Scroll down to know more..."
        },
        about:{
            navigation:"About Me",
            title: "about me",
            description: `My name is Yasser, but you can call me Yas, a self tought software engineer with more than 9 years of experience, passionate about stretching my mind with solving complicated problems, writing code and learning new stuff.
            I worked in multiple companies vary in size from startups, SMEs to big enterprises, stepping up and climping up the ladder from a junior to a mid level and end up with a senior role, I also served as a team leader from a small portion of time. I have hands on experience with web, mobile and desktop development.`, 
            services: "Check out my services",
            session: "Schedule a session",         
        },
        clients:{
            navigation:"Clients",
            title: "where i left marks",
            hint: "click on the client's logo to know more...",
            download: "Or simply download my resume from ",
            here: "here",
        },
        services:{
            navigation:"Services",
            title: "Things I can do",
        },
        contact:{
            navigation:"Contact Me",
            title: "Say Hey!",
            description: "Feel free to reach out for collaborations or just a friendly hello by dropping a message via.",
            or: "Or simply",
            copied:"Copied to clipboard!",
        },
        navigation:{
            designedBy: "Designed and Developed by YasDle",
            rights:"All rights reserved © 2025",
        },
        settings:{
            language:"Language",
            en:"English",
            ar:"Arabic",
            darkMode:"Dark Mode",
            undergraduate:"Show Undergraduate experience",
            save:"Save settings locally",
        },
        feedback:{
            title:"your say!",
            description:"Please share your thoughts, suggestions, or any issues you encountered while using my website. Your input helps me improve and provide a better experience for all visitors.",
            placeholder:"Got a thought? Share it here...",
            submit:"Submit Feedback",
            inProgress:"Submitting your feedback...",
            success:"Feedback sent successfully. Thank you!",
            fail:"Failed to send feedback. Please try again later.",
        }
    },
    ar: {
        top:{
            navigation:"البداية",
            scroll: " قم بالتمرير لأسفل لمعرفة المزيد...",
        },
        about:{
            navigation:"مــن أنــا",
            title: "مــن أنــا",
            description:"اسمي ياسر، أنا مهندس برمجيات حيث أني علمت نفسي بنفسي، أمتلك أكثر من تسع سنوات من الخبرة، وشغوف بتحدّي عقلي من خلال حلّ المشكلات المعقّدة، وكتابة الأكواد، وتعلّم كل ما هو جديد. عملت في شركات متعددة الأحجام، بدءًا من الشركات الناشئة مرورًا بالمؤسسات المتوسطة وصولًا إلى الشركات الكبرى، حيث تنقلت في مسيرتي المهنية من مطوّر مبتدئ إلى مطوّر متوسط، ثم إلى دورٍ كبير المهندسين (Senior)، كما تولّيت قيادة فريق لفترة قصيرة. أمتلك خبرة عملية في تطوير تطبيقات الويب والهواتف المحمولة وسطح المكتب.",
            services: "اطلع على خدماتي",
            session: "احجز جلسة استشارية معي",
        },
        clients:{
            navigation:"العملاء",
            title: "أين تركت بصماتي",
            hint: "اضغط على شعار العميل لمعرفة المزيد...",
            download: " أو ببساطة قم بتحميل سيرتي الذاتية من",
            here: "هنا",
        },
        services:{  
            navigation:"الخدمات",
            title: "خدماتي التي أقدمها",
        },
        contact:{
            navigation:"تواصل معي",
            title: "تواصل معي!",
            description: "يسعدني تواصلك سواء للتعاون أو لمجرد التحية، يمكنك مراسلتي عبر ",
            or: "أو ببساطة",
            copied:"تم النسخ!",
        },
        navigation:{
            designedBy: '<p dir="rtl">  صُمّم وطُوّر من قبل  <span dir="ltr">YasDle</span>',
                        rights:"كل الحقوق محفوظة © 2025",
        },
        settings:{
            language:"اللغة",
            en:"الانجليزية",
            ar:"العربية",
            darkMode:"الوضع الداكن",
            undergraduate:"عرض خبرات المرحلة الجامعية",
            save:"حفظ الإعدادات محليًا",
        },
        feedback:{
            title:"أبد رأيك!",
            description:" شارك أفكارك، اقتراحاتك، أو أي مشكلات واجهتها أثناء استخدام موقعي الإلكتروني. تساعدني ملاحظاتك في التحسين وتوفير تجربة أفضل لجميع الزوار.",
            placeholder:"لديك فكرة؟ شاركها هنا...",
            submit:"أرسل",
            inProgress:"جاري إرسال ملاحظاتك...",
            success:"تم إرسال ملاحظاتك بنجاح. شكرًا لك!",
            fail:"فشل في إرسال الملاحظات. يرجى المحاولة مرة أخرى لاحقًا.",
        }
    },
};


// Helper function to get nested values
function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

// Function to switch language
function switchLanguage(lang) {
    const html = document.documentElement;
    if (lang === "ar") {
        html.setAttribute("dir", "rtl"); // Set direction to RTL
        html.setAttribute("lang", "ar"); // Set language to Arabic
    } else {
        html.setAttribute("dir", "ltr"); // Set direction to LTR
        html.setAttribute("lang", "en"); // Set language to English
    }

    const elements = document.querySelectorAll("[data-translate]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-translate");
        const translation = getNestedValue(translations[lang], key);
        if (translation) {
            el.innerHTML = translation;
        }
    });

    resetClientsView();
    renderServices();
}

const languageSelection = document.querySelector("#language");
languageSelection.addEventListener("change", function () {
  const selectedLang = this.value;
  switchLanguage(selectedLang);
});
