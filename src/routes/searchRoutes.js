import { Router } from 'express';
import { searchStudents } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/students', authenticate, searchStudents);

export default router;
