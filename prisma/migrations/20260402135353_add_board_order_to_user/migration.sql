-- AlterTable
ALTER TABLE "User" ADD COLUMN     "boardOrder" UUID[] DEFAULT ARRAY[]::UUID[];
