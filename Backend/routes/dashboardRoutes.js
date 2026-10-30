// Backend/routes/dashboardRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getAdminStats,
  getLibrarianStats,
  getStudentStats,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Admin stats - ADMIN only
router.get("/admin", requireRole(["ADMIN"]), getAdminStats);

// Librarian stats - ADMIN and LIBRARIAN
router.get("/librarian", requireRole(["ADMIN", "LIBRARIAN"]), getLibrarianStats);

// Student stats - All authenticated users
router.get("/student", getStudentStats);

export default router;
