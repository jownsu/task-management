import { Router } from "express";
import { updateSubtaskHandler } from "@/controllers/subtask-controller";

const router = Router();

// Subtask routes matching your mock server endpoints
router.post("/update_subtask", updateSubtaskHandler);

export default router;
