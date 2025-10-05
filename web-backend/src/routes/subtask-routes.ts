import { Router } from 'express';
import { updateSubtask } from '@/controllers/subtask-controller';

const router = Router();

// Subtask routes matching your mock server endpoints
router.post('/update_subtask', updateSubtask);

export default router;
