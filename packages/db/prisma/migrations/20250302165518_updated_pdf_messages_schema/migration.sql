/*
  Warnings:

  - You are about to drop the column `chatId` on the `PdfMessages` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `PdfMessages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentId` to the `PdfMessages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PdfMessages" DROP CONSTRAINT "PdfMessages_chatId_fkey";

-- AlterTable
ALTER TABLE "PdfMessages" DROP COLUMN "chatId",
ADD COLUMN     "documentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PdfMessages_documentId_key" ON "PdfMessages"("documentId");

-- AddForeignKey
ALTER TABLE "PdfMessages" ADD CONSTRAINT "PdfMessages_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
