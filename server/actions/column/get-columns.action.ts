"use server";

/* SERVER */
import { db } from "@/server";
import { columns } from "@/server/schema";
import { auth } from "@/server/auth";

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
			tasks: {
				with: {
					sub_tasks: true
				}
			}
		}
	});

	return {
		status: true,
		data: all_columns
	};
};
