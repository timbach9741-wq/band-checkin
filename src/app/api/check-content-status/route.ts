import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const DEPLOYMENT_DATE = new Date('2026-07-09T00:00:00Z');
    const now = new Date();
    
    // 330일 (약 11개월)이 지났는지 확인
    const diffTime = Math.abs(now.getTime() - DEPLOYMENT_DATE.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays >= 330) {
      // 이미 알림을 보냈는지 확인 (SYSTEM_ALERT_SENT 로그 확인)
      if (supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('attendance_logs')
          .select('id')
          .eq('band_id', 'SYSTEM_ALERT_SENT')
          .limit(1);
          
        // 알림을 보낸 적이 없다면 발송
        if (!data || data.length === 0) {
          const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8803944886:AAGkte1GvodpK8Zk3EEiJsn5jZfmomgLiG8';
          const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '5324471356';
          
          const message = `🚨 [커뮤니티 부스터 긴급 알림]\n\n탑재된 퀴즈가 배포 후 11개월이 경과하여 곧 반복 노출될 수 있습니다!\nAI 개발자(Antigravity)를 다시 불러 문제를 넉넉하게 리필해 주세요!`;
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
          });
          
          // 알림 발송 기록 남기기 (중복 발송 방지)
          await supabaseAdmin.from('attendance_logs').insert([
            { band_id: 'SYSTEM_ALERT_SENT', nickname: `Sent at ${now.toISOString()}` }
          ]);
          
          return NextResponse.json({ status: 'alert_sent' });
        }
      }
    }
    
    return NextResponse.json({ status: 'ok', daysElapsed: diffDays });
  } catch (error) {
    console.error('Error checking content status:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
