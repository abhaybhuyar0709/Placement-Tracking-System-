import { Router } from 'express';
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
} from '../controllers/internshipController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllInternships);
router.get('/:id', getInternshipById);
router.post('/', authorizeAdmin, createInternship);
router.put('/:id', authorizeAdmin, updateInternship);
router.delete('/:id', authorizeAdmin, deleteInternship);

export default router;
