import { Request, Response } from "express";
import {
	getAllBoards,
	getBoardById,
	createBoard,
	updateBoard,
	deleteBoard,
	deleteColumn,
} from "@/services/data-service";
import { ApiResponse, CreateBoardRequest, UpdateBoardRequest } from "@/models";

// GET /api/boards - Get all boards (list view)
export async function getAllBoardsHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const boards = getAllBoards();

		const response: ApiResponse = {
			status: true,
			result: boards,
			error: null,
			message: null,
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			status: false,
			result: null,
			error: "Failed to fetch boards",
			message: "An error occurred while fetching boards",
		};

		res.status(500).json(response);
	}
}

// GET /api/boards/:board_id - Get board by ID
export async function getBoardByIdHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { board_id } = req.params;
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

		const response: ApiResponse = {
			status: true,
			result: board,
			error: null,
			message: null,
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			status: false,
			result: null,
			error: "Failed to fetch board",
			message: "An error occurred while fetching the board",
		};

		res.status(500).json(response);
	}
}

// POST /api/boards - Create new board
export async function createBoardHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { title, columns }: CreateBoardRequest = req.body;

		if (!title || !columns || !Array.isArray(columns)) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Invalid request data",
				message: "Title and columns are required",
			};

			res.status(400).json(response);
			return;
		}

		const newBoard = createBoard(title, columns);

		const response: ApiResponse = {
			status: true,
			result: newBoard,
			error: null,
			message: null,
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			status: false,
			result: null,
			error: "Failed to create board",
			message: "An error occurred while creating the board",
		};

		res.status(500).json(response);
	}
}

// PUT /api/boards/:board_id - Update board
export async function updateBoardHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { board_id } = req.params;
		const { title, columns }: UpdateBoardRequest = req.body;

		if (!title || !columns || !Array.isArray(columns)) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Invalid request data",
				message: "Title and columns are required",
			};

			res.status(400).json(response);
			return;
		}

		const updatedBoard = updateBoard(board_id, title, columns);

		if (!updatedBoard) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Board not found",
				message: "The specified board was not found",
			};

			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			result: updatedBoard,
			error: null,
			message: null,
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			status: false,
			result: null,
			error: "Failed to update board",
			message: "An error occurred while updating the board",
		};

		res.status(500).json(response);
	}
}

// DELETE /api/boards/:board_id - Delete board
export async function deleteBoardHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { board_id } = req.params;
		const deleted = deleteBoard(board_id);

		if (!deleted) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Board not found",
				message: "The specified board was not found",
			};

			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			result: null,
			error: null,
			message: "Board deleted successfully",
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			status: false,
			result: null,
			error: "Failed to delete board",
			message: "An error occurred while deleting the board",
		};

		res.status(500).json(response);
	}
}

// DELETE /api/boards/:board_id/columns/:column_id - Delete column
export async function deleteColumnHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { board_id, column_id } = req.params;
		const deleted = deleteColumn(board_id, column_id);

		if (!deleted) {
			const response: ApiResponse = {
				status: false,
				result: null,
				error: "Column not found",
				message: "The specified column was not found in this board",
			};

			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			result: null,
			error: null,
			message: "Column deleted successfully",
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			status: false,
			result: null,
			error: "Failed to delete column",
			message: "An error occurred while deleting the column",
		};

		res.status(500).json(response);
	}
}
