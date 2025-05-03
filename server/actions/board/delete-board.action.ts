"use server";

/* SERVER */
import { db } from "@/server";
import { boards } from "@/server/schema";
import { auth } from "@/server/auth";

/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";

/* SCHEMA */
import { delete_board_schema } from "@/schema/board-schema"; 
import { eq } from "drizzle-orm";

const action = createSafeActionClient();

export const deleteBoardAction = action
    .schema(delete_board_schema)
    .action(async ({ parsedInput }) => {

        const session = await auth();
        const user_id = session?.user.id;

        if(!user_id){
            return {
                status: false,
                message: "Not authorized"
            }
        }

        await db.delete(boards).where(eq(boards.id, parsedInput.id));

        return {
            status: true
        }
    })