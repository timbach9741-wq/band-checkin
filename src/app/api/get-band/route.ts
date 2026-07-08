import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bandId = searchParams.get('band');

    if (!bandId) {
      return NextResponse.json({ error: 'Missing band parameter' }, { status: 400 });
    }

    // 1. Fetch band config
    const { data: configData, error: configError } = await supabaseAdmin
      .from('attendance_logs')
      .select('nickname')
      .eq('band_id', bandId)
      .like('nickname', '___CONFIG_%')
      .single();

    if (configError) {
      return NextResponse.json({ error: 'Band not found' }, { status: 404 });
    }

    // Parse config
    let configPayload = null;
    let isBanned = false;
    
    if (configData.nickname.startsWith('___CONFIG_V2:')) {
      const jsonStr = configData.nickname.replace('___CONFIG_V2:', '').replace('___', '');
      try {
        const fullConfig = JSON.parse(jsonStr);
        // Strip sensitive info for public endpoint
        configPayload = {
          targetDays: fullConfig.targetDays,
          platform: fullConfig.platform,
          totalMembers: fullConfig.totalMembers
        };
        isBanned = fullConfig.banned === true;
      } catch (e) {
        console.error('Failed to parse V2 config');
      }
    } else if (configData.nickname.startsWith('___CONFIG:')) {
      // Legacy format
      const parts = configData.nickname.replace('___CONFIG:', '').replace('___', '').split(':');
      configPayload = {
        targetDays: parseInt(parts[0] || '20', 10),
        platform: parts[1] || 'band',
        totalMembers: 0
      };
    }

    if (isBanned) {
      return NextResponse.json({ error: 'BANNED' }, { status: 403 });
    }

    // 2. Fetch global winners marquee (if any)
    const { data: globalData } = await supabaseAdmin
      .from('attendance_logs')
      .select('nickname')
      .eq('band_id', '___GLOBAL_SETTINGS___')
      .single();

    let globalMarquee = null;
    if (globalData && globalData.nickname) {
      globalMarquee = globalData.nickname.replace('___MARQUEE:', '').replace('___', '');
    }

    return NextResponse.json({ config: configPayload, globalMarquee });
  } catch (error: any) {
    console.error('Error in get-band:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
