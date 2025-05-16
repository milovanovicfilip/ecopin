import express, {Router} from 'express';
import { authoriseUser } from '../utils/jwt.js';
import ReportController from '../controllers/Report.Controller.js'

const router = express.Router();
const reportController = new ReportController();

router.get('/', reportController.getAll);
router.get('/visible', reportController.getVisible);
router.get('/:id', reportController.getById);

router.post('/', reportController.add);
router.post('/polygon', reportController.getInPoligon)

router.delete('/:id', reportController.delete);

router.put('/:id', reportController.update);

export const reportRouter = router;