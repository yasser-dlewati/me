// Language data object
const translations = {
    en: {
        top:{
            scroll: "Scroll down to know more..."
        },
        about:{
            title: "about me",
            description:""            
        },
        title: "where i left marks",
        hint: "click on the client's logo to know more...",
    },
    ar: {
        top:{
            scroll: " قم بالتمرير لأسفل لمعرفة المزيد...",
        },
        about:{
            title: "مــن أنــا",
            description:"اسمي ياسر، أنا مهندس برمجيات حيث أني علمت نفسي بنفسي، أمتلك أكثر من تسع سنوات من الخبرة، وشغوف بتحدّي عقلي من خلال حلّ المشكلات المعقّدة، وكتابة الأكواد، وتعلّم كل ما هو جديد. عملت في شركات متعددة الأحجام، بدءًا من الشركات الناشئة مرورًا بالمؤسسات المتوسطة وصولًا إلى الشركات الكبرى، حيث تنقلت في مسيرتي المهنية من مطوّر مبتدئ إلى مطوّر متوسط، ثم إلى دورٍ كبير المهندسين (Senior)، كما تولّيت قيادة فريق لفترة قصيرة. أمتلك خبرة عملية في تطوير تطبيقات الويب والهواتف المحمولة وسطح المكتب.",
        },
        title: "أين تركت بصماتي",
        hint: "اضغط على شعار العميل لمعرفة المزيد...",
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
            el.textContent = translation;
        }
    });
}

const languageSelection = document.querySelector("#language");
languageSelection.addEventListener("change", function () {
  const selectedLang = this.value;
  switchLanguage(selectedLang);
});
