import express from "express";
import {
  notifyUpcomingDueDates,
  notifyOverdueFines,
  notifyLowStock,
  notifyDamageReported,
  notifyMembershipExpiry,
} from "../services/notificationService.js";

const router = express.Router();

// Simple guard so it's not publicly abusable
router.post("/debug/notify/upcoming-due", async (req, res) => {
  try {
    const count = await notifyUpcomingDueDates();
    res.json({ ok: true, sent: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post("/debug/notify/overdue-fines", async (req, res) => {
  try {
    const count = await notifyOverdueFines();
    res.json({ ok: true, sent: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post("/debug/notify/low-stock/:bookId", async (req, res) => {
  try {
    const count = await notifyLowStock(req.params.bookId);
    res.json({ ok: true, sent: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post("/debug/notify/damage", async (req, res) => {
  // body: { bookId, reportedBy, comment }
  try {
    const count = await notifyDamageReported(req.body);
    res.json({ ok: true, sent: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post("/debug/notify/membership-expiry", async (req, res) => {
  try {
    const count = await notifyMembershipExpiry(7);
    res.json({ ok: true, sent: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
