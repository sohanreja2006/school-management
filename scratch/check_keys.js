const supabase = require('./backend/config/supabase');

async function checkStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('name, parent_email, parent_key');
  
  if (error) {
    console.error('Error fetching students:', error);
    return;
  }
  
  console.log('--- STUDENT LIST ---');
  data.forEach(s => {
    console.log(`Student: ${s.name} | Email: ${s.parent_email} | Key: ${s.parent_key}`);
  });
}

checkStudents();
