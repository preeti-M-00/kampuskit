import express from 'express';
import {uploadDocument, getDocuments, getDocument, deleteDocument, serveDocumentFile} from '../controllers/documentController.js';
// import protect from '../middleware/auth.js';
import learningUpload from '../config/learningMulter.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

// All routes are protected : 
// router.use(protect);
router.use(userAuth);

router.post('/upload', learningUpload.single('file'), uploadDocument);
router.get('/',getDocuments);
router.get('/:id/file', serveDocumentFile); // Serve PDF binary from MongoDB
router.get('/:id',getDocument);
router.delete('/:id',deleteDocument);

export default router;