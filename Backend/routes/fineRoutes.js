// Backend/routes/fineRoutes.js
import express from "express";
import Fine from "../models/Fine.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { payFineController, listFines } from "../controllers/fineController.js";

const router = express.Router();

// Get all fines (admin/librarian)
router.get(
  "/",
  authMiddleware,
  requireRole("ADMIN", "LIBRARIAN"),
  listFines
);

// Get my fines (student)
router.get(
  "/my",
  authMiddleware,
  requireRole("STUDENT"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const fines = await Fine.find({ member: userId }).populate("borrowRecord");
      res.json(fines);
    } catch (err) {
      console.error("Get my fines error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Pay a fine (student)
router.post(
  "/:fineId/pay",
  authMiddleware,
  requireRole("STUDENT"),
  payFineController
);

export default router;
