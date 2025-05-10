import { columns, tasks } from "@/server/schema";

export type ColumnWithTasks = typeof columns.$inferSelect & {
  tasks: typeof tasks.$inferSelect[];
};

export type Task = typeof tasks.$inferInsert;