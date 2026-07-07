'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [newPlatform, setNewPlatform] = useState<'band' | 'daangn' | 'kakao'>('band');
  const [newBandName, setNewBandName] = useState('');
  const [newTargetDays, setNewTargetDays] = useState<number>(20);
  const [generatedLinks, setGeneratedLinks] = useState<{checkIn: string, admin: string} | null>(null);
  const [origin, setOrigin] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleGenerateLink = async () => {
    // 보안 1: 도배/연속 클릭 방지
    if (isGenerating) return;
    
    // 보안 2: 빈 값 체크
    if (!newBandName.trim()) {
      alert('모임 이름을 입력해주세요!');
      return;
    }

    // 보안 3: XSS 방어 및 유효성 검사 (한글, 영문, 숫자, 하이픈만 허용)
    const isValid = /^[a-zA-Z0-9가-힣_-]+$/.test(newBandName.trim());
    if (!isValid) {
      alert('모임 이름은 한글, 영문, 숫자, 하이픈(-)만 사용할 수 있습니다. 특수문자는 빼주세요!');
      return;
    }

    setIsGenerating(true);
    
    try {
      // 띄어쓰기를 하이픈으로 변경하고 소문자로 통일하여 안전한 ID 생성
      const safeName = newBandName.trim().replace(/\s+/g, '-').toLowerCase();
      
      // DB에 목표 일수 및 플랫폼 마커 설정 삽입
      const { error } = await supabase.from('attendance_logs').insert([
        { band_id: safeName, nickname: `___CONFIG:${newTargetDays}:${newPlatform}___` }
      ]);

      if (error) throw error;
      
      setGeneratedLinks({
        checkIn: `${origin}/check-in?band=${safeName}`,
        admin: `${origin}/admin?band=${safeName}&pw=1234`
      });
    } catch (err) {
      console.error(err);
      alert('링크 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} 복사되었습니다!\n\n${text}`);
    }).catch(() => {
      alert('복사에 실패했습니다. 직접 드래그해서 복사해주세요.');
    });
  };

  const platformLabels: Record<string, string> = {
    'band': '네이버 밴드',
    'daangn': '당근마켓 동네생활',
    'kakao': '카카오톡 오픈채팅'
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      {/* 헤더 네비게이션 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
          <span>✨</span> 커뮤니티 부스터
        </div>
        <a href="mailto:contact@example.com" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          제휴 문의
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        
        {/* 마케팅 카피 섹션 */}
        <div className="text-center space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-black mb-4 shadow-sm">
            모든 커뮤니티 방장님들을 위한 희소식 📣
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-gray-900">
            유령 회원도 말하게 만드는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-sm">무료 출석체크 이벤트</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
            방장님 사비 지출 0원! 10초 만에 출석 이벤트를 만들고 방을 활성화하세요.<br className="hidden md:block" />
            <span className="bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded font-bold mx-1">비용 100% 전액 무료</span> 
            (경품 비용은 저희 스폰서 광고 수익으로 충당됩니다)
          </p>
        </div>

        {/* 링크 생성기 (핵심 기능) */}
        <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10 relative overflow-hidden z-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-gray-800">
            👇 지금 바로 우리 모임 링크 만들기
          </h2>

          <div className="flex flex-col gap-5 max-w-2xl mx-auto">
            {/* Step 1: 플랫폼 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">1. 어디서 운영 중이신가요?</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(platformLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setNewPlatform(key as any)}
                    className={`py-3 px-2 rounded-xl font-bold text-sm md:text-base border-2 transition-all ${
                      newPlatform === key 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {key === 'band' ? '🟢 ' : key === 'daangn' ? '🥕 ' : '🟡 '}{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: 모임 이름 입력 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">2. 모임(방) 이름을 적어주세요</label>
              <input 
                type="text" 
                value={newBandName}
                onChange={(e) => setNewBandName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateLink()}
                placeholder="예: 강남구 테니스 모임, 서초맘카페" 
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-5 py-4 text-gray-900 text-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Step 3: 목표 일수 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">3. 경품 응모 목표 일수 (추천: 20일)</label>
              <select 
                value={newTargetDays}
                onChange={(e) => setNewTargetDays(Number(e.target.value))}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-5 py-4 text-gray-900 text-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
              >
                <option value={10}>🎯 한 달 10일 출석 시 응모</option>
                <option value={15}>🎯 한 달 15일 출석 시 응모</option>
                <option value={20}>🎯 한 달 20일 출석 시 응모 (가장 인기)</option>
                <option value={30}>🎯 한 달 30일 출석 시 응모</option>
              </select>
            </div>

            {/* 생성 버튼 */}
            <button 
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className={`w-full mt-4 text-white font-black py-5 rounded-2xl text-xl shadow-lg transition-all transform hover:-translate-y-1 ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed scale-100 translate-y-0' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30 hover:shadow-blue-500/50'
              }`}
            >
              {isGenerating ? '링크를 생성하는 중...' : '🎉 100% 무료 이벤트 링크 발급받기'}
            </button>
          </div>

          {/* 결과창 */}
          {generatedLinks && (
            <div className="mt-10 bg-gray-50 p-6 md:p-8 rounded-2xl border-2 border-blue-100 shadow-inner animate-in zoom-in duration-300">
              <div className="text-center mb-6">
                <span className="text-4xl">🎊</span>
                <h3 className="text-2xl font-black text-gray-900 mt-2">링크가 성공적으로 생성되었습니다!</h3>
                <p className="text-gray-500 font-medium mt-1">아래 링크를 복사해서 공지사항에 올려보세요.</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                {/* 회원용 링크 */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-blue-600 font-bold mb-2 flex items-center gap-2">
                    ✅ 유저 참여용 출석체크 링크 <span className="text-gray-400 font-medium text-sm">(공지사항 등록용)</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" readOnly value={generatedLinks.checkIn} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-blue-100" />
                    <button onClick={() => copyToClipboard(generatedLinks.checkIn, '출석체크 링크가')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm">복사하기</button>
                  </div>
                </div>
                
                {/* 방장용 링크 */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <p className="text-indigo-600 font-bold mb-2 flex items-center gap-2 ml-2">
                    👑 방장님 전용 관리자 링크 <span className="text-red-400 font-bold text-sm bg-red-50 px-2 py-0.5 rounded">(초기비밀번호: 1234)</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 ml-2">
                    <input type="text" readOnly value={generatedLinks.admin} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-indigo-100" />
                    <button onClick={() => copyToClipboard(generatedLinks.admin, '관리자 링크가')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm">복사하기</button>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-3 ml-2">
                    * 이 관리자 링크에서 언제든지 우리 모임의 출석 통계와 달성자 명단을 엑셀로 다운로드할 수 있습니다. 방장님만 몰래 보관하세요!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 신뢰도 하단 정보 */}
        <div className="mt-16 text-center text-gray-400 text-sm font-medium">
          <p>이 서비스는 모임 활성화를 돕기 위해 100% 무료로 제공됩니다.</p>
          <p className="mt-1">© 2026 Community Booster. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
