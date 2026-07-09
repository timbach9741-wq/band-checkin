import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { category } = await req.json();

    if (!category || !['mz', 'brain', 'balance', 'joke'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Insert a new log entry
    // NOTE: This assumes the 'game_clicks' table exists in Supabase
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('game_clicks')
        .insert([{ category }]);
        
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
