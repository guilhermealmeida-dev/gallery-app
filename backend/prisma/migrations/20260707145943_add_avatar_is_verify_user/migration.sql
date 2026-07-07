/*
  Warnings:

  - You are about to drop the column `avatar` on the `albuns` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "albuns" DROP COLUMN "avatar";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "isVerify" BOOLEAN NOT NULL DEFAULT false;
