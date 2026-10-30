// services/accountNotificationService.js
import { sendEmailWithNotification } from "./notificationEmailHelper.js";
import User from "../models/User.js";

export async function notifyLogin(userId, ipAddress, userAgent) {
  const user = await User.findById(userId);
  if (!user || !user.email) return 0;

  const subject = "New login to your LMS account";
  const text = `Hi ${user.name},

A new login to your Library Management System account was detected.

IP address: ${ipAddress || "Unknown"}
Device/Browser: ${userAgent || "Unknown"}

If this was you, you can ignore this email. If you did not log in, please reset your password immediately.

- Library`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;border:1px solid #e0e0e0;overflow:hidden;">
        <div style="background:#1e88e5;color:#ffffff;padding:16px 24px;">
          <h2 style="margin:0;font-size:20px;">New login to your account</h2>
        </div>
        <div style="padding:24px;color:#333333;">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>A new login to your Library Management System account was detected.</p>
          <div style="border-left:4px solid #1e88e5;padding-left:12px;margin:12px 0;">
            <p style="margin:0;"><strong>IP address:</strong> ${ipAddress || "Unknown"}</p>
            <p style="margin:0;"><strong>Device/Browser:</strong> ${userAgent || "Unknown"}</p>
          </div>
          <p>If this was you, you can ignore this email.</p>
          <p>If you did not log in, please reset your password immediately.</p>
        </div>
        <div style="background:#f1f3f4;color:#777777;padding:10px 24px;font-size:12px;text-align:center;">
          This security alert was sent automatically by your Library Management System.
        </div>
      </div>
    </div>
  `;

  await sendEmailWithNotification(
    user._id,
    user.email,
    "LOGIN_ALERT",
    subject,
    text,
    html,
  );

  return 1;
}
