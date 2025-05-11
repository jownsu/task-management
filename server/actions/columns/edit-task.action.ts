"use server";

/* SERVER */
import { db, dbPool } from "@/server";
import { auth } from "@/server/auth";
import { sub_tasks, tasks } from "@/server/schema";

/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";

/* SCHEMA */
import { task_schema } from "@/schema/task-schema";
import { eq } from "drizzle-orm";

const action = createSafeActionClient();

export const editTaskAction = action
	.schema(task_schema)
	.action(async ({ parsedInput }) => {
		const session = await auth();
		const user_id = session?.user.id;

		if (!user_id) {
			return {
				status: false,
				message: "Not authorized"
			};
		}

		if (!parsedInput.id) {
			return {
				status: false,
				message: "Task id is required"
			};
		}

		const [updated_task] = await db
			.update(tasks)
			.set({ 
				title: parsedInput.title,
				description: parsedInput.description,
				column_id: parsedInput.column_id 
			})
			.where(eq(tasks.id, parsedInput.id))
			.returning();

		if (updated_task && parsedInput.sub_tasks.length) {
			const all_updated_sub_tasks = await dbPool.transaction(async (tx) => {
				return await Promise.all(
					parsedInput.sub_tasks.map(async (sub_task) => {
						if (sub_task.is_new) {
							const [new_sub_task] = await tx
								.insert(sub_tasks)
								.values({ task_id: updated_task.id, title: sub_task.title})
								.returning();

							return new_sub_task;
						} 
						else if (!sub_task.is_new && sub_task.id) {
							const [updated_sub_task] = await tx
								.update(sub_tasks)
								.set({ title: sub_task.title })
								.where(eq(sub_tasks.id, sub_task.id))
								.returning();
							
							return updated_sub_task;
						}
						return sub_task;
					})
				)
			});

			return {
				status: true,
				data: {
					...updated_task,
					sub_tasks: all_updated_sub_tasks
				}
			}
		}

		return {
			status: true,
			data: {
				...updated_task,
				sub_tasks: []
			}
		}
	});
