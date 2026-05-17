const express = require('express');
const router = express.Router();
const { getTimetable, createEntry, updateEntry, deleteEntry } = require('../controllers/timetableController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getTimetable);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
