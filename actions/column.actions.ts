"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { add_column_schema, delete_column_schema } from "@/schema/column-schema";

/**
 * DOCU: Creates a new column for a board owned by the current user. <br>
 * Triggered: On submission of add column form. <br>
 * Last Updated: April 06, 2026
 * @author Jhones
 */
export const createColumnAction = authActionClient
	.schema(add_column_schema)
	.action(async ({ parsedInput, ctx }) => {
		const column = await prisma.$transaction(async (tx) => {
			/* Verify board ownership and get columnOrder */
			const board = await tx.board.findUniqueOrThrow({
				where: { id: parsedInput.board_id, userId: ctx.userId },
				select: { columnOrder: true }
			});

			/* Create the new column */
			const new_column = await tx.column.create({
				data: {
					name: parsedInput.name,
					theme: parsedInput.theme,
					boardId: parsedInput.board_id
				},
				select: { id: true, name: true, theme: true, taskOrder: true }
			});

			await tx.board.update({
				where: { id: parsedInput.board_id },
				data: {
					columnOrder: [...board.columnOrder, new_column.id]
				}
			});

			return new_column;
		});

		return { ...column, tasks: [] };
	});

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
