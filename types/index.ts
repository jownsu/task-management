import type {
    Board as PrismaBoard,
    Column as PrismaColumn,
    Habit as PrismaHabit,
    Task as PrismaTask,
    Subtask as PrismaSubtask,
    User as PrismaUser,
    Tag as PrismaTag
} from "@/lib/generated/prisma/client";

export interface CallbackResponse<T = unknown> {
	onSuccess?: (data?: T) => void;
	onError?: (error_msg?: string) => void;
}

export type Board = Pick<PrismaBoard, "id" | "name" | "columnOrder" | "habitOrder" | "type"> & {
	columns?: Column[];
	habits?: Habit[];
	tags?: Tag[];
};

export type Column = Pick<PrismaColumn, "id" | "name" | "theme" | "taskOrder"> & {
	tasks?: Task[];
};

export type Habit = Pick<PrismaHabit, "id" | "name" | "theme" | "goal">;

export type HabitLog = {
	habitId: string;
	date: string;
};

export type Subtask = Pick<PrismaSubtask, "id" | "title" | "isCompleted">;

export type Tag = Pick<PrismaTag, "id" | "name" | "color">;

export type Task = Pick<PrismaTask, "id" | "title" | "isCompleted" | "subtaskOrder"> & {
	description: string;
	subtasks: Subtask[];
	tags: Tag[];
};

export type UserProfile = Pick<PrismaUser, "id" | "name" | "email" | "image" | "createdAt"> & {
	has_password: boolean;
	provider: string | null;
	stats: {
		total_boards: number;
		total_columns: number;
		total_tasks: number;
		total_subtasks: number;
		completed_subtasks: number;
		completion_rate: number;
	};
};