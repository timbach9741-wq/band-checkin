import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// In-memory rate limiting for check-ins (IP + Band ID)
const checkInRateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    const { bandId, nickname } = await req.json();

    if (!bandId || !nickname) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const safeNickname = nickname.trim();

    if (safeNickname.length > 10) {
      return NextResponse.json({ error: '닉네임은 최대 10글자까지만 가능합니다.' }, { status: 400 });
    }

    if (safeNickname.startsWith('___CONFIG')) {
      return NextResponse.json({ error: '잘못된 닉네임 형식입니다.' }, { status: 400 });
    }

    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${ip}_${bandId}`;
    const now = Date.now();
    const limitRecord = checkInRateLimitMap.get(rateLimitKey);
    
    if (limitRecord) {
      if (now > limitRecord.resetTime) {
        // Reset after 24 hours
        checkInRateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + 86400000 });
      } else {
        if (limitRecord.count >= 10) {
          return NextResponse.json({ error: '비정상적인 접근이 감지되었습니다. (Rate Limit)' }, { status: 429 });
        }
        limitRecord.count += 1;
      }
    } else {
      checkInRateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + 86400000 });
    }

    // 2. Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingChecks, error: checkError } = await supabaseAdmin
      .from('attendance_logs')
      .select('id')
      .eq('band_id', bandId)
      .eq('nickname', safeNickname)
      .gte('created_at', today.toISOString());

    if (checkError) throw checkError;

    if (existingChecks && existingChecks.length > 0) {
      return NextResponse.json({ error: '오늘은 이미 출석하셨습니다!' }, { status: 400 });
    }

    // 3. Save to DB using Admin Key (Bypasses RLS)
    const { error: insertError } = await supabaseAdmin.from('attendance_logs').insert([
      { band_id: bandId, nickname: safeNickname }
    ]);

    if (insertError) throw insertError;

    // 4. Check total days for this user to trigger fireworks
    const { count, error: countError } = await supabaseAdmin
      .from('attendance_logs')
      .select('id', { count: 'exact', head: true })
      .eq('band_id', bandId)
      .eq('nickname', safeNickname);

    if (countError) throw countError;

    const totalDays = count || 1;
    const isWinner = totalDays === 20;

    return NextResponse.json({ success: true, totalDays, isWinner });
  } catch (error: any) {
    console.error('Error in check-in:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
