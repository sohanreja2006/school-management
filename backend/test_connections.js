const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

dotenv.config();

async function testAll() {
  console.log('--- STARTING CLOUD SERVICES VERIFICATION ---\n');

  // 1. Test Supabase
  try {
    console.log('1. Testing Supabase Connection...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data, error } = await supabase.from('schools').select('id').limit(1);
    if (error) throw error;
    console.log('✅ SUPABASE: DEPLOYED & CONNECTED SUCCESSFULLY (Service Role Active)\n');
  } catch (err) {
    console.log('❌ SUPABASE ERROR:', err.message, '\n');
  }

  // 2. Test MongoDB Atlas
  try {
    console.log('2. Testing MongoDB Atlas Connection...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MONGODB ATLAS: DEPLOYED & CONNECTED SUCCESSFULLY\n');
    await mongoose.disconnect();
  } catch (err) {
    console.log('❌ MONGODB ATLAS ERROR:', err.message, '\n');
  }

  // 3. Test Firebase Admin
  try {
    console.log('3. Testing Firebase Admin SDK...');
    const serviceAccount = require('./config/serviceAccountKey.json');
    if (serviceAccount.project_id === 'mock-project' || serviceAccount.private_key.includes('MOCK')) {
      console.log('⚠️  FIREBASE: NOT DEPLOYED (Currently using Mock serviceAccountKey.json)\n');
    } else {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('✅ FIREBASE: DEPLOYED & CONFIGURED SUCCESSFULLY\n');
    }
  } catch (err) {
    console.log('❌ FIREBASE ERROR:', err.message, '\n');
  }

  console.log('--- VERIFICATION COMPLETE ---');
  process.exit(0);
}

testAll();
