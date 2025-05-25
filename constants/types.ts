import { columns, tasks } from "@/server/schema";

export type ColumnWithTasks = typeof columns.$inferSelect & {
  tasks: typeof tasks.$inferSelect[];
};

export type Task = typeof tasks.$inferInsert;

export interface Board {
    id: string;
    title: string;
    user_id: string;
    columns: Column[];
}

export interface Column {
    id?: string;
    title: string;
    index?: number;
}

export interface CallbackResponse<T = unknown> {
	onSuccess?: (data?: T) => void;
	onError?: (error_msg?: string) => void;
}