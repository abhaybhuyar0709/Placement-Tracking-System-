import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getDashboard);

export default router;
