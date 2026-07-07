'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [newPlatform, setNewPlatform] = useState<'band' | 'daangn' | 'kakao' | 'personal'>('band');
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
    if (isGenerating) return;
    
    if (!newBandName.trim()) {
      alert('모임(목표) 이름을 입력해주세요!');
      return;
    }

    const isValid = /^[a-zA-Z0-9가-힣_-\s]+$/.test(newBandName.trim());
    if (!isValid) {
      alert('이름은 한글, 영문, 숫자, 띄어쓰기, 하이픈(-)만 사용할 수 있습니다. 특수문자는 빼주세요!');
      return;
    }

    setIsGenerating(true);
    
    try {
      const safeName = newBandName.trim().replace(/\s+/g, '-').toLowerCase();
      
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
    'kakao': '카카오톡 오픈채팅',
    'personal': '소모임 / 개인 목표'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200">
      {/* 헤더 네비게이션 */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
          <span>✨</span> 커뮤니티 부스터
        </div>
        <a 
          href="mailto:timbach@naver.com" 
          onClick={() => alert('timbach@naver.com 으로 문의하세요!')}
          className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          제휴 문의
        </a>
      </header>

      <main className="flex flex-col items-center">
        
        {/* 1. 메인 히어로 섹션 (Hero Section) */}
        <section className="w-full relative overflow-hidden bg-white pt-20 pb-16 px-4 md:pt-28 md:pb-24 border-b border-slate-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full text-sm font-black mb-2 shadow-sm border border-indigo-100/50">
              가족 단톡방, 스터디, 다이어트 챌린지까지 누구나 📣
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-slate-900 break-keep">
              목표 달성률 300% 상승!<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">습관 만들기 출석체크 이벤트</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto mt-6 leading-relaxed break-keep">
              사비 지출 0원! 10초 만에 이벤트를 만들고 다함께 목표를 달성하세요.<br className="hidden md:block" />
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold mx-1 border border-yellow-200">비용 전액 무료</span> 
              경품 비용은 저희 스폰서 광고 수익으로 전액 충당됩니다.
            </p>
          </div>
        </section>

        {/* 2. 링크 생성기 (핵심 기능) */}
        <section className="w-full px-4 -mt-10 relative z-20">
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-slate-800 flex items-center justify-center gap-2">
              👇 지금 바로 10초 만에 링크 만들기
            </h2>

            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
              {/* Step 1: 플랫폼 선택 */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                  어디서 운영 중이신가요?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(platformLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setNewPlatform(key as any)}
                      className={`py-4 px-2 rounded-2xl font-bold text-sm md:text-base border-2 transition-all duration-200 ${
                        newPlatform === key 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md transform scale-[1.02]' 
                          : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="mb-1 block text-lg">{key === 'band' ? '🟢' : key === 'daangn' ? '🥕' : key === 'kakao' ? '🟡' : '👤'}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: 모임 이름 입력 */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                  모임(목표) 이름을 적어주세요
                </label>
                <input 
                  type="text" 
                  value={newBandName}
                  onChange={(e) => setNewBandName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateLink()}
                  placeholder="예: 김가네 가족방, 미라클모닝 스터디, 나홀로 다이어트" 
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium placeholder-slate-400"
                />
              </div>

              {/* Step 3: 목표 일수 */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span> 
                  경품 응모 목표 일수 (자동 세팅)
                </label>
                <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-lg font-bold flex items-center gap-2">
                  🎯 한 달 20일 출석 시 경품 응모
                </div>
                <p className="text-xs text-slate-500 ml-2 font-medium">※ 누구나 포기하지 않고 참여할 수 있는 최적의 일수인 20일로 자동 세팅됩니다.</p>
              </div>

              {/* 생성 버튼 */}
              <button 
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className={`w-full mt-4 text-white font-black py-5 rounded-2xl text-xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  isGenerating 
                    ? 'bg-slate-400 cursor-not-allowed scale-100 translate-y-0' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25 hover:shadow-indigo-500/40'
                }`}
              >
                {isGenerating ? '링크를 생성하는 중...' : '🎉 100% 무료 챌린지 링크 발급받기'}
              </button>
            </div>

            {/* 결과창 */}
            {generatedLinks && (
              <div className="mt-10 bg-indigo-50/50 p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-inner animate-in zoom-in duration-500">
                <div className="text-center mb-8">
                  <span className="text-5xl inline-block animate-bounce">🎊</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-4">링크 발급이 완료되었습니다!</h3>
                  <p className="text-slate-600 font-medium mt-2">아래 두 개의 링크를 꼭 복사해서 보관하세요.</p>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* 회원용 링크 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-indigo-600 font-bold mb-3 flex items-center gap-2">
                      ✅ 참여용 출석체크 링크 <span className="text-slate-400 font-medium text-sm">(유저 공유용)</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input type="text" readOnly value={generatedLinks.checkIn} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                      <button onClick={() => copyToClipboard(generatedLinks.checkIn, '출석체크 링크가')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap shadow-sm">복사하기</button>
                    </div>
                  </div>
                  
                  {/* 개설자용 링크 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500"></div>
                    <p className="text-pink-600 font-bold mb-3 flex items-center gap-2 ml-2">
                      👑 개설자 전용 관리자 링크 <span className="text-red-500 font-bold text-sm bg-red-50 px-2 py-0.5 rounded border border-red-100">(초기비밀번호: 1234)</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 ml-2">
                      <input type="text" readOnly value={generatedLinks.admin} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-pink-100 transition-all" />
                      <button onClick={() => copyToClipboard(generatedLinks.admin, '관리자 링크가')} className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap shadow-sm">복사하기</button>
                    </div>
                    <div className="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-100 ml-2">
                      <p className="text-xs text-pink-700 font-bold flex items-start gap-1 break-keep">
                        <span className="text-base leading-none">💡</span> 
                        이 링크로 들어가시면 매월 달성자 명단을 엑셀로 뽑을 수 있습니다. 유출되지 않게 개설자 본인만 보관하세요!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3. 활용 가이드 (How it Works) */}
        <section className="w-full bg-slate-50 py-24 px-4 border-b border-slate-200 mt-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-16 text-slate-800">
              이렇게 활용해 보세요! 📋
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-sm">1</div>
                <h3 className="text-xl font-bold text-slate-800 mt-4 mb-3">10초 만에 링크 발급</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed break-keep">
                  위 폼에 목표나 모임 이름을 적고 버튼을 눌러 나만의 고유한 출석체크 링크를 발급받으세요.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-sm">2</div>
                <h3 className="text-xl font-bold text-slate-800 mt-4 mb-3">단톡방 공유 및 저장</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed break-keep">
                  발급받은 '참여용 링크'를 단톡방 공지에 올리거나 나만의 북마크에 저장해 매일매일 도전하세요!
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-sm">3</div>
                <h3 className="text-xl font-bold text-slate-800 mt-4 mb-3">달성자 확인 및 보상</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed break-keep">
                  월말에 '관리자 링크'에 접속해 목표를 달성한 명단을 뽑고 우리끼리 보상을 나누면 끝!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 유저 제공 혜택 (Features) */}
        <section className="w-full bg-white py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 break-keep">
                매일매일 접속하게 만드는 마법 같은 기능들 ✨
              </h2>
              <p className="text-lg text-slate-500 font-medium break-keep">출석체크만 있는 게 아닙니다. 재미있는 요소들로 가득합니다!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-black text-slate-800 mb-3">스마트 자동 랭킹 집계</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium break-keep">
                  누가누가 가장 열심히 활동할까요? 유저들이 출석할 때마다 실시간으로 누적 출석일과 오늘의 랭킹이 표시되어 경쟁심을 유발합니다.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">🔮</div>
                <h3 className="text-xl font-black text-indigo-900 mb-3">매일매일 무료 운세</h3>
                <p className="text-indigo-700/80 text-sm leading-relaxed font-medium break-keep">
                  "오늘의 내 행운의 컬러는?" 아침마다 유저들이 스스로 접속해서 무료 운세를 확인하게 만드는 강력한 미끼 기능이 탑재되어 있습니다.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-3xl p-8 border border-orange-100 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">🎰</div>
                <h3 className="text-xl font-black text-orange-900 mb-3">로또 번호 자동 추첨기</h3>
                <p className="text-orange-700/80 text-sm leading-relaxed font-medium break-keep">
                  실제 당첨 알고리즘을 분석한 현실적인 로또 번호 생성기! 쫄깃한 룰렛 애니메이션으로 유저들의 체류 시간을 극대화합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="w-full bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 font-medium text-sm">
            <p>Community Booster - 습관 형성과 모임 활성화를 위한 최고의 선택</p>
            <p className="mt-2 text-slate-500 break-keep">본 서비스는 누구나 100% 무료로 사용할 수 있으며, 경품 비용 등은 스폰서 제휴 마케팅 수수료로 충당됩니다.</p>
            <p className="mt-6 text-slate-600">© 2026 Community Booster. All rights reserved.</p>
          </div>
        </footer>

      </main>
    </div>
  );
}
