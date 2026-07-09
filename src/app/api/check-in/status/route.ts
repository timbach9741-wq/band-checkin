import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { bandId, nickname, statusIndex } = await req.json();

    if (!bandId || !nickname || typeof statusIndex !== 'number') {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const safeNickname = nickname.trim();

    if (safeNickname.length > 10) {
      return NextResponse.json({ error: '닉네임은 최대 10글자까지만 가능합니다.' }, { status: 400 });
    }

    // Insert a status record prefixed with ___STATUS:
    const statusRecord = `___STATUS:${safeNickname}:${statusIndex}`;

    const { error: insertError } = await supabaseAdmin.from('attendance_logs').insert([
      { band_id: bandId, nickname: statusRecord }
    ]);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in status update:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
