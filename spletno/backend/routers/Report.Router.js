import express, {Router} from 'express';
import ReportController from '../controllers/Report.Controller.js'
import multer from 'multer';
import path from 'path'

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
router.get('/byuser/:userid', reportController.getByUser);
router.get('/:id', reportController.getById);

router.post('/',upload.single('image'), reportController.add);
router.post('/polygon', reportController.getInPoligon)

router.delete('/:id', reportController.delete);

router.put('/:id', reportController.update);

export const reportRouter = router;