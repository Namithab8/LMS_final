// Backend/routes/userRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMe, updateMe } from "../controllers/userController.js";

const router = express.Router();

// Get current logged-in user profile
router.get("/me", authMiddleware, getMe);

// Update current logged-in user profile
router.put("/me", authMiddleware, updateMe);

export default router;
