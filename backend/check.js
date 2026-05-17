const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
async function r() {
  const {data: u} = await s.from('users').select('email,school_id');
  console.log('USERS:', JSON.stringify(u));
  const {data: st} = await s.from('students').select('name,school_id');
  console.log('STUDENTS:', JSON.stringify(st));
}
r();
