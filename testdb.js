import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log('Testing connection to:', process.env.SUPABASE_URL);

const { data, error } = await sb.from('students').select('id').limit(1);

if (error) {
  console.error('DB ERROR:', error.message);
  console.error('Code:', error.code);
} else {
  console.log('DB CONNECTED successfully — students table is reachable');
}
