// Backend/scripts/seedAll.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Book from "../models/Book.js";
import User from "../models/User.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Member from "../models/Member.js";
import FineConfig from "../models/FineConfig.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // Hash password
    const password = await bcrypt.hash("password123", 10);

    // 1. Clear existing data (optional - comment out if you want to keep existing data)
    console.log("⏳ Clearing existing data...");
    await Book.deleteMany({});
    await User.deleteMany({});
    await MembershipPlan.deleteMany({});
    await Member.deleteMany({});
    await FineConfig.deleteMany({});
    console.log("✅ Cleared existing data");

    // 2. Seed Membership Plans
    console.log("⏳ Seeding membership plans...");
    const standardPlan = await MembershipPlan.create({
      name: "Standard",
      description: "Standard plan with basic borrowing limits",
      fee: 500,
      durationInDays: 365,
      maxBooksAllowed: 5,
      isActive: true,
    });

    const premiumPlan = await MembershipPlan.create({
      name: "Premium",
      description: "Higher limits and priority access",
      fee: 1000,
      durationInDays: 365,
      maxBooksAllowed: 10,
      isActive: true,
    });
    console.log("✅ Seeded membership plans");

    // 3. Seed Users (Admin, Librarians, Students)
    console.log("⏳ Seeding users...");

    // Admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@library.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      isApproved: true,
      authProvider: "LOCAL",
      membershipType: "PREMIUM",
      maxBorrowLimit: 20,
    });

    // Librarians
    const librarian1 = await User.create({
      name: "John Librarian",
      email: "librarian1@library.com",
      password: await bcrypt.hash("lib123", 10),
      role: "LIBRARIAN",
      isApproved: true,
      authProvider: "LOCAL",
      membershipType: "PREMIUM",
      maxBorrowLimit: 15,
    });

    const librarian2 = await User.create({
      name: "Sarah Librarian",
      email: "librarian2@library.com",
      password: await bcrypt.hash("lib123", 10),
      role: "LIBRARIAN",
      isApproved: true,
      authProvider: "LOCAL",
      membershipType: "PREMIUM",
      maxBorrowLimit: 15,
    });

    // Students
    const student1 = await User.create({
      name: "Alice Johnson",
      email: "alice@student.com",
      password: password,
      role: "STUDENT",
      isApproved: true,
      authProvider: "LOCAL",
      membershipType: "BASIC",
      maxBorrowLimit: 5,
      course: "Computer Science",
    });

    const student2 = await User.create({
      name: "Bob Smith",
      email: "bob@student.com",
      password: password,
      role: "STUDENT",
      isApproved: true,
      authProvider: "LOCAL",
      membershipType: "BASIC",
      maxBorrowLimit: 5,
      course: "Engineering",
    });

    const student3 = await User.create({
      name: "Charlie Brown",
      email: "charlie@student.com",
      password: password,
      role: "STUDENT",
      isApproved: true,
      authProvider: "LOCAL",
      membershipType: "PREMIUM",
      maxBorrowLimit: 10,
      course: "Mathematics",
    });

    const student4 = await User.create({
      name: "Diana Prince",
      email: "diana@student.com",
      password: password,
      role: "STUDENT",
      isApproved: true,
      authProvider: "LOCAL",
      membershipType: "BASIC",
      maxBorrowLimit: 5,
      course: "Physics",
    });

    const student5 = await User.create({
      name: "Evan Wright",
      email: "evan@student.com",
      password: password,
      role: "STUDENT",
      isApproved: true,
      authProvider: "LOCAL",
      membershipType: "PREMIUM",
      maxBorrowLimit: 10,
      course: "Chemistry",
    });

    console.log("✅ Seeded users (1 admin, 2 librarians, 5 students)");

    // 4. Seed Members
    console.log("⏳ Seeding members...");
    const member1 = await Member.create({
      name: "Alice Johnson",
      email: "alice@student.com",
      phone: "1234567890",
      address: "123 Main St, City",
      plan: standardPlan._id,
      joinDate: new Date("2024-01-01"),
      expiryDate: new Date("2025-01-01"),
      isActive: true,
      totalOutstandingFine: 0,
      totalPaidFine: 0,
    });

    const member2 = await Member.create({
      name: "Bob Smith",
      email: "bob@student.com",
      phone: "2345678901",
      address: "456 Oak Ave, Town",
      plan: standardPlan._id,
      joinDate: new Date("2024-02-01"),
      expiryDate: new Date("2025-02-01"),
      isActive: true,
      totalOutstandingFine: 0,
      totalPaidFine: 0,
    });

    const member3 = await Member.create({
      name: "Charlie Brown",
      email: "charlie@student.com",
      phone: "3456789012",
      address: "789 Pine Rd, Village",
      plan: premiumPlan._id,
      joinDate: new Date("2024-03-01"),
      expiryDate: new Date("2025-03-01"),
      isActive: true,
      totalOutstandingFine: 0,
      totalPaidFine: 0,
    });

    const member4 = await Member.create({
      name: "Diana Prince",
      email: "diana@student.com",
      phone: "4567890123",
      address: "321 Elm Blvd, Metro",
      plan: standardPlan._id,
      joinDate: new Date("2024-04-01"),
      expiryDate: new Date("2025-04-01"),
      isActive: true,
      totalOutstandingFine: 0,
      totalPaidFine: 0,
    });

    const member5 = await Member.create({
      name: "Evan Wright",
      email: "evan@student.com",
      phone: "5678901234",
      address: "654 Cedar Ln, County",
      plan: premiumPlan._id,
      joinDate: new Date("2024-05-01"),
      expiryDate: new Date("2025-05-01"),
      isActive: true,
      totalOutstandingFine: 0,
      totalPaidFine: 0,
    });

    console.log("✅ Seeded members");

    // 5. Seed Books
    console.log("⏳ Seeding books...");
    const books = await Book.insertMany([
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Fiction",
        isbn: "978-0743273565",
        totalCopies: 5,
        availableCopies: 5,
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        isbn: "978-0061120084",
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: "1984",
        author: "George Orwell",
        category: "Fiction",
        isbn: "978-0451524935",
        totalCopies: 6,
        availableCopies: 6,
      },
      {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        category: "Computer Science",
        isbn: "978-0262033848",
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Computer Science",
        isbn: "978-0132350884",
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: "Design Patterns",
        author: "Erich Gamma",
        category: "Computer Science",
        isbn: "978-0201633610",
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: "Calculus: Early Transcendentals",
        author: "James Stewart",
        category: "Mathematics",
        isbn: "978-1285740621",
        totalCopies: 5,
        availableCopies: 5,
      },
      {
        title: "Linear Algebra Done Right",
        author: "Sheldon Axler",
        category: "Mathematics",
        isbn: "978-3319110790",
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: "University Physics",
        author: "Hugh D. Young",
        category: "Physics",
        isbn: "978-0133969290",
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: "Organic Chemistry",
        author: "Paula Yurkanis Bruice",
        category: "Chemistry",
        isbn: "978-0321803221",
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt",
        category: "Computer Science",
        isbn: "978-0201616224",
        totalCopies: 5,
        availableCopies: 5,
      },
      {
        title: "Refactoring",
        author: "Martin Fowler",
        category: "Computer Science",
        isbn: "978-0201485677",
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: "Engineering Mechanics",
        author: "J.L. Meriam",
        category: "Engineering",
        isbn: "978-1118800253",
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: "Data Structures and Algorithms",
        author: "Alfred V. Aho",
        category: "Computer Science",
        isbn: "978-0201000290",
        totalCopies: 5,
        availableCopies: 5,
      },
      {
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell",
        category: "Computer Science",
        isbn: "978-0136042594",
        totalCopies: 3,
        availableCopies: 3,
      },
    ]);
    console.log(`✅ Seeded ${books.length} books`);

    // 6. Seed Fine Config
    console.log("⏳ Seeding fine config...");
    await FineConfig.create({
      name: "Standard",
      finePerDay: 5,
      graceDays: 3,
      maxFinePerItem: 100,
      isActive: true,
    });

    await FineConfig.create({
      name: "TestMinute",
      finePerDay: 1,
      graceDays: 0,
      maxFinePerItem: 50,
      isActive: true,
    });
    console.log("✅ Seeded fine config");

    console.log("\n🎉 All data seeded successfully!");
    console.log("\n📝 Login credentials:");
    console.log("  Admin: admin@library.com / admin123");
    console.log("  Librarian: librarian1@library.com / lib123");
    console.log("  Student: alice@student.com / password123");
    console.log("  Student: bob@student.com / password123");
    console.log("  Student: charlie@student.com / password123");
    console.log("  Student: diana@student.com / password123");
    console.log("  Student: evan@student.com / password123");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
