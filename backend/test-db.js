const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Attempting to connect to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
})
.catch(err => {
    console.error('FAILURE:', err);
    process.exit(1);
});
