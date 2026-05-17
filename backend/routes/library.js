const express = require('express');
const { protect } = require('../middleware/auth');
const { getBooks, addBook } = require('../controllers/libraryController');
const router = express.Router();

router.use(protect);
router.get('/', getBooks);
router.post('/', addBook);

module.exports = router;
