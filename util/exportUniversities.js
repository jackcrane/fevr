import { prisma } from "../lib/db.js";
import { writeFileSync } from "fs";

const unis = await prisma.university.findMany();
writeFileSync("unis.json", JSON.stringify(unis, null, 2));
