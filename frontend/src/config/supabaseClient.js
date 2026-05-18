import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lmwinhzwaanzdslfnuym.supabase.co';
if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`;
}
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtd2luaHp3YWFuemRzbGZudXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDM4MjIsImV4cCI6MjA5Mzg3OTgyMn0.4KZ8Dk59-lyO88WbnZADdWh0tW1L-NDmToWXQ4Ynm-k'; // This should be the anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
