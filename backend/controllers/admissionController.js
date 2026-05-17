const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'admissions.json');

// Ensure the data directory and file exist
const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
};

const readAdmissions = () => {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
};

const writeAdmissions = (data) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// @desc    Submit admission form
// @route   POST /api/admissions
// @access  Public (no auth needed)
exports.submitAdmission = async (req, res) => {
  try {
    const { studentName, parentName, email, phone, grade, address } = req.body;

    if (!studentName || !parentName || !email || !phone || !grade || !address) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const admissions = readAdmissions();

    const newAdmission = {
      _id: crypto.randomBytes(16).toString('hex'),
      studentName,
      parentName,
      email,
      phone,
      grade,
      address,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    admissions.unshift(newAdmission);
    writeAdmissions(admissions);

    console.log(`New admission received: ${studentName} for Grade ${grade}`);

    res.status(201).json({
      success: true,
      data: newAdmission,
    });
  } catch (error) {
    console.error('Admission submit error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all admissions
// @route   GET /api/admissions
// @access  Private/School
exports.getAdmissions = async (req, res) => {
  try {
    const admissions = readAdmissions();
    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions,
    });
  } catch (error) {
    console.error('Admission fetch error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update admission status (approve/reject)
// @route   PUT /api/admissions/:id
// @access  Private/School
exports.updateAdmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const admissions = readAdmissions();
    const index = admissions.findIndex(a => a._id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Admission form not found' });
    }

    if (admissions[index].status === 'approved' && status === 'approved') {
      return res.status(400).json({ success: false, error: 'Application already approved' });
    }

    admissions[index].status = status;
    writeAdmissions(admissions);

    console.log(`Admission ${admissions[index].studentName} status updated to: ${status}`);

    res.status(200).json({
      success: true,
      data: admissions[index],
    });
  } catch (error) {
    console.error('Admission status update error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};
