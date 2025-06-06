import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import PartnerController from '../controllers/Partner.Controller.js';

const router = express.Router();
const partnerController = new PartnerController();

router.get('/',authenticate, requireAdmin, partnerController.getAll.bind(partnerController));
router.get('/:id', authenticate, requireAdmin, partnerController.getById.bind(partnerController));


export const partnerRouter = router;
