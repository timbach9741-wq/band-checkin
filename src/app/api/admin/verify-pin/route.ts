import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { bandId, pin } = await req.json();

    if (!bandId || !pin) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // Fetch band config
    const { data: configData, error: configError } = await supabaseAdmin
      .from('attendance_logs')
      .select('nickname')
      .eq('band_id', bandId)
      .like('nickname', '___CONFIG_%')
      .single();

    if (configError || !configData) {
      return NextResponse.json({ error: '존재하지 않는 방입니다.' }, { status: 404 });
    }

    let isValid = false;
    let bandName = null;
    let totalMembers = 0;
    
    if (configData.nickname.startsWith('___CONFIG_V2:')) {
      const jsonStr = configData.nickname.replace('___CONFIG_V2:', '').replace('___', '');
      try {
        const fullConfig = JSON.parse(jsonStr);
        if (fullConfig.pin === pin) {
          isValid = true;
          bandName = fullConfig.bandName;
          totalMembers = parseInt(fullConfig.totalMembers) || 0;
        }
      } catch (e) {
        console.error('Failed to parse V2 config');
      }
    } else if (configData.nickname.startsWith('___CONFIG:')) {
      // Legacy format (no PIN, so we allow access if pin='1234' as fallback, or just allow)
      if (pin === '1234') {
        isValid = true;
      }
    }

    if (isValid) {
      return NextResponse.json({ 
        success: true, 
        bandName: bandName || bandId.split('-').slice(0, -1).join(' '),
        totalMembers 
      });
    } else {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Error in verify-pin:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
