import express from 'express';
import { checkJwt, checkPermission, checkRole } from '../utils/jwt.js';
import PoiController from '../controllers/Poi.Controller.js';
import { PERMISSIONS, ROLES } from '../utils/roles.js';

const router = express.Router();
const poiController = new PoiController();

// Public routes
router.get('/', poiController.getAll);
router.get('/visible', poiController.getVisible);
router.get('/nearby', poiController.getNearby);
router.get('/:id', poiController.getById);

// Protected routes
router.post('/', 
  checkJwt,
  checkPermission(PERMISSIONS.POI_CREATE),
  poiController.add
);

router.post('/polygon', 
  checkJwt,
  checkPermission(PERMISSIONS.POI_READ),
  poiController.getInPoligon
);

router.delete('/:id', 
  checkJwt,
  checkRole([ROLES.ADMIN, ROLES.MODERATOR]),
  poiController.delete
);

router.put('/:id', 
  checkJwt,
  checkPermission(PERMISSIONS.POI_UPDATE),
  poiController.update
);

export const poiRouter = router;