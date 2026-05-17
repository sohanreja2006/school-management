const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkTable() {
  console.log('Checking students table structure...');
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! Columns in students table:', Object.keys(data[0] || {}));
    if (data.length > 0 && !data[0].hasOwnProperty('photo')) {
      console.log('MISSING COLUMN: photo');
    }
  }
}

checkTable();
