"use server";
"use server";

/* SERVER */
import { db, dbPool } from "@/server";
import { boards, columns } from "@/server/schema";
import { auth } from "@/server/auth";

/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";

/* SCHEMA */
import { board_schema } from "@/schema/board-schema";
import { eq } from "drizzle-orm";

const action = createSafeActionClient();

export const editBoardAction = action
	.schema(board_schema)
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
				message: "Board id is required"
			};
		}

		const [updated_board] = await db
			.update(boards)
			.set({ title: parsedInput.title })
			.where(eq(boards.id, parsedInput.id))
			.returning();

		if (updated_board && parsedInput.columns.length) {
			await dbPool.transaction(async (tx) => {
				parsedInput.columns.map(async (column) => {
					if (column.is_new) {
						await tx
                            .insert(columns)
                            .values({ board_id: updated_board.id, title: column.title});
					} 
                    else if (!column.is_new && column.id) {
						await tx
							.update(columns)
							.set({ title: column.title })
							.where(eq(columns.id, column.id));
					}
				});
			});
		}

		return {
			status: true
		};
	});
