"use strict";
import { getSetting } from "./settings.js";
import { t, plural } from "./i18n.js";

// The work history and how long it adds up to

// Each client's company, position and description live in js/i18n.js under clientList, keyed by key
export const experienceJson = [
  {
    id: -3,
    key: "jotun",
    duration: 18,
    isCurrentCompany: false,
    websiteUrl: "https://www.jotun.com/ww-en",
    imageSrc: "jotun.avif",
    embededMapLink: "pb=!1m21!1m12!1m3!1d831.3169739645502!2d36.21109946875679!3d33.546415270793496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m6!3e6!4m0!4m3!3m2!1d33.54617384120685!2d36.2111236086386!5e0!3m2!1sen!2smy!4v1759566409228!5m2!1sen!2smy",
  },
  {
    id: -2,
    key: "kidzone",
    duration: 24,
    isCurrentCompany: false,
    websiteUrl: "https://www.facebook.com/KidZoneSyria/",
    imageSrc: "Kidzone.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d318.486929755816!2d36.23401289362759!3d33.532001744626825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1518ddd8e68c44b9%3A0x2b47005f20b74050!2sSevan%20Restaurant!5e0!3m2!1sen!2smy!4v1759566571936!5m2!1sen!2smy",
  },
  {
    id: -1,
    key: "elaf",
    duration: 6,
    isCurrentCompany: false,
    websiteUrl: "http://lms.elaf-school.com/",
    imageSrc: "elaf.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d3325.92347102176!2d36.21598009999999!3d33.5293753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1518de86f19b8781%3A0x6e4db6f96f46222b!2sElaf%20Private%20School!5e0!3m2!1sen!2smy!4v1757146056675!5m2!1sen!2smy",
  },
  {
    id: 0,
    key: "robotat",
    duration: 18,
    isCurrentCompany: false,
    websiteUrl: "https://www.robotat.com",
    imageSrc: "robotat.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d3983.7287107914963!2d101.6519883!3d3.166001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87b783c5818efed7%3A0xfa5b51c991c1d246!2sPlaza%20Mont%E2%80%99%20Kiara!5e0!3m2!1sen!2smy!4v1756546255158!5m2!1sen!2smy",
  },
  {
    id: 1,
    key: "menumiz",
    duration: 32,
    isCurrentCompany: false,
    websiteUrl: "https://www.menumiz.com",
    imageSrc: "Menumiz.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d3983.9404660358446!2d101.66315911147416!3d3.1104541968520425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc48f196c74b49%3A0xa754e103215446f9!2sMenumiz%20Sdn.%20Bhd.!5e0!3m2!1sen!2smy!4v1756546615873!5m2!1sen!2smy",
  },
  {
    id: 2,
    key: "touchless",
    duration: 2,
    isCurrentCompany: false,
    websiteUrl: "https://touchless.asia",
    imageSrc: "Touchless.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d3983.7088143460246!2d101.66423242602517!3d3.171170203014705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc485de491c479%3A0xa40997f3dc918ec8!2sSolaris%20Dutamas%2C%201%2C%20Jln%20Dutamas%201%2C%20Solaris%20Dutamas%2C%2050754%20Kuala%20Lumpur%2C%20Wilayah%20Persekutuan%20Kuala%20Lumpur!5e0!3m2!1sen!2smy!4v1756546841444!5m2!1sen!2smy",
  },
  {
    id: 3,
    key: "boostorder",
    duration: 15,
    isCurrentCompany: false,
    websiteUrl: "https://www.boostorder.com",
    imageSrc: "boostorder.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d3983.9086965997476!2d101.66931198601625!3d3.1188508452488763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc49f32cabd35b%3A0x23e273f52c551332!2sBoostorder%20-%20KL%20Eco%20City!5e0!3m2!1sen!2smy!4v1756546887913!5m2!1sen!2smy",
  },
  {
    id: 4,
    key: "monster",
    duration: 24,
    isCurrentCompany: false,
    websiteUrl: "https://www.monster.com/about",
    imageSrc: "monster.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d3983.7913515491928!2d101.7089010760252!3d3.1496712531472517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc37f6f1c8d147%3A0x8c048efb4266c0bf!2sMenara%20AIA%20Sentral!5e0!3m2!1sen!2smy!4v1756546918525!5m2!1sen!2smy",
  },
  {
    id: 5,
    key: "timelog",
    duration: 18,
    isCurrentCompany: false,
    websiteUrl: "https://timelog.com/en",
    imageSrc: "timelog.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d3983.75408995014!2d101.71612601147427!3d3.159395096802703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc37d017eaaaab%3A0xd5c2bff92ec47876!2sINSCALE%20Malaysia!5e0!3m2!1sen!2smy!4v1756547062785!5m2!1sen!2smy",
  },
  {
    id: 6,
    key: "carsome",
    joinedDate: "2025-07-14",
    isCurrentCompany: true,
    websiteUrl: "https://www.carsome.my",
    imageSrc: "carsome.avif",
    embededMapLink: "pb=!1m18!1m12!1m3!1d3983.745919023914!2d101.614575!3d3.161523399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc4f6ce7472157%3A0x740a20f1d4ecdee!2sCARSOME%20Malaysia%20HQ!5e0!3m2!1sen!2smy!4v1761457307647!5m2!1sen!2smy",
  },
];

