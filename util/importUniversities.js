import { prisma } from "../lib/db.js";
import { readFileSync } from "fs";

let universities = JSON.parse(readFileSync("unis.json", "utf-8"));
universities = universities.map((uni) => {
  delete uni.id;
  return uni;
});

for (const uni of universities) {
  try {
    await prisma.university.create({
      data: uni,
    });
    console.log("University saved");
  } catch (error) {
    if (error.code === "P2002") {
      console.log("University exists, skipping");
    } else {
      throw new Error(error);
    }
  }
}
