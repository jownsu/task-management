"use server";

/* SERVER */
import { db } from "@/server";
import { tasks } from "@/server/schema";
import { auth } from "@/server/auth";

/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";

/* SCHEMA */
import { delete_task_schema } from "@/schema/task-schema"; 
import { eq } from "drizzle-orm";

const action = createSafeActionClient();

export const deleteTaskAction = action
    .schema(delete_task_schema)
    .action(async ({ parsedInput }) => {

        const session = await auth();
        const user_id = session?.user.id;

        if(!user_id){
            return {
                status: false,
                message: "Not authorized"
            }
        }

        await db.delete(tasks).where(eq(tasks.id, parsedInput.id));

        return {
            status: true
        }
    })