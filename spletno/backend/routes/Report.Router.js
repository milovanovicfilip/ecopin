import express from 'express';
import { checkJwt, checkPermission, checkOwnership, checkRole } from '../utils/jwt.js'; // Added checkRole here
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

// Public read access
router.get('/', reportController.getAll);
router.get('/visible', reportController.getVisible);
router.get('/:id', reportController.getById);

// User-specific reports
router.get('/byuser/:userid', 
  checkJwt,
  checkPermission(PERMISSIONS.REPORT_READ),
  (req, res, next) => {
    const namespace = process.env.AUTH0_NAMESPACE;
    const userRoles = req.user[`${namespace}roles`] || [ROLES.USER];
    
    if (req.params.userid !== req.user.sub.split('|')[1] && 
        !userRoles.includes(ROLES.ADMIN) && 
        !userRoles.includes(ROLES.MODERATOR)) {
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden - Can only view your own reports' 
      });
    }
    next();
  },
  reportController.getByUser
);

// Create report
router.post('/',
  checkJwt,
  checkPermission(PERMISSIONS.REPORT_CREATE),
  upload.single('image'),
  reportController.add
);

router.post('/polygon',
  checkJwt,
  checkPermission(PERMISSIONS.REPORT_READ),
  reportController.getInPoligon
);

// Update/delete with ownership checks
router.put('/:id',
  checkJwt,
  checkOwnership(ReportModel),
  checkPermission(PERMISSIONS.REPORT_UPDATE),
  reportController.update
);

router.delete('/:id',
  checkJwt,
  checkOwnership(ReportModel),
  checkPermission(PERMISSIONS.REPORT_DELETE),
  reportController.delete
);

// Status update endpoint
router.patch('/:id/status',
  checkJwt,
  checkRole([ROLES.ADMIN, ROLES.MODERATOR]), // Now properly imported
  checkPermission(PERMISSIONS.REPORT_UPDATE_STATUS),
  reportController.updateStatus
);

export const reportRouter = router;