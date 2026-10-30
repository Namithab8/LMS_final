// Backend/services/ragHelpers.js
import Book from '../models/Book.js';
import MembershipPlan from '../models/MembershipPlan.js';
import BorrowRecord from '../models/BorrowRecord.js';
import User from '../models/User.js';

import Member from '../models/Member.js';
import Request from '../models/Request.js';
import MembershipRequest from '../models/MembershipRequest.js';
import PriorityRequest from '../models/PriorityRequest.js';
import Fine from '../models/Fine.js';
import Notification from '../models/Notification.js';

// Very simple keyword extractor
function extractKeywords(question) {
  return question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3); // ignore very short words
}

/**
 * 1) Book context
 * - Handles generic "books", "available books", "total number of books"
 * - Provides total books + available books + some titles
 */
export async function getBookContext(question) {
  const lower = question.toLowerCase();
  const keywords = extractKeywords(question);

  // Generic book availability / count questions
  if (
    (lower.includes('available') && lower.includes('book')) ||
    lower.trim() === 'books' ||
    lower.includes('total number of books') ||
    lower.includes('total books') ||
    lower.includes('book count')
  ) {
    const [totalBooks, availableBooks, sampleBooks] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ availableCopies: { $gt: 0 } }),
      Book.find({ availableCopies: { $gt: 0 } })
        .select('title author availableCopies totalCopies category')
        .limit(10),
    ]);

    if (!totalBooks && !sampleBooks.length) {
      return 'There are currently no books stored in the system.';
    }

    const lines = [];

    lines.push(
      `BOOK_OVERVIEW: Total books in system: ${totalBooks}. Available books (at least one copy free): ${availableBooks}.`
    );

    if (sampleBooks.length) {
      lines.push('SOME_AVAILABLE_BOOKS:');
      for (const b of sampleBooks) {
        lines.push(
          `- "${b.title}" by ${b.author || 'Unknown author'} (Category: ${
            b.category || 'N/A'
          }, Available: ${b.availableCopies}/${b.totalCopies}).`
        );
      }
    }

    return lines.join('\n');
  }

  // Topic-based search for specific type of books (e.g., "ML books")
  if (keywords.length === 0) return '';

  const regex = new RegExp(keywords.join('|'), 'i');

  const books = await Book.find({
    $or: [{ title: regex }, { author: regex }, { category: regex }],
  })
    .select('title author category isbn availableCopies totalCopies')
    .limit(10);

  if (!books.length) return '';

  const lines = books.map(
    (b) =>
      `Book: "${b.title}" by ${b.author || 'Unknown author'}. Category: ${
        b.category || 'N/A'
      }. ISBN: ${b.isbn || 'N/A'}. Available copies: ${
        b.availableCopies
      } out of ${b.totalCopies}.`
  );

  return lines.join('\n');
}

/**
 * 2) Membership plans info for questions about plans/membership
 * Uses MembershipPlan + User.membershipType (BASIC/PREMIUM)
 */
export async function getMembershipPlanContext(userId) {
  const plans = await MembershipPlan.find({ isActive: true });

  const user = userId
    ? await User.findById(userId).select('membershipType')
    : null;

  if (!plans.length) return 'There are no active membership plans in the system.';

  const lines = [];
  lines.push(`MEMBERSHIP_PLANS: Total active plans: ${plans.length}.`);

  const currentType = user?.membershipType || 'BASIC';

  for (const p of plans) {
    const isSelected =
      p.name.toUpperCase().includes(currentType) ? 'SELECTED' : 'NOT_SELECTED';

    lines.push(
      `Plan: ${p.name} [${isSelected}]. Fee: Rs ${
        p.fee || 0
      }. Max books: ${p.maxBooksAllowed || 'N/A'}. Duration: ${
        p.durationInDays || 'N/A'
      } days. Description: ${p.description || 'No extra details'}.`
    );
  }

  lines.push(
    `CURRENT_PLAN: The user membershipType on User is "${currentType}".`
  );

  return lines.join('\n');
}

