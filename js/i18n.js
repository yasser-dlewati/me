"use strict";

// The site's text in English and Arabic, and helpers to read it in the current language.
// Imports nothing, so any module can use it without creating an import loop.

const CURRENT_YEAR = new Date().getFullYear();

// All the site's text, per language. Values can be HTML (they're applied with innerHTML)
export const translations = {
    en: {
        top:{
            navigation:"Top",
            scroll: "Scroll down to know more..."
        },
        about:{
            navigation:"About",
            title: "about me",
            description: `My name is Yasser, but you can call me Yas, a self tought software engineer with <span class="experience-duration"></span> of experience, passionate about stretching my mind with solving complicated problems, writing code and learning new stuff.
            I worked in multiple companies vary in size from startups, SMEs to big enterprises, stepping up and climping up the ladder from a junior to a mid level and end up with a senior role, I also served as a team leader from a small portion of time. I have hands on experience with web, mobile and desktop development.`, 
            services: "Check out my services",
            session: "Schedule a session",         
        },
        clients:{
            navigation:"Clients",
            title: "where i left marks",
            hint: "Use the navigation arrows to scroll through clients, and click on the client's logo to know more...",
            hintSwipe: "Swipe left or right to browse clients, and click on the client's logo to know more...",
            download: "Or simply download my resume from ",
            here: "here",
        },
        services:{
            navigation:"Services",
            title: "Things I can do",
        },
        contact:{
            navigation:"Contact",
            title: "Say Hey!",
            description: "Feel free to reach out for collaborations or just a friendly hello by dropping a message via.",
            or: "Or simply",
            copied:"Copied to clipboard!",
            copyFailed:"Couldn't copy — please copy it manually",
            senEmail:"Send an email using preferred mail app",
            copy:"Copy email",
        },
        // Names for icon-only controls and images, read out by screen readers
        a11y:{
            close:"Close",
            openMenu:"Open menu",
            settings:"Settings",
            photo:"Portrait of Yasser",
            previousClients:"Previous clients",
            nextClients:"Next clients",
            feedback:"Share your feedback",
        },
        navigation:{
            designedBy: "Designed and Developed by YasDle",
            rights:`All rights reserved © ${CURRENT_YEAR}`,
            privacy:'<a href="privacy.html" class="info-link">Privacy</a>',
        },
        settings:{
            language:"Language",
            en:"English",
            ar:"Arabic",
            darkMode:"Dark Mode",
            undergraduate:"Show Undergraduate experience",
            swipeClients:"Swipe through clients",
            save:"Save settings locally",
            hint: "Your settings are saved in this browser as soon as you change one, so they're ready on your next visit. Turn this off to stop saving them and clear what's saved.",
        },
        feedback:{
            title:"your say!",
            description:"Please share your thoughts, suggestions, or any issues you encountered while using my website. Your input helps me improve and provide a better experience for all visitors.",
            placeholder:"Got a thought? Share it here...",
            submit:"Submit Feedback",
            inProgress:"Submitting your feedback...",
            success:"Feedback sent successfully. Thank you!",
            fail:"Failed to send feedback. Please try again later.",
            consent:`Before you share your thoughts: your IP address and a screenshot of the section you're viewing are sent along with your feedback, to help me understand and fix issues. Your choice is saved in this browser. <a href="privacy.html">Learn more</a>`,
            accept:"Agree and continue",
        },
        traits:{
            list:"A bit about me",
            show:"Show traits",
            hide:"Hide traits",
        },
        // Experience durations. year and month are counted forms: Intl.PluralRules picks one of
        // one/two/few/many/other for the number, falling back to other
        duration:{
            year:{ one:"{count} year", other:"{count} years" },
            month:{ one:"{count} month", other:"{count} months" },
            yearsAndMonths:"{years} and {months}",
            moreThan:"more than {years}",
            aboutAndHalf:"about {years} and a half",
            moreThanAndHalf:"more than {years} and a half",
            decadeAndHalf:"more than a decade and a half",
            dozenYears:"more than a dozen years",
            decade:"more than a decade",
            aboutDecade:"about a decade",
            nearlyDecade:"nearly a decade",
            underHalfYear:"less than half a year",
            aboutHalfYear:"about half a year",
            overHalfYear:"more than half a year",
            nearlyYear:"nearly a year",
        },
        clientDetails:{
            workingFor:"I've been working here for {duration}",
            workedFor:"I worked here for {duration}",
            visit:'Visit {company} Website <a href="{url}" target="_blank" rel="noopener">here</a>!',
        },
        // Content: each client, service and trait's text, under the key in its data (js/experience.js,
        // js/services.js, js/characteristics.js)
        clientList:{
            "jotun":{
                company:"Jotun Paints",
                position:"Sales Executive",
                description:"My first job ever. A place to learn how to deal with people, how to manage time and how to be responsible.\n My main responsibility was to help the clients, introduce the products and close deals.\n",
            },
            "kidzone":{
                company:"KidZone",
                position:"Mentor",
                description:"As \"Little Inventors\" program mentor, I was responsible for teaching kids the basics of physics, electricity, programming and robotics using age appropriate tools and methods to make sure they understand the concepts and have fun at the same time.\n Also, I was responsible for organizing the annual events for the kids, playing roles in the plays that Kidzone hosted for the kids and their families.\n Lastly, I was responsible for documenting the experiments and working on a simple syllabus to be followed by the mentors.",
            },
            "elaf":{
                company:"Elaf Private School",
                position:"Educational Counselor",
                description:"I played the role of the link between the students, their families and the school. I was responsible for helping the students with resolving the diffeculties, guide them to the right path, in addition to organizing events and workshops to help the students to improve their skills.",
            },
            "robotat":{
                company:"Robotat",
                position:"Web developer",
                description:"First attempt to enter the software development world by getting assigned to test some feature manually (black box method) then getting enrolled in the development cycle by delivering some simple models in both front end and back end",
            },
            "menumiz":{
                company:"Menumiz",
                position:"Senior web developer",
                description:"A place where I graded from a junior level to a senior. Learning a lot of the development cycle, collaporate with other departments to learn more, working hard to proof myself professionally and stepping up to be a team leader to keep the wheel rooling.",
            },
            "touchless":{
                company:"Touchless",
                position:"Senior software engineer",
                description:"Being the principle software engineer is something very hard but very rewarding at the same time. During this period of time, I got the chance to meet the brightest minds and not only work with, but learn from as well.",
            },
            "boostorder":{
                company:"Boostorder",
                position:"Senior software engineer",
                description:"Being the principle software engineer is something very hard but very rewarding at the same time. During this period of time, I got the chance to meet the brightest minds and not only work with, but learn from as well.",
            },
            "monster":{
                company:"Monster",
                position:"Software engineer",
                description:"First experiment working in such a big corporate which is the perfect time to engage and see how the collaporation should be done. In addition to feel proud as a working in a such a good reputation enterprises.",
            },
            "timelog":{
                company:"Timelog",
                position:"Senior software engineer I",
                description:"Woring in a team t delive a first class tier code. paricipating in mind storm sessions to detect the weakness points in the app and workin with task force team to present a solid plan to migrate to the legacy solutions to the latest technology.",
            },
            "carsome":{
                company:"Carsome",
                position:"Senior software engineer II",
                description:"Working in a fast paced environment to deliver high quality code that meets the business requirements. Collaborating with cross-functional teams to design, develop, and implement new features and functionalities.",
            },
        },
        serviceList:{
            "architecture":{
                title:"Software Architecture & Development",
                description:"Crafting the foundation of scalable systems, I focus on designing clear, robust, extensible architectures that reduce technical debt and support future growth. From early prototypes to full-scale applications, I ensure clean code, modular architecture, and long-term value.",
            },
            "leadership":{
                title:"Technical Leadership & Consulting",
                description:"With a deep understanding of both business and code, I offer guidance on choosing the right tools, frameworks, and strategies. Whether it is reviewing existing systems or advising on tech direction, I help teams make smart, future-proof decisions.",
            },
            "management":{
                title:"Project & Team Management",
                description:"From planning to delivery, I manage software projects with a focus on clarity, velocity, and collaboration. I lead cross-functional teams, remove blockers, and ensure everyone is aligned and empowered to deliver results. I also support hiring the right talents upon need.",
            },
            "qa":{
                title:"Quality Assurance",
                description:"I ensure software reliability through a deep manual testing. From carefully crafted test cases to real-world scenario validation, I help catch issues early, improve user experience, and maintain consistent quality across releases.",
            },
            "maintenance":{
                title:"Maintenance & Support",
                description:"My work does not end with project delivery; it extends into ensuring long-term reliability. I stay involved to monitor functionality, fix issues, and adapt the software as requirements evolve, so it continues to serve its purpose effectively.",
            },
            "mentoring":{
                title:"Coaching & Mentoring",
                description:"I coach and mentor developers and teams to grow their technical skills and professional thinking. Through hands-on sessions, code reviews, and career guidance, I help individuals level up and teams become more effective and self-sufficient.",
            },
        },
        traitList:{
            "engineer":{
                label:"Software engineer",
                tooltip:"Placeholder: what I build and how I like to work.",
            },
            "dad":{
                label:"Dad",
                tooltip:"Placeholder: a line about family life.",
            },
            "cars":{
                label:"Car enthusiast",
                tooltip:"Placeholder: the cars I love and why.",
            },
            "self-taught":{
                label:"Self-taught",
                tooltip:"Placeholder: how I taught myself to code.",
            },
            "team-lead":{
                label:"Team lead",
                tooltip:"Placeholder: what leading a team taught me.",
            },
            "mentor":{
                label:"Mentor",
                tooltip:"Placeholder: who I mentor and how.",
            },
            "problem-solver":{
                label:"Problem solver",
                tooltip:"Placeholder: the kind of problems I enjoy.",
            },
            "learner":{
                label:"Lifelong learner",
                tooltip:"Placeholder: what I'm learning right now.",
            },
        },
    },
    ar: {
        top:{
            navigation:"البداية",
            scroll: " قم بالتمرير لأسفل لمعرفة المزيد...",
        },
        about:{
            navigation:"مــن أنــا",
            title: "مــن أنــا",
            description:'اسمي ياسر، أنا مهندس برمجيات حيث أني علمت نفسي بنفسي، أمتلك <span class="experience-duration"></span> من الخبرة، وشغوف بتحدّي عقلي من خلال حلّ المشكلات المعقّدة، وكتابة الأكواد، وتعلّم كل ما هو جديد. عملت في شركات متعددة الأحجام، بدءًا من الشركات الناشئة مرورًا بالمؤسسات المتوسطة وصولًا إلى الشركات الكبرى، حيث تنقلت في مسيرتي المهنية من مطوّر مبتدئ إلى مطوّر متوسط، ثم إلى دورٍ كبير المهندسين (Senior)، كما تولّيت قيادة فريق لفترة قصيرة. أمتلك خبرة عملية في تطوير تطبيقات الويب والهواتف المحمولة وسطح المكتب.',
            services: "اطلع على خدماتي",
            session: "احجز جلسة استشارية معي",
        },
        clients:{
            navigation:"العملاء",
            title: "أين تركت بصماتي",
            hint: "استخدم أزرار التوجيه لتستطيع اللتمرير على العملاء، واضغط على شعار العميل لمعرفة المزيد...",
            hintSwipe: "اسحب لليمين أو اليسار لتصفح العملاء، واضغط على شعار العميل لمعرفة المزيد...",
            download: " أو ببساطة قم بتحميل سيرتي الذاتية من",
            here: "هـــنــا",
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
            copyFailed:"تعذّر النسخ، يرجى نسخه يدويًا",
            senEmail:"أرسل بريد إلكتروني باستخدام تطبيق البريد المفضل لديك",
            copy:"نسخ البريد الإلكتروني",
        },
        a11y:{
            close:"إغلاق",
            openMenu:"فتح القائمة",
            settings:"الإعدادات",
            photo:"صورة شخصية لياسر",
            previousClients:"العملاء السابقون",
            nextClients:"العملاء التاليون",
            feedback:"شارك رأيك",
        },
        navigation:{
            designedBy: '<p dir="rtl">  صُمّم وطُوّر من قبل  <span dir="ltr">YasDle</span>',
            rights:`كل الحقوق محفوظة © ${CURRENT_YEAR}`,
            privacy:'<a href="privacy.html?lang=ar" class="info-link">الخصوصية</a>',
        },
        settings:{
            language:"اللغة",
            en:"الانجليزية",
            ar:"العربية",
            darkMode:"الوضع الداكن",
            undergraduate:"عرض خبرات المرحلة الجامعية",
            swipeClients:"التمرير بالسحب بين العملاء",
            save:"حفظ الإعدادات محليًا",
            hint:"تُحفَظ إعداداتك في هذا المتصفح بمجرد أن تغيّر أيًّا منها، لتجدها جاهزة في زيارتك القادمة. أوقف هذا الخيار لإيقاف حفظها وحذف ما حُفِظ.",
        },
        feedback:{
            title:"أبدِ رأيك!",
            description:" شارك أفكارك، اقتراحاتك، أو أي مشكلات واجهتها أثناء استخدام موقعي الإلكتروني. تساعدني ملاحظاتك في التحسين وتوفير تجربة أفضل لجميع الزوار.",
            placeholder:"لديك فكرة؟ شاركها هنا...",
            submit:"أرسل",
            inProgress:"جاري إرسال ملاحظاتك...",
            success:"تم إرسال ملاحظاتك بنجاح. شكرًا لك!",
            fail:"فشل في إرسال الملاحظات. يرجى المحاولة مرة أخرى لاحقًا.",
            consent:`قبل أن تشاركنا رأيك: يُرسَل عنوان IP الخاص بك ولقطة شاشة للقسم الذي تشاهده مع ملاحظاتك، لمساعدتي على فهم المشكلات وإصلاحها. يُحفَظ اختيارك في هذا المتصفح. <a href="privacy.html?lang=ar">اعرف المزيد</a>`,
            accept:"موافق ومتابعة",
        },
        traits:{
            list:"عني باختصار",
            show:"إظهار الصفات",
            hide:"إخفاء الصفات",
        },
        duration:{
            year:{ one:"سنة", two:"سنتين", few:"{count} سنوات", many:"{count} سنة", other:"{count} سنة" },
            month:{ one:"شهر", two:"شهرين", few:"{count} أشهر", many:"{count} شهرًا", other:"{count} شهر" },
            yearsAndMonths:"{years} و{months}",
            moreThan:"أكثر من {years}",
            aboutAndHalf:"حوالي {years} ونصف",
            moreThanAndHalf:"أكثر من {years} ونصف",
            decadeAndHalf:"أكثر من عقد ونصف",
            dozenYears:"أكثر من اثني عشر عامًا",
            decade:"أكثر من عقد من الزمن",
            aboutDecade:"حوالي عقد من الزمن",
            nearlyDecade:"ما يقرب من عقد من الزمن",
            underHalfYear:"أقل من نصف سنة",
            aboutHalfYear:"حوالي نصف سنة",
            overHalfYear:"أكثر من نصف سنة",
            nearlyYear:"ما يقرب من سنة",
        },
        clientDetails:{
            workingFor:"أعمل في هذه الشركة منذ {duration}",
            workedFor:"عملت في هذه الشركة لمدة {duration}",
            visit:'زر موقع {company} الإلكتروني <a href="{url}" target="_blank" rel="noopener">من هنا</a>!',
        },
        // Content; anything missing here shows in English
        clientList:{
            "jotun":{
                company:"دهانات جوتن",
                position:"مندوب مبيعات",
                description:"كانت هذه أول وظيفة لي على الإطلاق — المكان الذي تعلمت فيه كيفية التعامل مع الناس، وإدارة الوقت، وتحمل المسؤولية.\n كانت مسؤوليتي الأساسية مساعدة العملاء، والتعريف بالمنتجات، وإتمام صفقات البيع.\n",
            },
            "kidzone":{
                position:"مشرف برنامج المخترعون الصغار",
                description:"بصفتي مشرفًا في برنامج \"المخترعون الصغار\"، كنت مسؤولاً عن تعليم الأطفال أساسيات الفيزياء والكهرباء والبرمجة والروبوتات باستخدام أدوات وأساليب مناسبة لأعمارهم، لضمان الفهم والمتعة في آنٍ واحد.\n كما كنت مسؤولاً عن تنظيم الفعاليات السنوية للأطفال، والمشاركة في المسرحيات التي تستضيفها كيدزون للأطفال وعائلاتهم.\n وأخيرًا، كنت مسؤولاً عن توثيق التجارب وإعداد منهج مبسط يُتبع من قِبَل المشرفين.",
            },
            "elaf":{
                company:"مدرسة إيلاف الخاصة",
                position:"موجّه تربوي",
                description:"كنت همزة الوصل بين الطلاب وأسرهم والمدرسة، ومسؤولًا عن مساعدة الطلاب في تجاوز الصعوبات، وتوجيههم نحو الطريق الصحيح، بالإضافة إلى تنظيم الفعاليات وورش العمل التي تساعدهم على تطوير مهاراتهم.",
            },
            "robotat":{
                position:"مطوّر ويب",
                description:"كانت أول محاولة لدخولي عالم تطوير البرمجيات، حيث بدأت باختبار بعض الخصائص يدويًا (طريقة الصندوق الأسود)، ثم شاركت في دورة التطوير بتسليم نماذج بسيطة في الواجهة الأمامية والخلفية.",
            },
            "menumiz":{
                position:"مطور ويب خبير",
                description:"المكان الذي انتقلت فيه من مستوى مبتدئ إلى مستوى أول، وتعلمت الكثير عن دورة التطوير الكاملة، وتعاونت مع أقسام مختلفة لاكتساب معرفة أوسع. عملت بجد لإثبات نفسي مهنيًا، وتدرجت حتى أصبحت قائد فريق للحفاظ على عجلة العمل مستمرة.",
            },
            "touchless":{
                position:"مهندس برمجيات خبير",
                description:"كوني المهندس الرئيسي في الفريق كانت مسؤولية صعبة لكنها مجزية جدًا في الوقت نفسه. خلال هذه الفترة سنحت لي الفرصة للتعرف على بعض من ألمع العقول، والعمل معهم والتعلم منهم كذلك.",
            },
            "boostorder":{
                position:"مهندس برمجيات خبير",
                description:"العمل كمهندس برمجيات رئيسي كان تحديًا كبيرًا وتجربة غنية جدًا. خلال هذه المدة، التقيت وتعاونت مع نخبة من الموهوبين، وتعلمت الكثير من الخبرات العملية والفكرية.",
            },
            "monster":{
                position:"مهندس برمجيات",
                description:"كانت أول تجربة لي في شركة ضخمة، أتيحت لي فيها فرصة التعرف على بيئة عمل مؤسساتية متكاملة، وكيف يتم التعاون بين الفرق بشكل احترافي. كما شعرت بالفخر لكوني جزءًا من مؤسسة ذات سمعة متميزة.",
            },
            "timelog":{
                position:"مهندس برمجيات خبير (مستوى 1)",
                description:"أعمل ضمن فريق متميز لتقديم كود برمجي على أعلى مستوى. أشارك في جلسات العصف الذهني لتحديد نقاط الضعف في النظام، وأعمل مع فريق المهام الخاصة لوضع خطة قوية لنقل الأنظمة القديمة إلى أحدث التقنيات.",
            },
            "carsome":{
                position:"مهندس برمجيات خبير (مستوى 2)",
                description:"أعمل في بيئة سريعة الإيقاع لتقديم كود عالي الجودة يلبّي متطلبات العمل. أتعاون مع فرق متعددة التخصصات لتصميم وتطوير وتنفيذ ميزات ووظائف جديدة.",
            },
        },
        serviceList:{
            "architecture":{
                title:"هندسة وتطوير البرمجيات",
                description:"أعمل على بناء الأساس لأنظمة قابلة للتوسع، مع التركيز على تصميم هياكل برمجية واضحة، قوية وقابلة للتطوير تقلل من الديون التقنية وتدعم النمو المستقبلي. من النماذج الأولية المبكرة إلى التطبيقات الكاملة، أحرص على كتابة كود نظيف وهيكلية منظمة تحقق قيمة طويلة الأمد.",
            },
            "leadership":{
                title:"القيادة التقنية والاستشارات",
                description:"بخبرة تجمع بين فهم الأعمال والبرمجة، أقدم استشارات تساعد على اختيار الأدوات، الأطر، والاستراتيجيات المناسبة. سواء في مراجعة الأنظمة الحالية أو في توجيه المسار التقني، أساعد الفرق على اتخاذ قرارات ذكية ومستقبلية.",
            },
            "management":{
                title:"إدارة المشاريع والفرق",
                description:"من مرحلة التخطيط إلى التسليم، أدير المشاريع البرمجية بتركيز على الوضوح، السرعة، والتعاون. أقود فرقاً متعددة التخصصات، أزيل العقبات، وأضمن أن الجميع يعمل بانسجام لتحقيق النتائج. كما أساهم في اختيار وتوظيف المواهب المناسبة عند الحاجة.",
            },
            "qa":{
                title:"ضمان الجودة",
                description:"أضمن موثوقية البرمجيات من خلال اختبارات دقيقة وشاملة. من تصميم حالات اختبار مدروسة إلى محاكاة السيناريوهات الواقعية، أساعد في اكتشاف المشكلات مبكراً، وتحسين تجربة المستخدم، والحفاظ على جودة ثابتة عبر الإصدارات.",
            },
            "maintenance":{
                title:"الصيانة والدعم",
                description:"عملي لا ينتهي عند تسليم المشروع؛ بل يمتد لضمان استقراره على المدى الطويل. أتابع أداء النظام، أصلح المشكلات عند ظهورها، وأطور الحلول مع تغيّر المتطلبات ليبقى البرنامج يخدم هدفه بكفاءة.",
            },
            "mentoring":{
                title:"التدريب والإرشاد",
                description:"أقوم بتدريب وإرشاد المطورين والفرق لتطوير مهاراتهم التقنية والتفكير المهني. من خلال جلسات عملية، مراجعات للكود، وتوجيه مهني، أساعد الأفراد على الارتقاء بمستواهم وتتقدم الفرق لتصبح أكثر فعالية واعتمادًا على نفسها.",
            },
        },
        traitList:{
            "engineer":{
                label:"مهندس برمجيات",
                tooltip:"نص مؤقت: ما أبنيه وطريقتي في العمل.",
            },
            "dad":{
                label:"أب",
                tooltip:"نص مؤقت: سطر عن الحياة العائلية.",
            },
            "cars":{
                label:"عاشق للسيارات",
                tooltip:"نص مؤقت: السيارات التي أحبها ولماذا.",
            },
            "self-taught":{
                label:"تعلّم ذاتي",
                tooltip:"نص مؤقت: كيف علّمت نفسي البرمجة.",
            },
            "team-lead":{
                label:"قائد فريق",
                tooltip:"نص مؤقت: ما تعلمته من قيادة الفريق.",
            },
            "mentor":{
                label:"مرشد",
                tooltip:"نص مؤقت: من أرشدهم وكيف.",
            },
            "problem-solver":{
                label:"محب لحل المشكلات",
                tooltip:"نص مؤقت: نوع المشكلات التي أستمتع بحلها.",
            },
            "learner":{
                label:"متعلم دائم",
                tooltip:"نص مؤقت: ما أتعلمه حاليًا.",
            },
        },
    },
};

// Looks up a dotted key, e.g. "settings.darkMode"
export function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

function currentLanguage() {
  return document.documentElement.lang === "ar" ? "ar" : "en";
}

// The text for a key in the current language, falling back to English; {name} placeholders are
// filled from values, e.g. t("duration.moreThan", { years: "3 years" })
export function t(key, values = {}) {
  const text =
    getNestedValue(translations[currentLanguage()], key) ?? getNestedValue(translations.en, key) ?? key;
  return String(text).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}

// A counted form for a number, e.g. plural("duration.year", 2) is "2 years" or "سنتين"
export function plural(key, count) {
  const forms = getNestedValue(translations[currentLanguage()], key) ?? getNestedValue(translations.en, key);
  const form = forms[new Intl.PluralRules(currentLanguage()).select(count)] ?? forms.other;
  return form.replace("{count}", count);
}

// The current language, and whether it reads right to left
function getLanguage() {
  // lang is "" (never null) when unset, so ?? would not fall back
  return document.documentElement.lang || "en";
}

export const language = {
  get value() {
    return getLanguage();
  },
  get isRTL() {
    return this.value === "ar";
  },
};
