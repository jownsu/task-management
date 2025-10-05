import { Router } from 'express';
import healthRoutes from './health-routes';
import boardRoutes from './board-routes';
import subtaskRoutes from './subtask-routes';

const router = Router();

// Health check routes
router.use('/', healthRoutes);

// API routes matching your mock server structure
router.use('/', boardRoutes);
router.use('/', subtaskRoutes);

export default router;
