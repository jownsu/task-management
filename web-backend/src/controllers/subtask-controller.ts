import { Request, Response } from "express";
import { getBoardById, updateSubtask } from "@/services/data-service";
import { ApiResponse, UpdateSubtaskRequest } from "@/models";

// POST /api/update_subtask - Update subtask completion status
export async function updateSubtaskHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const {
			board_id,
			column_id,
			task_id,
			subtask_id,
			is_completed,
		}: UpdateSubtaskRequest = req.body;

		// Validate required fields
		if (
			!board_id ||
			!column_id ||
			!task_id ||
			!subtask_id ||
			typeof is_completed !== "boolean"
		) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Invalid request data",
				message:
					"All fields (board_id, column_id, task_id, subtask_id, is_completed) are required",
			};

			res.status(400).json(response);
			return;
		}

		// Check if board exists
		const board = getBoardById(board_id);
		if (!board) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Board not found",
				message: "The specified board was not found",
			};

			res.status(404).json(response);
			return;
		}

		// Check if column exists
		const column = board.columns.find((col) => col.id === column_id);
		if (!column) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Column not found",
				message: "The specified column was not found in this board",
			};

			res.status(404).json(response);
			return;
		}

		// Check if task exists
		const task = column.tasks.find((t) => t.id === task_id);
		if (!task) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Task not found",
				message: "The specified task was not found in this column",
			};

			res.status(404).json(response);
			return;
		}

		// Check if subtask exists
		const subtask = task.subtasks.find((st) => st.id === subtask_id);
		if (!subtask) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Subtask not found",
				message: "The specified subtask was not found in this task",
			};

			res.status(404).json(response);
			return;
		}

		// Update the subtask
		const updated = updateSubtask(
			board_id,
			column_id,
			task_id,
			subtask_id,
			is_completed,
		);

		if (!updated) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Update failed",
				message: "Failed to update the subtask",
			};

			res.status(500).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			result: true,
			error: null,
			message: "Subtask updated successfully",
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			status: false,
			result: null,
			error: "Failed to update subtask",
			message: "An error occurred while updating the subtask",
		};

		res.status(500).json(response);
	}
}
