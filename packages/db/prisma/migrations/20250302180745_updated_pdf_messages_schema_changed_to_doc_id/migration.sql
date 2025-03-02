/*
  Warnings:

  - You are about to drop the column `documentId` on the `ContentChunk` table. All the data in the column will be lost.
  - Added the required column `docId` to the `ContentChunk` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContentChunk" DROP CONSTRAINT "ContentChunk_documentId_fkey";

-- AlterTable
ALTER TABLE "ContentChunk" DROP COLUMN "documentId",
ADD COLUMN     "docId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ContentChunk" ADD CONSTRAINT "ContentChunk_docId_fkey" FOREIGN KEY ("docId") REFERENCES "Documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
