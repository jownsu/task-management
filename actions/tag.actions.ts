"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { create_tag_schema, delete_tag_schema, edit_tag_schema, MAX_BOARD_TAGS } from "@/schema/tag-schema";

/**
 * DOCU: Creates a new tag on a board. <br>
 * Triggered: On clicking "Add New Tag" in the edit board modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const createTagAction = authActionClient
	.schema(create_tag_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, name, color } = parsedInput;

		/* Verify the board belongs to the current user */
		const board = await prisma.board.findFirst({
			where: { id: board_id, userId: ctx.userId },
			select: { id: true, _count: { select: { tags: true } } }
		});

		if (!board) {
			throw new Error("Board not found");
		}

		if (board._count.tags >= MAX_BOARD_TAGS) {
			throw new Error("Maximum number of tags reached");
		}

		const tag = await prisma.tag.create({
			data: {
				name: name.trim(),
				color,
				boardId: board_id
			}
		});

		return {
			id: tag.id,
			name: tag.name,
			color: tag.color
		};
	});

/**
 * DOCU: Updates an existing tag's name and/or color. <br>
 * Triggered: On editing a tag in the edit board modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const editTagAction = authActionClient
	.schema(edit_tag_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { tag_id, board_id, name, color } = parsedInput;

		/* Verify the tag belongs to a board owned by the current user */
		const tag = await prisma.tag.findFirst({
			where: {
				id: tag_id,
				board: { id: board_id, userId: ctx.userId }
			},
			select: { id: true }
		});

		if (!tag) {
			throw new Error("Tag not found");
		}

		const updated_tag = await prisma.tag.update({
			where: { id: tag_id },
			data: {
				name: name.trim(),
				color
			}
		});

		return {
			id: updated_tag.id,
			name: updated_tag.name,
			color: updated_tag.color
		};
	});

/**
 * DOCU: Deletes a tag from a board (cascades TaskTag entries). <br>
 * Triggered: On clicking the delete button for a tag in the edit board modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const deleteTagAction = authActionClient
	.schema(delete_tag_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { tag_id, board_id } = parsedInput;

		/* Verify the tag belongs to a board owned by the current user */
		const tag = await prisma.tag.findFirst({
			where: {
				id: tag_id,
				board: { id: board_id, userId: ctx.userId }
			},
			select: { id: true }
		});

		if (!tag) {
			throw new Error("Tag not found");
		}

		await prisma.tag.delete({
			where: { id: tag_id }
		});
	});
