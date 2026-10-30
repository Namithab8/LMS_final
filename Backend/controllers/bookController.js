// controllers/bookController.js
import Book from '../models/Book.js';
import { notifyNewBookAdded } from "../services/libraryMarketingService.js";

export async function addBook(req, res) {
  try {
    const { title, author, category, isbn, totalCopies } = req.body;

    const book = new Book({
      title,
      author,
      category,
      isbn,
      totalCopies: totalCopies ? Number(totalCopies) : 1,
      availableCopies: totalCopies ? Number(totalCopies) : 1,
      coverPath: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await book.save();

    // Fire-and-forget so the API response is not blocked by emails
    notifyNewBookAdded(book._id).catch(err => {
      console.error("notifyNewBookAdded failed", err);
    });

    res.json({ message: 'Book added', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function listBooks(req, res) {
  try {
    const { q, category } = req.query;
    const filter = {};

    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category) filter.category = category;

    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getBook(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function editBook(req, res) {
  try {
    const data = { ...req.body };
    if (req.file) data.coverPath = `/uploads/${req.file.filename}`;

    const book = await Book.findByIdAndUpdate(req.params.id, data, {
      new: true
    });

    res.json({ message: 'Updated', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteBook(req, res) {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
