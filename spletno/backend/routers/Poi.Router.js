import express from 'express';
import PoiController from '../controllers/Poi.Controller.js';

const router = express.Router();
const poiController = new PoiController();

router.get('/', poiController.getAll);
router.get('/visible', poiController.getVisible);
router.get('/nearby', poiController.getNearby);
router.get('/:id', poiController.getById);
router.post('/polygon', poiController.getInPoligon);


router.post('/', poiController.add);
router.post('/all', poiController.addMany);
router.delete('/all', poiController.deleteAll);
router.delete('/:id', poiController.delete);

router.put('/:id', poiController.update);

export const poiRouter = router;