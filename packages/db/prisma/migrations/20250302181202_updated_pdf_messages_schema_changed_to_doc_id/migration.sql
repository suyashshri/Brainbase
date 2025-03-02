/*
  Warnings:

  - You are about to drop the column `docId` on the `ContentChunk` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `PdfMessages` table. All the data in the column will be lost.
  - Added the required column `documentId` to the `ContentChunk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `docId` to the `PdfMessages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContentChunk" DROP CONSTRAINT "ContentChunk_docId_fkey";

-- DropForeignKey
ALTER TABLE "PdfMessages" DROP CONSTRAINT "PdfMessages_documentId_fkey";

-- AlterTable
ALTER TABLE "ContentChunk" DROP COLUMN "docId",
ADD COLUMN     "documentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PdfMessages" DROP COLUMN "documentId",
ADD COLUMN     "docId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PdfMessages" ADD CONSTRAINT "PdfMessages_docId_fkey" FOREIGN KEY ("docId") REFERENCES "Documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentChunk" ADD CONSTRAINT "ContentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
