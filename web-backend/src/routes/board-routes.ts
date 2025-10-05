import { Router } from 'express';
import { 
  getAllBoards, 
  getBoardById, 
  createBoard, 
  updateBoard, 
  deleteBoard, 
  deleteColumn 
} from '@/controllers/board-controller';

const router = Router();

// Board routes matching your mock server endpoints
router.get('/boards', getAllBoards);
router.get('/boards/:board_id', getBoardById);
router.post('/boards', createBoard);
router.put('/boards/:board_id', updateBoard);
router.delete('/boards/:board_id', deleteBoard);
router.delete('/boards/:board_id/columns/:column_id', deleteColumn);

export default router;
