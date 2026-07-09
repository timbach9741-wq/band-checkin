import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// 고객님의 실제 제휴(애드픽/쿠팡) 수익 창출 링크
const COUPANG_URL = 'https://bitl.bz/4aadvo'; // 1. 쿠팡 (가장 높은 전환율)
const ELEVENST_URL = 'https://bitl.bz/04CdRt'; // 2. 11번가
const EMART_URL = 'https://bitl.bz/ZDWuPt'; // 3. SSG

export async function GET() {
  // 기본 설정 (DB 조회가 실패하거나 데이터가 없을 때)
  const defaultMapping = {
    mz: COUPANG_URL,
    balance: COUPANG_URL,
    brain: ELEVENST_URL,
    joke: EMART_URL
  };

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(defaultMapping);
    }

    // 7일 전 시간 계산
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekIso = lastWeek.toISOString();

    // 7일간의 클릭 데이터 가져오기
    const { data, error } = await supabaseAdmin
      .from('game_clicks')
      .select('category')
      .gte('created_at', lastWeekIso);

    if (error || !data || data.length === 0) {
      return NextResponse.json(defaultMapping);
    }

    // 카테고리별 클릭 수 집계
    const counts: Record<string, number> = {
      mz: 0,
      brain: 0,
      balance: 0,
      joke: 0
    };

    data.forEach((row: any) => {
      if (counts[row.category] !== undefined) {
        counts[row.category]++;
      }
    });

    // 정렬 (내림차순)
    const sortedCategories = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    // 상위 1, 2위 -> 쿠팡 / 3위 -> 11번가 / 4위 -> 이마트몰
    const dynamicMapping: Record<string, string> = {};
    dynamicMapping[sortedCategories[0]] = COUPANG_URL;
    dynamicMapping[sortedCategories[1]] = COUPANG_URL;
    dynamicMapping[sortedCategories[2]] = ELEVENST_URL;
    dynamicMapping[sortedCategories[3]] = EMART_URL;

    return NextResponse.json(dynamicMapping);
  } catch (err) {
    console.error('Error fetching game sponsors:', err);
    return NextResponse.json(defaultMapping);
  }
}
