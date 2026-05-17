const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    const users = await User.find({});
    console.log('Current Users in DB:');
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    process.exit();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

listUsers();
