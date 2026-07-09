import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { category } = await req.json();

    if (!category || !['mz', 'brain', 'balance', 'joke'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Insert a new log entry using the existing 'attendance_logs' table
    // to avoid requiring the user to create a new SQL table manually.
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('attendance_logs')
        .insert([{ 
          band_id: 'SYSTEM_GAME_STATS', 
          nickname: category 
        }]);
        
      if (error) {
        console.error('Error logging game click:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    } else {
      console.warn('supabaseAdmin not configured. Click not logged to DB.');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in log-game-click API:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
