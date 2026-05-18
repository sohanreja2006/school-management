const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkAndCreateHomework() {
  const { data, error } = await supabase
    .from('homework')
    .select('id')
    .limit(1);

  if (error && error.message.includes('does not exist')) {
    console.log('------------------------------------------------------------');
    console.log('TABLE "homework" IS MISSING IN SUPABASE!');
    console.log('Please copy and run the following SQL command in your Supabase SQL Editor:');
    console.log('------------------------------------------------------------');
    console.log(`
CREATE TABLE homework (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  teacher_id uuid,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Allow public/authenticated read" ON homework FOR SELECT USING (true);
CREATE POLICY "Allow authenticated inserts" ON homework FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated updates" ON homework FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated deletes" ON homework FOR DELETE USING (true);
`);
    console.log('------------------------------------------------------------');
  } else if (error) {
    console.log('Supabase check error:', error.message);
  } else {
    console.log('Table "homework" already exists! Total entries:', data.length);
  }
}

checkAndCreateHomework();
