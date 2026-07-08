const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteOldBands() {
  const prefixes = [
    'daily-reading-club',
    'morning-running-crew',
    'english-study-group',
    'diet-challenge-team'
  ];

  for (const prefix of prefixes) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .delete()
      .like('band_id', `${prefix}%`);
      
    if (error) {
      console.error(`Error deleting ${prefix}:`, error);
    } else {
      console.log(`Deleted entries for ${prefix}`);
    }
  }
}

deleteOldBands();
