// Backend/controllers/dashboardController.js
import User from "../models/User.js";
import Book from "../models/Book.js";
import BorrowRecord from "../models/BorrowRecord.js";
import Member from "../models/Member.js";
import MembershipRequest from "../models/MembershipRequest.js";
import Fine from "../models/Fine.js";

// Admin Dashboard Stats
export async function getAdminStats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const pendingApprovals = await User.countDocuments({ isApproved: false });
    const activeStudents = await User.countDocuments({ role: "STUDENT", isApproved: true });
    const totalLibrarians = await User.countDocuments({ role: "LIBRARIAN" });
    const totalBooks = await Book.countDocuments();
    const totalAvailableBooks = await Book.aggregate([
      { $group: { _id: null, total: { $sum: "$availableCopies" } } }
    ]);
    const totalMembers = await Member.countDocuments({ isActive: true });
    const pendingMembershipRequests = await MembershipRequest.countDocuments({ status: "PENDING" });

    // User distribution by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      pendingApprovals,
      activeStudents,
      totalLibrarians,
      totalBooks,
      totalAvailableBooks: totalAvailableBooks[0]?.total || 0,
      totalMembers,
      pendingMembershipRequests,
      usersByRole: usersByRole.map(u => ({ name: u._id, value: u.count })),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
}

// Librarian Dashboard Stats
export async function getLibrarianStats(req, res) {
  try {
    const totalBooks = await Book.countDocuments();
    const totalAvailableBooks = await Book.aggregate([
      { $group: { _id: null, total: { $sum: "$availableCopies" } } }
    ]);
    const totalBorrowed = await BorrowRecord.countDocuments({ status: "BORROWED" });
    const totalOverdue = await BorrowRecord.countDocuments({
      status: "BORROWED",
      dueDate: { $lt: new Date() }
    });
    const pendingRequests = await BorrowRecord.countDocuments({ status: "PENDING" });
    const totalStudents = await User.countDocuments({ role: "STUDENT", isApproved: true });

    res.json({
      totalBooks,
      totalAvailableBooks: totalAvailableBooks[0]?.total || 0,
      totalBorrowed,
      totalOverdue,
      pendingRequests,
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching librarian stats:", error);
    res.status(500).json({ message: "Failed to fetch librarian stats" });
  }
}

// Student Dashboard Stats
export async function getStudentStats(req, res) {
  try {
    const userId = req.user.id;

    const totalBooks = await Book.countDocuments();
    const totalAvailableBooks = await Book.aggregate([
      { $group: { _id: null, total: { $sum: "$availableCopies" } } }
    ]);

    const borrowedBooks = await BorrowRecord.countDocuments({
      userId,
      status: "BORROWED"
    });

    const overdueBooks = await BorrowRecord.countDocuments({
      userId,
      status: "BORROWED",
      dueDate: { $lt: new Date() }
    });

    const pendingRequests = await BorrowRecord.countDocuments({
      userId,
      status: "PENDING"
    });

    const user = await User.findById(userId);
    const member = await Member.findOne({ email: user.email });
    const totalOutstandingFine = member?.totalOutstandingFine || 0;

    res.json({
      totalBooks,
      totalAvailableBooks: totalAvailableBooks[0]?.total || 0,
      borrowedBooks,
      overdueBooks,
      pendingRequests,
      totalOutstandingFine,
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    res.status(500).json({ message: "Failed to fetch student stats" });
  }
}
