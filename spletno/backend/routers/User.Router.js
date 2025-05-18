import express from 'express';
import UserController from '../controllers/User.Controller.js';

const router = express.Router();
const userController = new UserController();

router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

router.use(userController.checkJwt);

router.get('/me', userController.getCurrentUser.bind(userController));

router.patch('/points', userController.addPoints.bind(userController));

export const userRouter = router;