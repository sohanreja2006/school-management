const mongoose = require('mongoose');
require('dotenv').config();
const Mark = require('./models/Mark');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school-management');
    console.log('Connected to DB');

    const allMarks = await Mark.find({});
    const seen = new Set();
    const duplicates = [];

    for (const m of allMarks) {
      const key = `${m.student.toString()}-${m.exam.toString()}-${m.subject.toString()}`;
      if (seen.has(key)) {
        duplicates.push(m._id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      console.log(`Deleting ${duplicates.length} duplicates...`);
      await Mark.deleteMany({ _id: { $in: duplicates } });
    } else {
      console.log('No duplicates found.');
    }

    console.log('Ensuring unique index...');
    try {
      await Mark.collection.dropIndex('student_1_exam_1_subject_1');
    } catch (e) {
      console.log('Index did not exist or could not be dropped, proceeding...');
    }
    await Mark.createIndexes();
    console.log('Index created successfully.');

    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
