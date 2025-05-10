import { columns, tasks } from "@/server/schema";

export type ColumnWithTasks = typeof columns.$inferSelect & {
  tasks: typeof tasks.$inferSelect[];
};

export type Task = typeof tasks.$inferInsert;

export interface Board {
    id: string;
    title: string;
    user_id: string;
    columns: Columns[];
}

export interface Columns {
    id?: string;
    title: string;
}