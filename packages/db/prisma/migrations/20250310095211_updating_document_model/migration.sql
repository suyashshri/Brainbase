/*
  Warnings:

  - You are about to drop the column `processed` on the `Documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "processed",
ADD COLUMN     "uploaded" BOOLEAN NOT NULL DEFAULT false;
