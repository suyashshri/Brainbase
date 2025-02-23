/*
  Warnings:

  - You are about to drop the column `usedId` on the `Documents` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `Documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "usedId",
ADD COLUMN     "fileUrl" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
