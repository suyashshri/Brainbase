/*
  Warnings:

  - You are about to drop the column `filePath` on the `Documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "filePath",
ALTER COLUMN "processed" SET DEFAULT true;
