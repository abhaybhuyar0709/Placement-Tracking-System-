import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.post('/', authorizeAdmin, createStudent);
router.put('/:id', authorizeAdmin, updateStudent);
router.delete('/:id', authorizeAdmin, deleteStudent);

export default router;
