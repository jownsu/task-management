"use server";

/* SERVER */
import { db } from "@/server";
import { auth } from "@/server/auth";
import { columns } from "@/server/schema";

/* SCHEMA */
import { eq } from "drizzle-orm";

export const getColumnAction = async (board_id: string) => {
	const session = await auth();
	const user_id = session?.user.id;

	if (!user_id) {
		return {
			status: false,
			message: "Not authorized"
		};
	}

	const all_columns = await db.query.columns.findMany({
		where: eq(columns.board_id, board_id),
		with: {
			board: {
				columns: {
					user_id: true
				} 
			},
			tasks: {
				with: {
					sub_tasks: true
				}
			}
		}
	});

	/* Validate board ownership */
	if (
		!all_columns.length ||
		all_columns[0].board.user_id !== user_id
	) {
		return {
			status: false,
			message: "It is not owned by the current user"
		};
	}

	return {
		status: true,
		data: all_columns
	};
};
