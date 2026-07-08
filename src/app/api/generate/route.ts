import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// Simple in-memory rate limiting (Note: clears on serverless cold starts, but good enough for MVP)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip);
    
    if (limitRecord) {
      if (now > limitRecord.resetTime) {
        // Reset after 24 hours (86400000 ms)
        rateLimitMap.set(ip, { count: 1, resetTime: now + 86400000 });
      } else {
        if (limitRecord.count >= 5) {
          return NextResponse.json({ error: '하루 최대 5개까지만 방을 생성할 수 있습니다.' }, { status: 429 });
        }
        limitRecord.count += 1;
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 86400000 });
    }

    // 2. Parse Data
    const { bandName, platform, targetDays, totalMembers, contactInfo, pin } = await req.json();

    if (!bandName || !platform || !totalMembers || !contactInfo || !pin) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN 번호는 4자리 숫자여야 합니다.' }, { status: 400 });
    }

    const safeName = bandName.trim().replace(/\s+/g, '-').toLowerCase();
    const uniqueId = `${safeName}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Create config payload
    const configPayload = {
      targetDays: Number(targetDays),
      platform,
      totalMembers: Number(totalMembers),
      contactInfo,
      pin
    };

    const configString = `___CONFIG_V2:${JSON.stringify(configPayload)}___`;

    // 3. Save to DB using Admin Key (Bypasses RLS)
    const { error } = await supabaseAdmin.from('attendance_logs').insert([
      { band_id: uniqueId, nickname: configString }
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true, bandId: uniqueId });
  } catch (error: any) {
    console.error('Error generating link:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
