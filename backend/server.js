const express = require('express');

const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { validateOrExit } = require('./config/validateStartup');
const { buildCorsOptions } = require('./middleware/corsOptions');
const { apiLimiter } = require('./middleware/rateLimiters');

// Load env vars
dotenv.config({ path: './.env' });
console.log('RESEND_API_KEY Loaded:', process.env.RESEND_API_KEY ? 'YES (Starts with ' + process.env.RESEND_API_KEY.substring(0, 5) + '...)' : 'NO');
validateOrExit();

// Connect to database
connectDB();

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS (ALLOWED_ORIGINS required in production — see validateStartup)
app.use(cors(buildCorsOptions()));

app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/student'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/fees', require('./routes/fee'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/examination', require('./routes/examination'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/admissions', require('./routes/admission'));
app.use('/api/homework', require('./routes/homework'));
app.use('/api/leaves', require('./routes/leave'));
app.use('/api/library', require('./routes/library'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/events', require('./routes/event'));
app.use('/api/behavior', require('./routes/behavior'));
app.use('/api/school', require('./routes/school'));
app.use('/api/tracking', require('./routes/tracking'));

// Basic route
app.get('/', (req, res) => {
  res.send('School Management API is running...');
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'School Management API is active',
    version: '1.0.0'
  });
});

app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }
  console.error(err);
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
  return res.status(500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;
