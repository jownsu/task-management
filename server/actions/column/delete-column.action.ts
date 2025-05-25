"use server";

/* SERVER */
import { db } from "@/server";
import { columns } from "@/server/schema";
import { auth } from "@/server/auth";

/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";

/* SCHEMA */
import { delete_column_schema } from "@/schema/column-schema";
import { eq } from "drizzle-orm";

const action = createSafeActionClient();

export const deleteColumnAction = action
    .schema(delete_column_schema)
    .action(async ({ parsedInput }) => {

        const session = await auth();
        const user_id = session?.user.id;

        if(!user_id){
            return {
                status: false,
                message: "Not authorized"
            }
        }

        await db.delete(columns).where(eq(columns.id, parsedInput.id));

        return {
            status: true
        }
    })