"use strict"

const servicesJson = [
  {
    id: 1,
    title: "Software Architecture & Development",
    titleAr: "هندسة وتطوير البرمجيات",
    Description:
      "Crafting the foundation of scalable systems, I focus on designing clear, robust, extensible architectures that reduce technical debt and support future growth. From early prototypes to full-scale applications, I ensure clean code, modular architecture, and long-term value.",
    DescriptionAr:
      "أعمل على بناء الأساس لأنظمة قابلة للتوسع، مع التركيز على تصميم هياكل برمجية واضحة، قوية وقابلة للتطوير تقلل من الديون التقنية وتدعم النمو المستقبلي. من النماذج الأولية المبكرة إلى التطبيقات الكاملة، أحرص على كتابة كود نظيف وهيكلية منظمة تحقق قيمة طويلة الأمد.",
  },
  {
    id: 2,
    title: "Technical Leadership & Consulting",
    titleAr: "القيادة التقنية والاستشارات",
    Description:
      "With a deep understanding of both business and code, I offer guidance on choosing the right tools, frameworks, and strategies. Whether it is reviewing existing systems or advising on tech direction, I help teams make smart, future-proof decisions.",
    DescriptionAr:
      "بخبرة تجمع بين فهم الأعمال والبرمجة، أقدم استشارات تساعد على اختيار الأدوات، الأطر، والاستراتيجيات المناسبة. سواء في مراجعة الأنظمة الحالية أو في توجيه المسار التقني، أساعد الفرق على اتخاذ قرارات ذكية ومستقبلية.",
  },
  {
    id: 3,
    title: "Project & Team Management",
    titleAr: "إدارة المشاريع والفرق",
    Description:
      "From planning to delivery, I manage software projects with a focus on clarity, velocity, and collaboration. I lead cross-functional teams, remove blockers, and ensure everyone is aligned and empowered to deliver results. I also support hiring the right talents upon need.",
    DescriptionAr:
      "من مرحلة التخطيط إلى التسليم، أدير المشاريع البرمجية بتركيز على الوضوح، السرعة، والتعاون. أقود فرقاً متعددة التخصصات، أزيل العقبات، وأضمن أن الجميع يعمل بانسجام لتحقيق النتائج. كما أساهم في اختيار وتوظيف المواهب المناسبة عند الحاجة.",
  },
  {
    id: 4,
    title: "Quality Assurance",
    titleAr: "ضمان الجودة",
    Description:
      "I ensure software reliability through a deep manual testing. From carefully crafted test cases to real-world scenario validation, I help catch issues early, improve user experience, and maintain consistent quality across releases.",
    DescriptionAr:
      "أضمن موثوقية البرمجيات من خلال اختبارات دقيقة وشاملة. من تصميم حالات اختبار مدروسة إلى محاكاة السيناريوهات الواقعية، أساعد في اكتشاف المشكلات مبكراً، وتحسين تجربة المستخدم، والحفاظ على جودة ثابتة عبر الإصدارات.",
  },
  {
    id: 5,
    title: "Maintenance & Support",
    titleAr: "الصيانة والدعم",
    Description:
      "My work does not end with project delivery; it extends into ensuring long-term reliability. I stay involved to monitor functionality, fix issues, and adapt the software as requirements evolve, so it continues to serve its purpose effectively.",
    DescriptionAr:
      "عملي لا ينتهي عند تسليم المشروع؛ بل يمتد لضمان استقراره على المدى الطويل. أتابع أداء النظام، أصلح المشكلات عند ظهورها، وأطور الحلول مع تغيّر المتطلبات ليبقى البرنامج يخدم هدفه بكفاءة.",
  },
  {
    id: 6,
    title: "Coaching & Mentoring",
    titleAr: "التدريب والإرشاد",
    Description: "I coach and mentor developers and teams to grow their technical skills and professional thinking. Through hands-on sessions, code reviews, and career guidance, I help individuals level up and teams become more effective and self-sufficient.",
    DescriptionAr: "أقوم بتدريب وإرشاد المطورين والفرق لتطوير مهاراتهم التقنية والتفكير المهني. من خلال جلسات عملية، مراجعات للكود، وتوجيه مهني، أساعد الأفراد على الارتقاء بمستواهم وتتقدم الفرق لتصبح أكثر فعالية واعتمادًا على نفسها."
  }
];
  
export function renderServices(){
    let servicesContainer = document.querySelector('#accordion');
    console.log(servicesContainer);
    let servicesContent = '';
    let isArabic = document.documentElement.lang === 'ar';

    servicesJson.forEach( service => {
        let title = isArabic ? service.titleAr : service.title;
        let description = isArabic ? service.DescriptionAr : service.Description;

        servicesContent += `
        <div class="card">
            <a class="collapsed btn card-header service" data-bs-toggle="collapse" href="#${service.id}" aria-expanded="false" aria-controls="${service.id}">
                <i class="fa-regular fa-square-plus"></i>
                <h5>
                    ${title}
                </h5>
            </a>
            <div id="${service.id}" class="collapse" data-bs-parent="#accordion">
                <div class="card-body">
                    <p>
                        ${description}
                    </p>
                </div>
            </div>
        </div>
        `;
    });

    servicesContainer.innerHTML = servicesContent;
}

document.addEventListener("DOMContentLoaded", function () {
    renderServices();
})

$('.service').click( function() { 
    $('.service i').removeClass('fa-square-minus').addClass('fa-square-plus');
    let targetDescription = $(this).next('div'); 
    setTimeout(() => {
        let isTargetDescriptionOpen = targetDescription.hasClass('show');
        if (isTargetDescriptionOpen) {
            $(this).find('i').removeClass('fa-square-plus').addClass('fa-square-minus');
            $(this).css('border-bottom', 'none');
            $('.service').not(this).css('border-bottom', '1px solid #ccc');
        } else {
            $(this).find('i').removeClass('fa-square-minus').addClass('fa-square-plus');
            $(this).css('border-bottom', '1px solid #ccc');
            $(this).css('background-color', 'var(--bg-light-color)')
            $(this).css('color', 'var(--text-dark-color)')
        }
    }, 400);
});
