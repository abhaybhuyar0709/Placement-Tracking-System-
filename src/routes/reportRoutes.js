import { Router } from 'express';
import { getReports } from '../controllers/reportController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getReports);

export default router;
