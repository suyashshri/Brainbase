-- CreateEnum
CREATE TYPE "userSystemEnum" AS ENUM ('system', 'user');

-- CreateTable
CREATE TABLE "PdfMessages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "userSystemEnum" NOT NULL,

    CONSTRAINT "PdfMessages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PdfMessages" ADD CONSTRAINT "PdfMessages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
