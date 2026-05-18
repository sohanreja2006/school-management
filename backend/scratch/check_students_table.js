const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkTableData() {
  console.log('Querying students table rows...');
  const { data, error } = await supabase
    .from('students')
    .select('*');

  if (error) {
    console.error('Error fetching students:', error);
  } else {
    console.log(`Success! Found ${data.length} students.`);
    data.forEach((student, idx) => {
      console.log(`\n--- Student #${idx + 1} ---`);
      console.log(`ID:`, student.id);
      console.log(`Name:`, student.name);
      console.log(`Class:`, student.class);
      console.log(`Roll Number:`, student.roll_number);
      console.log(`Parent Name:`, student.parent_name);
      console.log(`Parent Email:`, student.parent_email);
      console.log(`Parent Key:`, student.parent_key);
    });
  }
}

checkTableData();
