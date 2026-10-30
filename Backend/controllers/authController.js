// Backend/controllers/authController.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

import {
  sendWelcomeEmail,
  sendEmail,
  buildPasswordResetEmail,
} from "../services/emailService.js";

import { notifyLogin } from "../services/accountNotificationService.js";

dotenv.config();

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const isAdmin = role === "ADMIN";

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "STUDENT",
      idProofPath: req.file ? `/uploads/${req.file.filename}` : undefined,
      isApproved: isAdmin ? true : false,
    });

    await user.save();

    // Auto‑approved users (ADMIN, or later auto‑approved roles) get welcome mail immediately
    if (user.isApproved) {
      await sendWelcomeEmail(user);
      return res.json({
        message: "Registration successful. Welcome email sent.",
      });
    }

    // For students/librarians awaiting approval
    res.json({ message: "Registration submitted. Await admin approval." });
  } catch (err) {
    console.error(err);
    if (err.code === 11000)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    if (user.role !== "ADMIN" && !user.isApproved)
      return res
        .status(403)
        .json({ message: "Account pending admin approval" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // NEW: security login alert email
    try {
      await notifyLogin(user._id, req.ip, req.headers["user-agent"]);
    } catch (e) {
      // Do not block login if email fails
      console.error("notifyLogin failed:", e.message);
    }

    res.json({ token, role: user.role, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    // Same response even if not found (security)
    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password/${token}`;
    const template = buildPasswordResetEmail(user, resetLink);

    await sendEmail(user.email, template.subject, template.text, template.html);

    return res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/reset-password/:token
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password reset successful. You can log in now." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
