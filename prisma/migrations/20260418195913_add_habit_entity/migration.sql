-- AlterTable
ALTER TABLE "Board" ADD COLUMN "habitOrder" UUID[] DEFAULT ARRAY[]::UUID[];

-- CreateTable
CREATE TABLE "Habit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT '#635FC7',
    "goal" INTEGER NOT NULL DEFAULT 0,
    "boardId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
