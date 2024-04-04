import { dump_banner, timeout } from "./app.js";
import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const university = {
  id: 1,
  fullName: "Christian Brothers University",
  shortName: "CBU",
  supportLevel: 2,
  homepage: "https://www.cbu.edu/",
  dynamicScheduleUrl: "https://bweb.cbu.edu/PROD/bwckschd.p_disp_dyn_sched",
  bannerBaseUrl: "https://bweb.cbu.edu/PROD",
};

const test = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  try {
    await dump_banner(university, page, false);
  } catch (error) {
    console.error(error);
  }

  await timeout(600 * 1000);
  await browser.close();
};

// test();

const saveUniversityToPrisma = async () => {
  delete university.id;
  try {
    await prisma.university.create({
      data: university,
    });
    console.log("University saved");
  } catch (error) {
    if (error.code === "P2002") {
      console.log("University exists, skipping");
    } else {
      throw new Error(error);
    }
  }
};

saveUniversityToPrisma();