/**
 * 3) Borrowed books for the current student (by userId)
 */
export async function getStudentBorrowContext(userId) {
  if (!userId) return '';

  const user = await User.findById(userId).select('name email');
  const records = await BorrowRecord.find({ student: userId })
    .populate('book')
    .sort({ createdAt: -1 })
    .limit(10);

  if (!records.length) {
    return `Student ${user?.name || ''} (${user?.email || ''}) has no borrow records.`;
  }

  const lines = [];

  lines.push(
    `BORROW_SUMMARY: Student ${user?.name || ''} (${user?.email || ''}) has ${records.length} recent borrow records.`
  );

  for (const r of records) {
    const b = r.book || {};
    lines.push(
      `Borrowed book "${b.title || 'Unknown'}" by ${
        b.author || 'Unknown author'
      }. Borrowed on ${r.createdAt?.toDateString() || 'N/A'}, due on ${
        r.dueDate?.toDateString() || 'N/A'
      }. Status: ${r.isReturned ? 'Returned' : 'Not returned yet'}.`
    );
  }

  return lines.join('\n');
}

/**
 * 4) Student-specific extra context:
 * - priority queue (PriorityRequest by this user)
 */
export async function getStudentExtraContext(userId) {
  if (!userId) return '';

  const lines = [];

  const priorityRequests = await PriorityRequest.find({ user: userId })
    .populate('book')
    .sort({ createdAt: -1 })
    .limit(10);

  if (priorityRequests.length) {
    lines.push(
      `PRIORITY_QUEUE: You have ${priorityRequests.length} priority requests.`
    );
    for (const pr of priorityRequests) {
      const b = pr.book || {};
      lines.push(
        `- Priority request for "${b.title || 'Unknown'}" by ${
          b.author || 'Unknown author'
        }. Status: ${pr.status || 'UNKNOWN'}.`
      );
    }
  }

  return lines.join('\n') || '';
}

/**
 * 5) Librarian dashboard context:
 * - total books & sample names
 * - total students & sample names
 * - books issued, books returned
 */
export async function getLibrarianDashboardContext() {
  const [
    bookCount,
    sampleBooks,
    studentCount,
    sampleStudents,
    issuedCount,
    returnedCount,
  ] = await Promise.all([
    Book.countDocuments(),
    Book.find().select('title author').limit(10),
    User.countDocuments({ role: 'STUDENT' }),
    User.find({ role: 'STUDENT' }).select('name email').limit(10),
    BorrowRecord.countDocuments({ isReturned: false }),
    BorrowRecord.countDocuments({ isReturned: true }),
  ]);

  const lines = [];

  lines.push(
    `LIBRARIAN_OVERVIEW: Total books: ${bookCount}. Total students: ${studentCount}. Books currently issued (not returned): ${issuedCount}. Books returned: ${returnedCount}.`
  );

  if (sampleBooks.length) {
    lines.push('LIBRARIAN_BOOK_LIST (sample):');
    for (const b of sampleBooks) {
      lines.push(`- "${b.title}" by ${b.author || 'Unknown author'}.`);
    }
  }

  if (sampleStudents.length) {
    lines.push('LIBRARIAN_STUDENT_LIST (sample):');
    for (const s of sampleStudents) {
      lines.push(`- ${s.name || 'Unknown'} (${s.email || 'no-email'}).`);
    }
  }

  return lines.join('\n');
}

/**
 * 5b) Librarian book request context:
 * - total requests
 * - pending / approved / rejected counts
 * - sample pending requests with book + student
 */
