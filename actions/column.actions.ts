"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { delete_column_schema } from "@/schema/column-schema";

/**
 * DOCU: Deletes a column from a board owned by the current user. <br>
 * Triggered: On submission of delete column form. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const deleteColumnAction = authActionClient
	.schema(delete_column_schema)
	.action(async ({ parsedInput, ctx }) => {
		await prisma.$transaction(async (tx) => {
			await tx.column.delete({
				where: {
					id: parsedInput.column_id,
					board: {
						id: parsedInput.board_id,
						userId: ctx.userId
					}
				}
			});

			/* Remove the column from the board's columnOrder */
			const board = await tx.board.findUniqueOrThrow({
				where: { id: parsedInput.board_id },
				select: { columnOrder: true }
			});

			await tx.board.update({
				where: { id: parsedInput.board_id },
				data: {
					columnOrder: board.columnOrder.filter((id) => id !== parsedInput.column_id)
				}
			});
		});
	});
