import { prisma } from "../../lib/db.js";

export const get = async (req, res) => {
  const universities = await prisma.university.findMany();
  return res.json(universities);
};
