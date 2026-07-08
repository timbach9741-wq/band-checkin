
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vdohfuohrwyucljcpggp.supabase.co', 'sb_publishable_8fQUZvo3wKRRKi_UI4SuAA_hsZUG7IS');
async function run() {
  const { data, error } = await supabase.from('attendance_logs').delete().in('band_id', ['default', 'Ã»°³Ãµ']);
  console.log(error || 'Success');
}
run();

