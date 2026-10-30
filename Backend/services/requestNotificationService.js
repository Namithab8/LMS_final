// Backend/services/requestNotificationService.js
import Request from "../models/Request.js";
import User from "../models/User.js";
import Book from "../models/Book.js";
import { sendEmailWithNotification } from "./notificationEmailHelper.js";

export async function notifyRequestStatusChange(requestId) {
  const request = await Request.findById(requestId)
    .populate("user")
    .populate("book");

  if (!request || !request.user?.email) return 0;

  const user = request.user;
  const book = request.book;

  const status = request.status?.toUpperCase();
  let subject;
  let text;
  let html;

  if (status === "APPROVED") {
    subject = `Your request was approved – ${book.title}`;
    text = `Hi ${user.name},

Your request for the book "${book.title}" has been approved.

You can now visit the library to collect it or follow the instructions in the portal.

- Library`;
    html = `
      <div style="font-family: Arial, sans-serif; background:#e8f5e9; padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;border:1px solid #c8e6c9;overflow:hidden;">
          <div style="background:#2e7d32;color:#ffffff;padding:16px 24px;">
            <h2 style="margin:0;font-size:20px;">Request approved</h2>
          </div>
          <div style="padding:24px;color:#333333;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your request for the following book has been approved:</p>
            <div style="border-left:4px solid #2e7d32;padding-left:12px;margin:12px 0;">
              <p style="margin:0;"><strong>Title:</strong> ${book.title}</p>
            </div>
            <p>Please check the portal for collection details or due dates.</p>
          </div>
        </div>
      </div>
    `;
  } else if (status === "REJECTED") {
    subject = `Your request was rejected – ${book.title}`;
    text = `Hi ${user.name},

Your request for the book "${book.title}" has been rejected.

Please contact the library if you need more details.

- Library`;
    html = `
      <div style="font-family: Arial, sans-serif; background:#ffebee; padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;border:1px solid #ffcdd2;overflow:hidden;">
          <div style="background:#c62828;color:#ffffff;padding:16px 24px;">
            <h2 style="margin:0;font-size:20px;">Request rejected</h2>
          </div>
          <div style="padding:24px;color:#333333;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your request for the following book has been rejected:</p>
            <div style="border-left:4px solid #c62828;padding-left:12px;margin:12px 0;">
              <p style="margin:0;"><strong>Title:</strong> ${book.title}</p>
            </div>
            <p>If you have questions, please contact the library staff.</p>
          </div>
        </div>
      </div>
    `;
  } else {
    return 0;
  }

  // ✅ use object-style call
  await sendEmailWithNotification({
    userId: user._id,
    email: user.email,
    type: "REQUEST_STATUS",
    subject,
    text,
    html,
  });

  return 1;
}
