import { Router } from "express";
import healthRoutes from "./health-routes";
import boardRoutes from "./board-routes";
import subtaskRoutes from "./subtask-routes";
import authRoutes from "./auth-routes";

const router = Router();

// Health check routes
router.use("/", healthRoutes);

// Auth routes
router.use("/auth", authRoutes);

// API routes matching your mock server structure
router.use("/", boardRoutes);
router.use("/", subtaskRoutes);

export default router;
