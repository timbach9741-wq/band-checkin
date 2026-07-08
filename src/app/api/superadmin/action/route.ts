import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { action, password, payload } = await req.json();

    const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'tim1234';

    if (password !== SUPERADMIN_PASSWORD) {
      return NextResponse.json({ error: '인증 실패: 잘못된 마스터 암호입니다.' }, { status: 401 });
    }

    if (action === 'verify') {
      return NextResponse.json({ success: true });
    }

    if (action === 'ban') {
      const { bandId } = payload;
      
      // Fetch current config
      const { data: configData, error: configError } = await supabaseAdmin
        .from('attendance_logs')
        .select('*')
        .eq('band_id', bandId)
        .like('nickname', '___CONFIG_%')
        .single();

      if (configError || !configData) {
        return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
      }

      if (configData.nickname.startsWith('___CONFIG_V2:')) {
        const jsonStr = configData.nickname.replace('___CONFIG_V2:', '').replace('___', '');
        let fullConfig = JSON.parse(jsonStr);
        fullConfig.banned = true;
        
        const newNickname = `___CONFIG_V2:${JSON.stringify(fullConfig)}___`;
        
        await supabaseAdmin
          .from('attendance_logs')
          .update({ nickname: newNickname })
          .eq('id', configData.id);
          
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: '구버전 방은 차단할 수 없습니다.' }, { status: 400 });
      }
    }

    if (action === 'reward') {
      const { bandName, nickname } = payload;
      
      // Masking logic: 김철수 -> 김*수
      let masked = nickname;
      if (nickname.length >= 3) {
        masked = nickname[0] + '*'.repeat(nickname.length - 2) + nickname[nickname.length - 1];
      } else if (nickname.length === 2) {
        masked = nickname[0] + '*';
      }
      
      const marqueeText = `🏆 [당첨자] ${bandName} ${masked}님 20일 달성을 축하합니다! 다음 주인공은 당신입니다!`;
      const marqueeStr = `___MARQUEE:${marqueeText}___`;

      // Upsert global settings row
      // We check if it exists
      const { data: globalData } = await supabaseAdmin
        .from('attendance_logs')
        .select('*')
        .eq('band_id', '___GLOBAL_SETTINGS___')
        .single();

      if (globalData) {
        await supabaseAdmin
          .from('attendance_logs')
          .update({ nickname: marqueeStr })
          .eq('id', globalData.id);
      } else {
        await supabaseAdmin
          .from('attendance_logs')
          .insert([{ band_id: '___GLOBAL_SETTINGS___', nickname: marqueeStr }]);
      }

      return NextResponse.json({ success: true, text: marqueeText });
    }

    if (action === 'fetchDashboard') {
      // 1. Fetch all configs
      const { data: configs } = await supabaseAdmin
        .from('attendance_logs')
        .select('*')
        .like('nickname', '___CONFIG_V2:%');

      if (!configs) return NextResponse.json({ bands: [] });

      // 2. Fetch all check-ins for this month to calculate participation and find winners
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { data: checkins } = await supabaseAdmin
        .from('attendance_logs')
        .select('*')
        .gte('created_at', startOfMonth);

      const checkinsByBand = (checkins || []).filter((log: any) => !log.nickname.startsWith('___'));
      
      // Calculate winners per band
      const winnersByBand: Record<string, {name: string, days: number}[]> = {};
      const uniqueUsersByBand: Record<string, Set<string>> = {};

      checkinsByBand.forEach((log: any) => {
        if (!uniqueUsersByBand[log.band_id]) uniqueUsersByBand[log.band_id] = new Set();
        uniqueUsersByBand[log.band_id].add(log.nickname);
        
        // Count for winners
        // Since we need to count total days per user per band, we group them.
      });

      // Recalculate properly
      const userStreaks: Record<string, Record<string, number>> = {};
      checkinsByBand.forEach((log: any) => {
        if (!userStreaks[log.band_id]) userStreaks[log.band_id] = {};
        if (!userStreaks[log.band_id][log.nickname]) userStreaks[log.band_id][log.nickname] = 0;
        userStreaks[log.band_id][log.nickname]++;
      });

      const bandDataList = configs.map((conf: any) => {
        const jsonStr = conf.nickname.replace('___CONFIG_V2:', '').replace('___', '');
        let payload: any = {};
        try { payload = JSON.parse(jsonStr); } catch (e) {}

        const bandId = conf.band_id;
        const totalMembers = payload.totalMembers || 1;
        const activeMembers = uniqueUsersByBand[bandId]?.size || 0;
        const participationRate = Math.round((activeMembers / totalMembers) * 100);
        
        // Find winners
        const winners = [];
        if (userStreaks[bandId]) {
          for (const [uname, days] of Object.entries(userStreaks[bandId])) {
            if (days >= 20) {
              winners.push({ name: uname, days });
            }
          }
        }

        return {
          bandId,
          bandName: bandId.split('-').slice(0, -1).join(' '),
          platform: payload.platform,
          totalMembers,
          contactInfo: payload.contactInfo,
          banned: payload.banned === true,
          activeMembers,
          participationRate: isNaN(participationRate) ? 0 : participationRate,
          winners
        };
      });

      return NextResponse.json({ bands: bandDataList });
    }

    return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in superadmin action:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
