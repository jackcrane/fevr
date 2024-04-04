import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper function for delays
export const timeout = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const dump_banner = async (university, page, saveToDb = true) => {
  const outerResults = [];

  await page.goto(university.dynamicScheduleUrl);
  await page.waitForSelector("select");

  // Find all matching terms
  const _matchingTerms = await page.evaluate(() => {
    const selectElement = document.querySelector("select");
    const options = selectElement.options;
    const matching = [];
    const matchingTermNames = [];
    for (let i = 0; i < options.length; i++) {
      const optionText = options[i].text;
      if (optionText.includes("2024")) {
        matching.push(i); // Store the index of the matching term
        matchingTermNames.push(optionText);
      }
    }
    return [matching, matchingTermNames];
  });
  const matchingTerms = _matchingTerms[0];

  // Iterate over all matching terms and scrape data
  for (const termIndex of matchingTerms) {
    console.log("Scraping term", matchingTerms[termIndex]);
    await page.evaluate((termIndex) => {
      const selectElement = document.querySelector("select");
      selectElement.selectedIndex = termIndex;
      selectElement.dispatchEvent(new Event("change"));
    }, termIndex);

    await page.click("input[type=submit]");
    await timeout(1000);

    await page.evaluate(() => {
      const selectElement = document.querySelector("#subj_id");
      for (const optionElement of selectElement.options) {
        optionElement.selected = true;
      }
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await page.waitForSelector("input[type=submit]");
    await page.click("input[type=submit]");
    await page.waitForNetworkIdle({
      timeout: 60 * 1000,
    });
    await timeout(4000);

    const content = await page.content();
    const results = parseHtmlForCourses(content, university);
    console.log("Found", results.length, "courses");
    if (saveToDb) {
      await prisma.course.createMany({
        data: results,
        skipDuplicates: true,
      });
    } else {
      console.log(results);
    }

    await page.goto(university.dynamicScheduleUrl);
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
        // scannedAt is null
        OR: {
          scannedAt: {
            equals: null,
          },
          scannedAt: {
            lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          },
        },
      },
    });
    console.log("Found", universities.length, "universities to scan");
    console.log(universities.map((u) => u.fullName).join(", "));
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
main();

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
