// Backend/services/libraryMarketingService.js
import User from "../models/User.js";
import Book from "../models/Book.js";
import { sendEmailWithNotification } from "./notificationEmailHelper.js";

export async function notifyNewBookAdded(bookId) {
  const book = await Book.findById(bookId);
  if (!book) return 0;

  const clientUrl =
    process.env.CLIENT_URL ||
    "https://library-management-application-mern-six.vercel.app";

  // 👇 match your existing student route /student/book/:id
  const bookUrl = `${clientUrl}/student/book/${book._id}`;

  const interestedUsers = await User.find({
    role: "STUDENT",
    isApproved: true,
    email: { $ne: null },
  });

  let sent = 0;

  for (const user of interestedUsers) {
    const subject = `New book added: ${book.title}`;
    const text = `Hi ${user.name},

A new book "${book.title}" has been added to the library.

Category: ${book.category || "General"}
Author: ${book.author || "Unknown"}

You can view this book directly in the library app here:
${bookUrl}

- Library`;

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;border:1px solid #e0e0e0;overflow:hidden;">
          <div style="background:#7b1fa2;color:#ffffff;padding:16px 24px;">
            <h2 style="margin:0;font-size:20px;">New book available</h2>
          </div>
          <div style="padding:24px;color:#333333;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>A new book has been added to the library collection:</p>
            <div style="border-left:4px solid #7b1fa2;padding-left:12px;margin:12px 0;">
              <p style="margin:0;"><strong>Title:</strong> ${book.title}</p>
              <p style="margin:0;"><strong>Author:</strong> ${book.author || "Unknown"}</p>
              <p style="margin:0;"><strong>Category:</strong> ${book.category || "General"}</p>
            </div>
            <p>You can open this book directly in the library application:</p>
            <p style="margin-top:12px;">
              <a href="${bookUrl}"
                 style="display:inline-block;background:#7b1fa2;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;">
                View book in library
              </a>
            </p>
            <p style="font-size:12px;color:#6b7280;margin-top:8px;">
              Or copy this link into your browser:<br/>
              <span style="word-break:break-all;">${bookUrl}</span>
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmailWithNotification({
      userId: user._id,
      email: user.email,
      type: "NEW_BOOK",
      subject,
      text,
      html,
    });

    sent += 1;
  }

  return sent;
}
