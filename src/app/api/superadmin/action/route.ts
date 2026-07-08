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

    if (action === 'unban') {
      const { bandId } = payload;
      
      const { data: configData } = await supabaseAdmin
        .from('attendance_logs')
        .select('*')
        .eq('band_id', bandId)
        .like('nickname', '___CONFIG_%')
        .single();

      if (!configData) return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });

      if (configData.nickname.startsWith('___CONFIG_V2:')) {
        const jsonStr = configData.nickname.replace('___CONFIG_V2:', '').replace('___', '');
        let fullConfig = JSON.parse(jsonStr);
        delete fullConfig.banned;
        
        const newNickname = `___CONFIG_V2:${JSON.stringify(fullConfig)}___`;
        
        await supabaseAdmin
          .from('attendance_logs')
          .update({ nickname: newNickname })
          .eq('id', configData.id);
          
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: '처리 실패' }, { status: 400 });
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
      // month parameter: 0 = this month, -1 = last month, etc.
      const monthOffset = payload?.monthOffset || 0;

      // 1. Fetch all configs
      const { data: configs } = await supabaseAdmin
        .from('attendance_logs')
        .select('*')
        .like('nickname', '___CONFIG_V2:%');

      if (!configs) return NextResponse.json({ bands: [], summary: { totalBands: 0, totalUsers: 0, totalWinners: 0 } });

      // 2. Calculate date range
      const now = new Date();
      const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
      const startOfMonth = targetMonth.toISOString();
      const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      const { data: checkins } = await supabaseAdmin
        .from('attendance_logs')
        .select('*')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      const checkinsByBand = (checkins || []).filter((log: any) => !log.nickname.startsWith('___'));

      // Build per-user stats: { bandId: { nickname: { days, lastCheckIn } } }
      const userStats: Record<string, Record<string, { days: number, lastCheckIn: string }>> = {};
      const uniqueUsersByBand: Record<string, Set<string>> = {};

      checkinsByBand.forEach((log: any) => {
        if (!uniqueUsersByBand[log.band_id]) uniqueUsersByBand[log.band_id] = new Set();
        uniqueUsersByBand[log.band_id].add(log.nickname);

        if (!userStats[log.band_id]) userStats[log.band_id] = {};
        if (!userStats[log.band_id][log.nickname]) {
          userStats[log.band_id][log.nickname] = { days: 0, lastCheckIn: log.created_at };
        }
        userStats[log.band_id][log.nickname].days++;
        if (new Date(log.created_at) > new Date(userStats[log.band_id][log.nickname].lastCheckIn)) {
          userStats[log.band_id][log.nickname].lastCheckIn = log.created_at;
        }
      });

      let totalWinners = 0;
      let totalUsers = 0;

      const bandDataList = configs.map((conf: any) => {
        const jsonStr = conf.nickname.replace('___CONFIG_V2:', '').replace('___', '');
        let configPayload: any = {};
        try { configPayload = JSON.parse(jsonStr); } catch (e) {}

        const bandId = conf.band_id;
        const totalMembers = configPayload.totalMembers || 1;
        const activeMembers = uniqueUsersByBand[bandId]?.size || 0;
        const participationRate = Math.round((activeMembers / totalMembers) * 100);
        
        // Build sorted user list for this band
        const users: { name: string, days: number, lastCheckIn: string }[] = [];
        const winners: { name: string, days: number }[] = [];
        
        if (userStats[bandId]) {
          for (const [uname, stat] of Object.entries(userStats[bandId])) {
            users.push({ name: uname, days: stat.days, lastCheckIn: stat.lastCheckIn });
            if (stat.days >= 20) {
              winners.push({ name: uname, days: stat.days });
              totalWinners++;
            }
          }
          users.sort((a, b) => b.days - a.days);
        }
        totalUsers += activeMembers;

        return {
          bandId,
          bandName: bandId.split('-').slice(0, -1).join(' '),
          platform: configPayload.platform,
          totalMembers,
          contactInfo: configPayload.contactInfo,
          banned: configPayload.banned === true,
          activeMembers,
          participationRate: isNaN(participationRate) ? 0 : participationRate,
          winners,
          users
        };
      });

      const summary = {
        totalBands: configs.length,
        totalUsers,
        totalWinners,
        month: `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`
      };

      return NextResponse.json({ bands: bandDataList, summary });
    }

    return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in superadmin action:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
