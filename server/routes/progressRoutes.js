import express from 'express';
import{
    getDashboard,
} from '../controllers/progressController.js';
// import protect from '../middleware/auth.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router()

router.use(userAuth);

// router.use(protect);

router.get('/dashboard',getDashboard);

export default router;