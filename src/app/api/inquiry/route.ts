import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (max 10 inquiries per day per IP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip);
    
    if (limitRecord) {
      if (now > limitRecord.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + 86400000 });
      } else {
        if (limitRecord.count >= 5) {
          return NextResponse.json({ error: '하루 최대 문의 횟수를 초과했습니다.' }, { status: 429 });
        }
        limitRecord.count += 1;
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 86400000 });
    }

    // 2. Parse Data
    const { type, bandName, contact } = await req.json();

    if (!type || !bandName || !contact) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    if (bandName.length > 50 || contact.length > 50 || type.length > 50) {
      return NextResponse.json({ error: '입력값이 너무 깁니다. (최대 50자)' }, { status: 400 });
    }

    // Basic sanitization to prevent XSS in DB
    const sanitize = (str: string) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 3. Create config payload
    const inquiryPayload = {
      type: sanitize(type),
      bandName: sanitize(bandName.trim()),
      contact: sanitize(contact.trim()),
      timestamp: new Date().toISOString(),
      resolved: false // Superadmin can mark this as true later if we add that feature
    };

    const configString = `___INQUIRY:${JSON.stringify(inquiryPayload)}___`;

    // 4. Save to DB using Admin Key (Bypasses RLS)
    const { error } = await supabaseAdmin.from('attendance_logs').insert([
      { band_id: 'SYSTEM_INQUIRY', nickname: configString }
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving inquiry:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
