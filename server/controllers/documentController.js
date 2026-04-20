import Document from '../models/Document.js';
import Flashcard from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import mongoose from 'mongoose';

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }

        const userId = req.userId;
        // Create document record — store buffer in MongoDB (no disk write needed)
        const document = await Document.create({
            userId,
            title,
            fileName: req.file.originalname,
            filePath: `/api/documents/placeholder`, // placeholder; actual serving via /api/documents/:id/file
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            fileData: req.file.buffer, // Store PDF binary in MongoDB
            status: 'processing'
        });

        // Process PDF in background using the buffer directly
        processPDF(document._id, req.file.buffer).catch(err => {
            console.error('PDF processing error:', err);
        });

        // Return document without fileData for a lighter response
        const responseDoc = document.toObject();
        delete responseDoc.fileData;

        res.status(201).json({
            success: true,
            data: responseDoc,
            message: 'Document uploaded successfully. Processing in progress...'
        });

    } catch (error) {
        next(error);
    }
};


// Helper function to process PDF — accepts a Buffer
const processPDF = async (documentId, fileBuffer) => {
    try {

        const { text } = await extractTextFromPDF(fileBuffer);

        const chunks = chunkText(text, 500, 50);

        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);

    } catch (error) {

        console.error(`Error processing document ${documentId}:`, error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};


// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {

  try {

    const documents = await Document.aggregate([
      {
        $match: { userId: req.userId}
      },
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'documentId',
          as: 'flashcardSets'
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: 'documentId',
          as: 'quizSets'
        }
      },
      {
        $addFields: {
          flashcardCount: { $size: '$flashcardSets' },
          quizCount: { $size: '$quizSets' }
        }
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          fileData: 0,   // Exclude binary data from list
          flashcardSets: 0,
          quizSets: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });

  } catch (error) {
    next(error);
  }

};


// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {

    try {

        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.userId
        }).select('-fileData'); // exclude binary data

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        const flashcardCount = await Flashcard.countDocuments({
            documentId: document._id,
            userId: req.userId
        });

        const quizCount = await Quiz.countDocuments({
            documentId: document._id,
            userId: req.userId
        });

        document.lastAccessed = Date.now();
        await document.save();

        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Serve PDF file from MongoDB
// @route   GET /api/documents/:id/file
// @access  Private
export const serveDocumentFile = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.userId
        }).select('fileData mimeType fileName status');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        if (!document.fileData) {
            return res.status(404).json({
                success: false,
                error: 'File data not available. Please re-upload the document.',
                statusCode: 404
            });
        }

        res.set({
            'Content-Type': document.mimeType || 'application/pdf',
            'Content-Length': document.fileData.length,
            'Content-Disposition': `inline; filename="${document.fileName}"`,
            'Cache-Control': 'private, max-age=3600'
        });

        res.send(document.fileData);

    } catch (error) {
        next(error);
    }
};


// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {

    try {

        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // No local file to delete (stored in MongoDB)
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};


