import { Router } from "express";
import {
	getAllBoardsHandler,
	getBoardByIdHandler,
	createBoardHandler,
	updateBoardHandler,
	deleteBoardHandler,
	deleteColumnHandler,
} from "@/controllers/board-controller";

const router = Router();

// Board routes matching your mock server endpoints
router.get("/boards", getAllBoardsHandler);
router.get("/boards/:board_id", getBoardByIdHandler);
router.post("/boards", createBoardHandler);
router.put("/boards/:board_id", updateBoardHandler);
router.delete("/boards/:board_id", deleteBoardHandler);
router.delete("/boards/:board_id/columns/:column_id", deleteColumnHandler);

export default router;
