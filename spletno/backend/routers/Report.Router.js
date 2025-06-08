import express from 'express';
import ReportController from '../controllers/Report.Controller.js';
import ReportModel from '../models/Report.Model.js';
import multer from 'multer';
import path from 'path';
import { requireAdmin } from '../middleware/auth.js';
import { authenticate } from '../middleware/auth.js';

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (!ext) ext = '.jpg';
    const filename = `report_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(null, false); 
  }
});

const router = express.Router();
const reportController = new ReportController();

router.get('/', reportController.getAll);
router.get('/byuser/:userid', reportController.getByUser);
router.get('/visible', reportController.getVisible);
router.get('/search', reportController.getByTitle);
router.get('/:id', reportController.getById);

router.post('/polygon', reportController.getInPoligon);
router.post("/", authenticate, upload.single('image'), reportController.add);
router.put("/:id", authenticate, reportController.update);
router.delete('/:id', authenticate, reportController.delete);

router.patch("/:id/status", authenticate, requireAdmin, reportController.updateStatus);

export const reportRouter = router;
