import express from 'express';
import ReportController from '../controllers/Report.Controller.js';
import ReportModel from '../models/Report.Model.js';
import multer from 'multer';
import path from 'path';
import { requireAdmin } from '../middleware/auth.js';
import { authenticate } from '../middleware/auth.js';

const upload = multer({ 
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'temp/')
    },
    filename: function (req, file, cb) {
      cb(null, `report_${Date.now()}${path.extname(file.originalname)}`)
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image!'), false);
    }
  }
});

const router = express.Router();
const reportController = new ReportController();

router.get('/', reportController.getAll);
router.get('/visible', reportController.getVisible);
router.get('/search', reportController.getByTitle);
router.get('/:id', reportController.getById);
router.post('/polygon', reportController.getInPoligon);

router.post("/", authenticate, upload.single('image'), reportController.add);
router.put("/:id", authenticate, reportController.update);
router.delete('/:id', authenticate, reportController.delete);

router.get('/byuser/:userid', authenticate, requireAdmin, reportController.getByUser);
router.patch("/:id/status", authenticate, requireAdmin, reportController.updateStatus);

export const reportRouter = router;