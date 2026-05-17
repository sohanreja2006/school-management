require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function clearAllData() {
  const tables = [
    'attendance', 'behavior_logs', 'books', 'events', 
    'exams', 'fee_payments', 'fees', 'homework', 'inventory', 'leave_requests', 
    'library_transactions', 'marks', 'notifications', 'payroll', 'schools', 
    'students', 'subjects', 'teachers', 'timetables', 'transport_routes', 'users'
  ];
  
  console.log('Clearing all tables...');
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().not('id', 'is', null);
      if (error && error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== 'PGRST205') {
        console.error(`Error clearing ${table}:`, error.message);
      } else if (!error) {
        console.log(`Cleared ${table}`);
      }
    } catch (e) {
      console.log(`Table ${table} might not exist yet.`);
    }
  }

  // Also clear the JSON file for admissions
  const fs = require('fs');
  const path = require('path');
  const admissionsPath = path.join(__dirname, 'data', 'admissions.json');
  if (fs.existsSync(admissionsPath)) {
    fs.writeFileSync(admissionsPath, '[]');
    console.log('Cleared admissions.json');
  }

  console.log('All data reset successfully!');
}

clearAllData();
