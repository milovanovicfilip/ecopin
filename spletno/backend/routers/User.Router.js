import express from 'express';
import UserController from '../controllers/User.Controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const userController = new UserController();

router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

router.get('/me', authenticate, userController.getCurrentUser.bind(userController));
router.patch('/points', authenticate, userController.addPoints.bind(userController));
router.get('/', authenticate, requireAdmin, userController.getAll.bind(userController));
router.get('/search', authenticate, requireAdmin, userController.getByUsername.bind(userController));

export const userRouter = router;
