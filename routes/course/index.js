import { prisma } from "../../lib/db.js";

/*
Request body can look like the following:

// This should match all courses with any codes in the text array, and the code should be the match type provided in style.
Course code: {
  "text": [code],
  "style": "exact" | "contains" | "startsWith" | "endsWith"
}

// This should match all courses with any names in the text array, and the name should be the match type provided in style.
Course name: {
  "text": [name],
  "style": "exact" | "contains" | "startsWith" | "endsWith"
}

// This should match all courses with registration start dates before or after the provided date.
Registration start date: {
  "date": "YYYY-MM-DD",
  "direction": "lt" | "gt"
}

// This should match all courses with registration end dates before or after the provided date.
Registration end date: {
  "date": "YYYY-MM-DD",
  "direction": "lt" | "gt"
}

A course code or a course name must be provided. The other parameters are optional.
*/
export const patch = async (req, res) => {
  console.log(req.body);
  const { name, code, registrationStart, registrationEnd } = req.body;

  if (!name && !code) {
    return res.status(400).json({
      error: "Either course name or course code must be provided",
    });
  }

  // Convert name and code filters into query conditions
  const nameQuery = name?.map((n) => ({
    name: {
      [n.style]: n.text,
    },
  }));
  const codeQuery = code?.map((c) => ({
    code: {
      [c.style]: c.text,
    },
  }));

  // Initialize the queryConditions array with nameQuery and codeQuery
  const queryConditions = [];
  if (nameQuery) queryConditions.push(...nameQuery);
  if (codeQuery) queryConditions.push(...codeQuery);

  // Optional: Add registrationStart and registrationEnd conditions
  if (registrationStart) {
    queryConditions.push({
      registrationStart: {
        [registrationStart.direction]: new Date(registrationStart.date),
      },
    });
  }

  if (registrationEnd) {
    queryConditions.push({
      registrationEnd: {
        [registrationEnd.direction]: new Date(registrationEnd.date),
      },
    });
  }

  // Adjust the where clause to utilize the combined queryConditions
  const courses = await prisma.course.findMany({
    where: {
      AND: [
        // Ensures all conditions must be met, especially useful for date ranges
        {
          OR: queryConditions,
        },
      ],
    },
    take: 100,
    include: {
      university: true,
    },
  });

  return res.json({
    meta: {
      total: courses.length,
    },
    data: courses,
  });
};
