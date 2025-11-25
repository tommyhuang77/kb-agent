import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://grolfjktzmibeupkqrll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2xmamt0em1pYmV1cGtxcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMTMzMjYsImV4cCI6MjA3MDc4OTMyNn0.4gbWx4wGo0JybfQcvjfNQVbiAGU6DifaMsLU5lG36uU';

async function test() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created');
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .limit(1);
    
    console.log('Data:', data);
    console.log('Error:', error);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
