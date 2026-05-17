const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createTable() {
  // Try inserting a test row - if the table doesn't exist, Supabase will tell us
  const { data, error } = await supabase
    .from('admissions')
    .select('id')
    .limit(1);

  if (error && error.message.includes('does not exist')) {
    console.log('Table "admissions" does not exist in Supabase.');
    console.log('');
    console.log('Please go to your Supabase Dashboard SQL Editor and run this SQL:');
    console.log('');
    console.log(`CREATE TABLE admissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  grade TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public access for form submissions (no auth needed)
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON admissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated reads" ON admissions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated updates" ON admissions FOR UPDATE USING (true);`);
  } else if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Table "admissions" already exists! Current rows:', data.length);
  }
}

createTable();
