/*
  Warnings:

  - Changed the type of `fileType` on the `Documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "fileType",
ADD COLUMN     "fileType" TEXT NOT NULL;
