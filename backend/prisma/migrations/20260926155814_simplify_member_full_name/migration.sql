/*
  Warnings:

  - You are about to drop the column `displayName` on the `FamilyMember` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `FamilyMember` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `FamilyMember` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `FamilyMember` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FamilyMember_displayName_idx";

-- DropIndex
DROP INDEX "FamilyMember_familyId_lastName_firstName_idx";

-- AlterTable
ALTER TABLE "FamilyMember" DROP COLUMN "displayName",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "middleName",
ADD COLUMN     "fullName" VARCHAR(200);

-- CreateIndex
CREATE INDEX "FamilyMember_fullName_idx" ON "FamilyMember"("fullName");

-- CreateIndex
CREATE INDEX "FamilyMember_familyId_fullName_idx" ON "FamilyMember"("familyId", "fullName");
