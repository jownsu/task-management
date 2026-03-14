/*
  Warnings:

  - You are about to drop the column `order` on the `Column` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Subtask` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "columnOrder" UUID[] DEFAULT ARRAY[]::UUID[];

-- AlterTable
ALTER TABLE "Column" DROP COLUMN "order",
ADD COLUMN     "taskOrder" UUID[] DEFAULT ARRAY[]::UUID[];

-- AlterTable
ALTER TABLE "Subtask" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "order",
ADD COLUMN     "subtaskOrder" UUID[] DEFAULT ARRAY[]::UUID[];
