"use server";

/* SERVER */
import { db } from "@/server";
import { auth } from "@/server/auth";
import { sub_tasks, tasks } from "@/server/schema";

/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";

/* SCHEMA */
import { task_schema } from "@/schema/task-schema";

const action = createSafeActionClient();

export const createTaskAction = action
    .schema(task_schema)
    .action(async ({ parsedInput }) => {

        const session = await auth();
        const user_id = session?.user.id;

        if(!user_id){
            return {
                status: false,
                message: "Not authorized"
            }
        }

        const [new_task] = await db.insert(tasks).values({
            title: parsedInput.title,
            column_id: parsedInput.column_id,
            description: parsedInput.description
        }).returning();

        if(new_task && parsedInput.sub_tasks.length){
            const all_sub_tasks_input = parsedInput.sub_tasks.map(sub_task => ({
                title: sub_task.title,
                task_id: new_task.id
            }));

            const new_sub_tasks = await db.insert(sub_tasks).values(all_sub_tasks_input).returning();

            return {
                status: true,
                data: {
                    ...new_task,
                    sub_tasks: new_sub_tasks
                }
            }
        }

        return {
            status: true,
            data: {
                ...new_task,
                sub_tasks: []
            },
        }
    })