import express from 'express';
import PoiController from '../controllers/Poi.Controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { authenticate } from '../middleware/auth.js';


const router = express.Router();
const poiController = new PoiController();

router.get('/', poiController.getAll);
router.get('/visible', poiController.getVisible);
router.get('/nearby', poiController.getNearby);
router.get('/:id', poiController.getById);
router.post('/polygon', poiController.getInPoligon);


router.post('/', authenticate, requireAdmin, poiController.add);
router.delete('/:id', authenticate, requireAdmin, poiController.delete);
router.put('/:id', authenticate, requireAdmin, poiController.update);

export const poiRouter = router;