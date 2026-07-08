const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listBands() {
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('band_id, nickname')
    .like('nickname', '___CONFIG%');
    
  if (error) {
    console.error(error);
  } else {
    data.forEach(d => console.log(d.band_id));
  }
}

listBands();
