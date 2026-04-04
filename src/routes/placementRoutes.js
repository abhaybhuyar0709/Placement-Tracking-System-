import { Router } from 'express';
import {
  getAllPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
} from '../controllers/placementController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllPlacements);
router.get('/:id', getPlacementById);
router.post('/', authorizeAdmin, createPlacement);
router.put('/:id', authorizeAdmin, updatePlacement);
router.delete('/:id', authorizeAdmin, deletePlacement);

export default router;
