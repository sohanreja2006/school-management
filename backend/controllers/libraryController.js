const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/library
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({ schoolId: req.user.schoolId });
    res.status(200).json({ success: true, data: books });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add a book
// @route   POST /api/library
exports.addBook = async (req, res) => {
  try {
    const book = await Book.create({
      ...req.body,
      schoolId: req.user.schoolId
    });
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
