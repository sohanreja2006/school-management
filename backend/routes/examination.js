const express = require('express');
const router = express.Router();
const { getExams, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { getSubjects, createSubject, deleteSubject } = require('../controllers/subjectController');
const { saveMarks, getMarks, getStudentResult, getClassResults } = require('../controllers/markController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Exam Routes
router.get('/exams', getExams);
router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);

// Subject Routes
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.delete('/subjects/:id', deleteSubject);

// Marks & Result Routes
router.post('/marks', saveMarks);
router.get('/marks', getMarks);
router.get('/results/student/:studentId/:examId', getStudentResult);
router.get('/results/class', getClassResults);

module.exports = router;
