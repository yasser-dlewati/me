"use strict"
import { observeReveal } from "./reveal.js";
import { escapeHtml } from "./html.js";
import { t } from "./i18n.js";

const accordion = document.querySelector("#accordion");

// Each service's title and description live in js/i18n.js under serviceList, keyed by key
const servicesJson = [
  {
    id: 1,
    key: "architecture",
  },
  {
    id: 2,
    key: "leadership",
  },
  {
    id: 3,
    key: "management",
  },
  {
    id: 4,
    key: "qa",
  },
  {
    id: 5,
    key: "maintenance",
  },
  {
    id: 6,
    key: "mentoring",
  },
];
  
export function renderServices(){
    let servicesContent = '';
    servicesJson.forEach( service => {
        let title = escapeHtml(t(`serviceList.${service.key}.title`));
        let description = escapeHtml(t(`serviceList.${service.key}.description`));
        let panelId = `service-${escapeHtml(service.key)}`;
        servicesContent += `
        <div class="card">
            <a class="collapsed btn card-header service" href="#${panelId}" role="button" aria-expanded="false" aria-controls="${panelId}">
                <i class="fa-regular fa-square-plus" aria-hidden="true"></i>
                <h5>
                    ${title}
                </h5>
            </a>
            <div id="${panelId}" class="collapse">
                <div class="card-body">
                    <p>
                        ${description}
                    </p>
                </div>
            </div>
        </div>
        `;
    });

    accordion.innerHTML = servicesContent;
    observeReveal(accordion.querySelectorAll('.card'), 0.15);
}

// The accordion: one service open at a time, with the same height animation Bootstrap's script
// gave it. Bootstrap's CSS is still loaded (.collapse, .collapsing, .show), and these functions drive
// those classes in the same order its script did

let isAnimating = false;

// Calls back when the element's transition ends; the timeout covers no transition (reduced motion)
function afterTransition(element) {
  const duration = parseFloat(getComputedStyle(element).transitionDuration) * 1000 || 0;
  return new Promise((resolve) => {
    const finish = () => {
      element.removeEventListener("transitionend", onEnd);
      clearTimeout(fallback);
      resolve();
    };
    const onEnd = (event) => {
      if (event.target === element) finish();
    };
    element.addEventListener("transitionend", onEnd);
    const fallback = setTimeout(finish, duration + 50);
  });
}

function setHeaderOpen(header, open) {
  header.classList.toggle("collapsed", !open);
  header.setAttribute("aria-expanded", String(open));
}

async function showPanel(header, panel) {
  setHeaderOpen(header, true);
  panel.classList.remove("collapse");
  panel.classList.add("collapsing");
  panel.style.height = "0px";
  // Reading scrollHeight lays the panel out at 0, so the height transition starts from there
  panel.style.height = `${panel.scrollHeight}px`;
  await afterTransition(panel);
  panel.classList.remove("collapsing");
  panel.classList.add("collapse", "show");
  panel.style.height = "";

  header.querySelector("i").classList.replace("fa-square-plus", "fa-square-minus");
  header.style.borderBottom = "none";
  accordion.querySelectorAll(".service").forEach((other) => {
    if (other !== header) other.style.borderBottom = "1px solid rgba(0, 0, 0, 0.2)";
  });
}

async function hidePanel(header, panel) {
  panel.style.height = `${panel.getBoundingClientRect().height}px`;
  void panel.offsetHeight;
  panel.classList.add("collapsing");
  panel.classList.remove("collapse", "show");
  setHeaderOpen(header, false);
  panel.style.height = "";
  await afterTransition(panel);
  panel.classList.remove("collapsing");
  panel.classList.add("collapse");

  header.querySelector("i").classList.replace("fa-square-minus", "fa-square-plus");
  header.style.borderBottom = "1px solid rgba(0, 0, 0, 0.2)";
}

async function toggleService(header) {
  if (isAnimating) return;
  const panel = document.getElementById(header.getAttribute("aria-controls"));
  const opening = !panel.classList.contains("show");
  const othersOpen = opening
    ? [...accordion.querySelectorAll(".collapse.show")].filter((other) => other !== panel)
    : [];

  isAnimating = true;
  await Promise.all([
    opening ? showPanel(header, panel) : hidePanel(header, panel),
    ...othersOpen.map((other) => hidePanel(other.previousElementSibling, other)),
  ]);
  isAnimating = false;
}

// Called once from main.js at start-up; the services themselves render when the language is applied.
// The headers are re-rendered on a language switch, so clicks are handled on the accordion itself
export function initServices() {
  accordion.addEventListener("click", (event) => {
    const header = event.target.closest(".service");
    if (!header) return;
    event.preventDefault();
    toggleService(header);
  });
  // Enter already clicks a link; Space should too, since the headers act as buttons
  accordion.addEventListener("keydown", (event) => {
    const header = event.target.closest(".service");
    if (!header || event.key !== " ") return;
    event.preventDefault();
    toggleService(header);
  });
}
