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
      [n.style === "equals" ? "equals" : n.style]: n.text, // Adjusting the property to match Prisma's syntax
    },
  }));
  const codeQuery = code?.map((c) => ({
    code: {
      [c.style === "equals" ? "equals" : c.style]: c.text, // Adjusting the property to match Prisma's syntax
    },
  }));

  // Initialize the queryConditions array to ensure mandatory date conditions are met
  const queryConditions = {
    AND: [], // For mandatory conditions like date ranges
    OR: [], // For optional conditions like name or code
  };

  // Add nameQuery and codeQuery to the OR condition
  if (nameQuery && nameQuery.length) queryConditions.OR.push(...nameQuery);
  if (codeQuery && codeQuery.length) queryConditions.OR.push(...codeQuery);

  // Ensure at least one name or code condition exists
  if (queryConditions.OR.length === 0) {
    return res.status(400).json({
      error: "Invalid query. No valid name or code conditions provided.",
    });
  }

  // Add registrationStart and registrationEnd conditions to AND condition
  if (registrationStart) {
    queryConditions.AND.push({
      registrationStart: {
        [registrationStart.direction]: new Date(registrationStart.date),
      },
    });
  }

  if (registrationEnd) {
    queryConditions.AND.push({
      registrationEnd: {
        [registrationEnd.direction]: new Date(registrationEnd.date),
      },
    });
  }

  // Execute the query with adjusted where clause
  const courses = await prisma.course.findMany({
    where: queryConditions,
    take: 100, // Limit the number of results
    include: {
      university: true, // Assuming you want to include related university data
    },
  });

  return res.json({
    meta: {
      total: courses.length,
    },
    data: courses,
  });
};
