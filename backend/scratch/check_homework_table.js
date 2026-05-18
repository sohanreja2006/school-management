const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkHomeworkTable() {
  console.log('Checking homework table structure...');
  const { data, error } = await supabase
    .from('homework')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching homework table:', error);
  } else {
    console.log('Success! Homework table exists.');
    console.log('Columns in homework table:', data.length > 0 ? Object.keys(data[0]) : 'No rows found to determine columns, querying schema...');
    
    // Let's try inserting a dummy to test columns if it's empty
    console.log('Detailed data row:', data[0] || 'Empty table');
  }
}

checkHomeworkTable();
