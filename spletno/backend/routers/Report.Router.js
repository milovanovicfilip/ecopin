import express from 'express';
import { checkJwt, checkPermission, checkOwnership, checkRole } from '../utils/jwt.js';
import ReportController from '../controllers/Report.Controller.js';
import ReportModel from '../models/Report.Model.js';
import { PERMISSIONS, ROLES } from '../utils/roles.js';
import multer from 'multer';
import path from 'path';

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

// Javni dostop (brez avtentikacije)
router.get('/', reportController.getAll);
router.get('/visible', reportController.getVisible);
router.get('/search', reportController.getByTitle);
router.get('/:id', reportController.getById);

// Zaščiteni endpointi
router.get('/byuser/:userid', 
  ...reportController.requireAuth,
  checkPermission(PERMISSIONS.REPORT_READ),
  (req, res, next) => {
    // Preveri če uporabnik dostopa do svojih reportov ali ima pravice
    if (req.params.userid !== req.user._id.toString() && 
        !req.user.roles.includes(ROLES.ADMIN) && 
        !req.user.roles.includes(ROLES.MODERATOR)) {
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden - Can only view your own reports' 
      });
    }
    next();
  },
  reportController.getByUser
);

router.post('/',
  ...reportController.requireAuth,
  checkPermission(PERMISSIONS.REPORT_CREATE),
  upload.single('image'),
  reportController.add
);

router.post('/polygon',
  ...reportController.requireAuth,
  checkPermission(PERMISSIONS.REPORT_READ),
  reportController.getInPoligon
);

router.put('/:id',
  ...reportController.requireAuth,
  checkOwnership(ReportModel),
  checkPermission(PERMISSIONS.REPORT_UPDATE),
  reportController.update
);

router.delete('/:id',
  ...reportController.requireAuth,
  checkOwnership(ReportModel),
  checkPermission(PERMISSIONS.REPORT_DELETE),
  reportController.delete
);

router.patch('/:id/status',
  ...reportController.requireAuth,
  checkRole([ROLES.ADMIN, ROLES.MODERATOR]),
  checkPermission(PERMISSIONS.REPORT_UPDATE_STATUS),
  reportController.updateStatus
);

export const reportRouter = router;