export async function getLibrarianRequestContext() {
  const [
    totalRequests,
    pendingCount,
    approvedCount,
    rejectedCount,
    pendingList,
  ] = await Promise.all([
    Request.countDocuments(),
    Request.countDocuments({ status: 'pending' }),
    Request.countDocuments({ status: 'approved' }),
    Request.countDocuments({ status: 'rejected' }),
    Request.find({ status: 'pending' })
      .populate('book')
      .populate('user')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const lines = [];

  lines.push(
    `LIBRARIAN_REQUESTS: Total book requests: ${totalRequests}. Pending: ${pendingCount}. Approved: ${approvedCount}. Rejected: ${rejectedCount}.`
  );

  if (pendingList.length) {
    lines.push('LIBRARIAN_REQUESTS_PENDING (sample):');
    for (const r of pendingList) {
      const b = r.book || {};
      const u = r.user || {};
      lines.push(
        `- Pending request for "${b.title || 'Unknown'}" by ${
          b.author || 'Unknown author'
        } from ${u.name || 'Unknown student'} (${u.email || 'no-email'}).`
      );
    }
  }

  return lines.join('\n');
}

/**
 * 6) Admin dashboard context:
 * - total users + per-role counts
 * - total books
 * - total issued vs returned
 * - total pending approvals (membership + priority)
 * - membership requests summary
 * - notifications content and count
 */
export async function getAdminDashboardContext() {
  const [
    // Users
    totalUsers,
    adminCount,
    librarianCount,
    studentCount,
    // Books & borrows
    totalBooks,
    totalIssued,
    totalReturned,
    // Approvals
    membershipRequestCount,
    pendingMembershipRequestCount,
    priorityRequestCount,
    pendingPriorityRequestCount,
    // Members & notifications
    members,
    notifications,
  ] = await Promise.all([
    // users
    User.countDocuments(),
    User.countDocuments({ role: 'ADMIN' }),
    User.countDocuments({ role: 'LIBRARIAN' }),
    User.countDocuments({ role: 'STUDENT' }),
    // books & borrow
    Book.countDocuments(),
    BorrowRecord.countDocuments({ isReturned: false }),
    BorrowRecord.countDocuments({ isReturned: true }),
    // approvals
    MembershipRequest.countDocuments(),
    MembershipRequest.countDocuments({ status: 'pending' }),
    PriorityRequest.countDocuments(),
    PriorityRequest.countDocuments({ status: 'PENDING' }),
    // members list – no populate('user') because Member has no user ref
    Member.find().limit(20),
    // notifications
    Notification.find().sort({ createdAt: -1 }).limit(20),
  ]);

  const pendingApprovalsTotal =
    pendingMembershipRequestCount + pendingPriorityRequestCount;

  const lines = [];

  // Users
  lines.push(
    `ADMIN_USERS: Total users: ${totalUsers}. Admins: ${adminCount}. Librarians: ${librarianCount}. Students: ${studentCount}.`
  );

  // Books & borrows
  lines.push(
    `ADMIN_BOOKS: Total books in system: ${totalBooks}. Books currently issued (not returned): ${totalIssued}. Books returned: ${totalReturned}.`
  );

  // Approvals
  lines.push(
    `ADMIN_APPROVALS: Total membership requests: ${membershipRequestCount}, pending membership requests: ${pendingMembershipRequestCount}.`
  );
  lines.push(
    `ADMIN_APPROVALS: Total priority requests: ${priorityRequestCount}, pending priority requests: ${pendingPriorityRequestCount}.`
  );
  lines.push(
    `ADMIN_APPROVALS: Total pending approvals (membership + priority): ${pendingApprovalsTotal}.`
  );

  // Members list (sample) – adjust fields to your Member.js schema
  if (members.length) {
    lines.push(`ADMIN_MEMBERS: Sample member list (up to 20):`);
    for (const m of members) {
      lines.push(
        `- Member: ${m.name || 'Unknown'} (${m.email || 'no-email'}), Active: ${
          m.isActive ? 'YES' : 'NO'
        }.`
      );
    }
  }

  // Notifications content + count
  if (notifications.length) {
    lines.push(
      `ADMIN_NOTIFICATIONS: Total notifications loaded in this context: ${notifications.length}.`
    );
    for (const n of notifications) {
      lines.push(
        `- Notification: "${n.title || 'No title'}" - ${
          n.message || 'No message'
        }. Status: ${n.status || 'UNKNOWN'}.`
      );
    }
  }

  return lines.join('\n');
}
