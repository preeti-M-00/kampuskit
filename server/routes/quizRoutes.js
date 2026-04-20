import express, { Router } from 'express';
import {
    getAllQuizzes,
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
    toggleShareQuiz,
    getPublicQuizById,
    submitPublicQuiz
} from '../controllers/quizController.js';
import userAuth from '../middleware/userAuth.js';
// import protect from '../middleware/auth.js';

const router = express.Router();
router.use(userAuth);

// Public routes MUST come before router.use(protect)
router.get('/public/:id', getPublicQuizById);
router.post('/public/:id/submit', submitPublicQuiz);

// all routes below are protected:
// router.use(protect);

router.put('/:id/share', toggleShareQuiz);   // ← Toggle public status
router.post('/:id/submit', submitQuiz);      // ← Most specific first
router.get('/:id/results', getQuizResults);  // ← Specific action
router.get('/quiz/:id', getQuizById);        // ← Specific path
router.delete('/:id', deleteQuiz);           // ← Specific method
router.get('/all', getAllQuizzes);           // ← All quizzes for user (before /:documentId)
router.get('/:documentId', getQuizzes);      // ← Generic pattern LAST

export default router;