const express = require('express');
const router = express.Router();
const {
  submitAdmission,
  getAdmissions,
  updateAdmissionStatus,
} = require('../controllers/admissionController');

router.route('/')
  .post(submitAdmission)
  .get(getAdmissions);

router.route('/:id')
  .put(updateAdmissionStatus);

module.exports = router;