// Undergraduate jobs are the entries with a negative id
const undergraduateMonths = experienceJson
  .filter((x) => x.id < 0)
  .reduce((total, x) => total + x.duration, 0);

export const experienceStartDate = new Date(2016, 6, 23);

export function setExperienceDuration(date = null, months = null) {
  let isShowingUnderGraduateExperience = getSetting("showUndergraduate");
  const years = (count) => plural("duration.year", count);

  if (date) {
    const joinedDate = new Date(date);
    const todayDate = new Date();
    let totalMonths =
      (todayDate.getFullYear() - joinedDate.getFullYear()) * 12 +
      todayDate.getMonth() -
      joinedDate.getMonth();

    if (todayDate.getDate() < joinedDate.getDate()) {
      totalMonths -= 1;
    }

    if (isShowingUnderGraduateExperience) {
      totalMonths += undergraduateMonths;
    }

    const workingDurationInYears = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    const workingDurationApproximation = totalMonths / 12;

    if (workingDurationInYears >= 15 && workingDurationInYears < 20) {
      return t("duration.decadeAndHalf");
    } else if (workingDurationInYears >= 12 && workingDurationInYears < 15) {
      return t("duration.dozenYears");
    } else if (workingDurationInYears >= 10 && workingDurationInYears < 12) {
      return t("duration.decade");
    } else if (
      workingDurationApproximation >= 9.5 &&
      workingDurationApproximation < 10
    ) {
      return t("duration.aboutDecade");
    } else if (workingDurationInYears >= 1) {
      if (remainingMonths < 5) {
        return t("duration.moreThan", { years: years(workingDurationInYears) });
      } else if (remainingMonths >= 5 && remainingMonths < 6) {
        return t("duration.aboutAndHalf", { years: years(workingDurationInYears) });
      } else if (remainingMonths >= 6) {
        if (workingDurationInYears === 9) {
          return t("duration.nearlyDecade");
        }
        return t("duration.moreThanAndHalf", { years: years(workingDurationInYears) });
      }
    } else {
      if (remainingMonths < 5) {
        return t("duration.underHalfYear");
      } else if (remainingMonths >= 5 && remainingMonths < 6) {
        return t("duration.aboutHalfYear");
      } else if (remainingMonths >= 6 && remainingMonths <= 9) {
        return t("duration.overHalfYear");
      }

      return t("duration.nearlyYear");
    }
  } else if (months) {
    const fullYears = Math.floor(parseInt(months) / 12);
    const remainingMonths = parseInt(months) % 12;
    const monthsText = plural("duration.month", remainingMonths);
    if (fullYears > 0 && remainingMonths > 0) {
      return t("duration.yearsAndMonths", { years: years(fullYears), months: monthsText });
    } else if (fullYears > 0) {
      return years(fullYears);
    } else if (remainingMonths > 0) {
      return monthsText;
    }

    return "";
  }
}
