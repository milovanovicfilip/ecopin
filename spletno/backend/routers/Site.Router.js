import express, {Router} from 'express';
import { authoriseUser } from '../utils/jwt.js';
import { siteController } from '../controllers/Site.Controller.js'

const router = express.Router();

router.get('/', siteController.logoutUser);
router.get('/getPosts/:id',authoriseUser,userController.getUserPosts);
router.get('/:id', userController.getUserData);

router.delete('/:id',authoriseUser,userController.removeUser);

router.put('/:id',authoriseUser,userController.updateProfile);

export const userRouter = router;