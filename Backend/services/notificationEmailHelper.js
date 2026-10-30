// Backend/services/notificationEmailHelper.js
import Notification from "../models/Notification.js";
import { sendEmail } from "./emailService.js";

export async function sendEmailWithNotification(
  arg1,
  arg2,
  arg3,
  arg4,
  arg5,
  arg6,
) {
  let userId, email, type, subject, text, html;

  if (typeof arg1 === "object" && arg1 !== null) {
    ({ userId, email, type, subject, text, html } = arg1);
  } else {
    [userId, email, type, subject, text, html] = [
      arg1,
      arg2,
      arg3,
      arg4,
      arg5,
      arg6,
    ];
  }

  console.log("sendEmailWithNotification called for:", {
    userId,
    email,
    type,
    subject,
  });

  if (!email || !type || !subject) {
    console.error(
      "sendEmailWithNotification called with missing fields!",
      { userId, email, type, subject },
      new Error().stack,
    );
    return null;
  }

  const notification = await Notification.create({
    userId,
    email,
    type,
    subject,
    message: text?.slice(0, 200),
    status: "PENDING",
  });

  try {
    await sendEmail(email, subject, text, html);
    notification.status = "SENT";
    await notification.save();
  } catch (err) {
    notification.status = "FAILED";
    notification.error = err?.message || String(err);
    await notification.save();
    console.error(
      "Email send failed for notification",
      notification.id,
      err.message,
    );
    throw err;
  }

  return notification;
}
