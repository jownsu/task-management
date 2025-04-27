"use server";

/* SERVER */
import { db } from "@/server";
import { boards, columns } from "@/server/schema";
import { auth } from "@/server/auth";

/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";

/* SCHEMA */
import { board_schema } from "@/schema/board-schema"; 

const action = createSafeActionClient();

export const createBoardAction = action
    .schema(board_schema)
    .action(async ({ parsedInput }) => {

        const session = await auth();
        const user_id = session?.user.id;

        if(!user_id){
            return {
                status: false,
                message: "Not authorized"
            }
        }

        const [new_board] = await db.insert(boards).values({
            title: parsedInput.title,
            user_id,
        })
        .returning();

        if(new_board && parsedInput.columns.length){
            const all_columns_input = parsedInput.columns.map(col => ({
                title: col.title,
                board_id: new_board.id
            }));

            await db.insert(columns).values(all_columns_input)
        }

        return {
            status: true,
            message: "Success"
        }
    })