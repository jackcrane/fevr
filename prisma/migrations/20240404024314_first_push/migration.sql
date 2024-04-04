-- CreateTable
CREATE TABLE `university` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NOT NULL,
    `homepage` VARCHAR(191) NOT NULL,
    `dynamicScheduleUrl` VARCHAR(191) NOT NULL,
    `bannerBaseUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `scannedAt` DATETIME(3) NULL,
    `supportLevel` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course` (
    `id` VARCHAR(191) NOT NULL,
    `universityId` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `crn` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `term` VARCHAR(191) NOT NULL,
    `registrationStart` DATETIME(3) NULL,
    `registrationEnd` DATETIME(3) NULL,
    `levels` VARCHAR(191) NOT NULL,
    `attributes` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `scannedAt` DATETIME(3) NULL,

    UNIQUE INDEX `course_universityId_title_registrationStart_registrationEnd_key`(`universityId`, `title`, `registrationStart`, `registrationEnd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `university`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
