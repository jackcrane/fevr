import puppeteer from "puppeteer";
import { writeFileSync, readFileSync } from "fs";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cliProgress from "cli-progress";

const tests = {
  slu: {
    name: "SLU",
    dyn_sched: "https://banner.slu.edu/ssbprd/bwckschd.p_disp_dyn_sched",
    base: "https://banner.slu.edu",
  },
  cbu: {
    name: "CBU",
    dyn_sched: "https://bweb.cbu.edu/PROD/bwckschd.p_disp_dyn_sched",
    base: "https://bweb.cbu.edu/PROD",
  },
  truman: {
    name: "Truman",
    dyn_sched:
      "https://shale1.truman.edu:8443/ADMINssb/bwckschd.p_disp_dyn_sched",
    base: "https://shale1.truman.edu:8443/ADMINssb",
  },
  semo: {
    name: "SEMO",
    dyn_sched: "https://banssb.semo.edu/prod/bwckschd.p_disp_dyn_sched",
    base: "https://banssb.semo.edu/prod",
  },
  laverne: {
    name: "La Verne",
    dyn_sched:
      "https://ban8ssbtc-prod.laverne.edu/prod/bwckschd.p_disp_dyn_sched",
    base: "https://ban8ssbtc-prod.laverne.edu/prod",
  },
  alabama_a_m: {
    name: "Alabama A&M",
    dyn_sched: "https://ssb1.aamu.edu/PROD/bwckschd.p_disp_dyn_sched",
    base: "https://ssb1.aamu.edu/PROD",
  },
  apsu: {
    name: "APSU",
    dyn_sched: "https://banwssprod.apsu.edu/prod/bwckschd.p_disp_dyn_sched",
    base: "https://banwssprod.apsu.edu/prod",
  },
  nsula: {
    name: "NSULA",
    dyn_sched: "https://connect.nsula.edu/prod/bwckschd.p_disp_dyn_sched",
    base: "https://connect.nsula.edu/prod",
  },
  chattenooga: {
    name: "Chattenooga State",
    dyn_sched:
      "https://blss.chattanoogastate.edu/prod_ssb/bwckschd.p_disp_dyn_sched",
    base: "https://blss.chattanoogastate.edu/prod_ssb",
  },
};

// Helper function for delays
export const timeout = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const dump_banner = async (university, page, saveToDb = true) => {
  const outerResults = [];

  // Ensure page navigation is awaited
  await page.goto(university.dynamicScheduleUrl);
  await page.waitForSelector("select");

  // Select term 'Summer 2024'
  await page.evaluate(() => {
    const allowedTerms = [
      "Summer 2024",
      "Summer Session 2024",
      "Summer Semester 2024",
      "Summer Term III 2024- Ft Campb",
      "Summer Credit Term 2024",
      "Summer I 2024",
      "Summer II 2024",
    ];

    const selectElement = document.querySelector("select");
    const options = selectElement.options;
    for (let i = 0; i < options.length; i++) {
      if (allowedTerms.includes(options[i].text)) {
        selectElement.selectedIndex = i;
        selectElement.dispatchEvent(new Event("change"));
        break;
      }
    }
  });

  // Click the submit button and wait
  await page.click("input[type=submit]");
  await timeout(1000);

  // Select all subjects
  await page.evaluate(() => {
    const selectElement = document.querySelector("#subj_id");
    for (const optionElement of selectElement.options) {
      optionElement.selected = true;
    }
    selectElement.dispatchEvent(new Event("change", { bubbles: true }));
  });

  await page.waitForSelector("input[type=submit]");
  await page.click("input[type=submit]");
  await page.waitForNetworkIdle();
  await timeout(4000);

  // Dump the page content to 'page.html'
  const content = await page.content();

  const results = parseHtmlForCourses(content, university);
  outerResults.push(...results);

  let i = 0;
  console.log("Inserting courses to db");
  if (saveToDb) {
    await prisma.course.createMany({
      data: results,
      skipDuplicates: true,
    });
  } else {
    console.log(results);
  }
};

export const main = async () => {
  let browser = await puppeteer.launch({
    headless: false, // Consider setting to true if you don't need to see the UI
  });
  const page = await browser.newPage();

  try {
    const universities = await prisma.university.findMany({
      where: {
        supportLevel: 2,
      },
    });
    for (const uni in universities) {
      console.log("Dumping for", universities[uni].fullName);
      await dump_banner(universities[uni], page);
      await prisma.university.update({
        where: {
          id: universities[uni].id,
        },
        data: {
          scannedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }

  // writeFileSync("results.json", JSON.stringify(outerResults, null, 2));

  await timeout(600 * 1000);
  await browser.close();
};
// main();

const parseHtmlForCourses = (html, university) => {
  // writeFileSync("page.html", content);

  // Load content into a dom parser
  const $ = cheerio.load(html);

  // Parse and write the courses to 'results.json'
  const data = $(".datadisplaytable")[0];
  const rows = $(data).find(".ddtitle");

  const courses = []; // Array to store course information

  $(rows).each(function () {
    // Extracting course title
    const courseTitleString = $(this).text().trim();

    const courseName = courseTitleString.split(" - ")[0];
    const crn = courseTitleString.split(" - ")[1];
    const courseCode = courseTitleString.split(" - ")[2];
    const section = courseTitleString.split(" - ")[3];

    const link = university.bannerBaseUrl + $(this).find("a").attr("href");

    // Targeting the next tr for the detailed information
    const details = $(this).closest("tr").next("tr").find("td.dddefault");

    // Extracting details more accurately
    const associatedTerm =
      details
        .find("span:contains('Associated Term:')")[0]
        ?.nextSibling?.nodeValue?.trim() || "Not Available";
    const registrationDates =
      details
        .find("span:contains('Registration Dates:')")[0]
        ?.nextSibling?.nodeValue?.trim() || "Not Available";
    const levels =
      details
        .find("span:contains('Levels:')")[0]
        ?.nextSibling?.nodeValue?.trim() || "Not Available";
    const attributes =
      details
        .contents()
        ?.filter(function () {
          return this.nodeType == 3 && this.nodeValue.trim().length > 0; // nodeType 3 = text nodes
        })
        ?.map(function () {
          return this.nodeValue.trim();
        })
        ?.get()
        ?.join(", ") || "Not Available";

    let registrationStart = new Date(registrationDates.split(" to ")[0]);
    let registrationEnd = new Date(registrationDates.split(" to ")[1]);

    // If registration dates are not available or are not valid date objects, set them to null
    if (!isNaN(registrationStart.getTime())) {
      // Compiling the extracted information into an object
      const courseInfo = {
        universityId: university.id,
        link,
        title: courseTitleString,
        name: courseName,
        crn: crn,
        code: courseCode,
        section: section,
        term: associatedTerm,
        registrationStart,
        registrationEnd,
        levels: levels,
        attributes: attributes,
      };

      // Logging to console or pushing to an array
      courses.push(courseInfo);
    }
    // console.log(courseInfo);
  });

  return courses;
};

// const data = readFileSync("page.html", "utf8");
// writeFileSync("results_.json", JSON.stringify(parseHtmlForCourses(data)));
