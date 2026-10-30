// Backend/routes/chatRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

// authenticated users (student / librarian / admin) can use chat
router.post('/', authMiddleware, handleChat);

export default router;



