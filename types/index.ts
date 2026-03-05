import type {
    Board as PrismaBoard,
    Column as PrismaColumn,
    Task as PrismaTask,
    Subtask as PrismaSubtask
} from "@/lib/generated/prisma/client";

export interface CallbackResponse<T = unknown> {
	onSuccess?: (data?: T) => void;
	onError?: (error_msg?: string) => void;
}

export type Board = Pick<PrismaBoard, "id" | "name"> & {
	columns?: Column[];
};

export type Column = Pick<PrismaColumn, "id" | "name" | "order"> & {
	tasks?: Task[];
};

export type Subtask = Pick<PrismaSubtask, "id" | "title" | "isCompleted" | "order">;

export type Task = Pick<PrismaTask, "id" | "title" | "order"> & {
	description: string;
	subtasks: Subtask[];
};

export interface UpdateSubTaskPayload {
	board_id: string;
	column_id: string;
	task_id: string;
	subtask_id: string;
	isCompleted: boolean;
}