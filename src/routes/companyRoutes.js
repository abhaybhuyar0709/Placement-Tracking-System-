import { Router } from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.post('/', authorizeAdmin, createCompany);
router.put('/:id', authorizeAdmin, updateCompany);
router.delete('/:id', authorizeAdmin, deleteCompany);

export default router;
