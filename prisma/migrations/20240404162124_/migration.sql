/*
  Warnings:

  - A unique constraint covering the columns `[fullName,shortName]` on the table `university` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `university_fullName_shortName_key` ON `university`(`fullName`, `shortName`);
