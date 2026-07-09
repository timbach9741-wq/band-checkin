'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { dailyContents, DailyContent } from '../../data/dailyContents';

const MOOD_OPTIONS = [
  { id: 1, emoji: '☕', text: '나른한 오후, 커피 한 잔', short: '커피 한 잔' },
  { id: 2, emoji: '🍚', text: '점심 같이 먹을 사람', short: '점심 번개' },
  { id: 3, emoji: '🍻', text: '낮술 한 잔', short: '낮술' },
  { id: 4, emoji: '🍷', text: '앗싸 퇴근이다! 술 한 잔 할 사람', short: '퇴근술' }
];

function CheckInContent() {
  const searchParams = useSearchParams();
  const bandId = searchParams.get('band') || 'default';
  const [bandTitle, setBandTitle] = useState('오늘의 출석체크');
  
  const [nickname, setNickname] = useState('');
  const [attendeeMoods, setAttendeeMoods] = useState<Record<string, number>>({});
  const [myMood, setMyMood] = useState<number | null>(null);
  const [isUpdatingMood, setIsUpdatingMood] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [streakDays, setStreakDays] = useState(1);
  const [targetDays, setTargetDays] = useState(20);
  const [platform, setPlatform] = useState<'band'|'daangn'|'kakao'>('band');
  const [globalMarquee, setGlobalMarquee] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  // DB 연동된 실제 출석자 데이터 상태
  const [attendees, setAttendees] = useState<any[]>([]);

  // 고객님의 실제 제휴(애드픽/쿠팡) 수익 창출 링크
  const COUPANG_URL = 'https://bitl.bz/4aadvo'; // 1. 쿠팡 (출석체크용)
  const ELEVENST_URL = 'https://bitl.bz/04CdRt'; // 2. 11번가 (운세용)
  const EMART_URL = 'https://bitl.bz/ZDWuPt'; // 3. SSG (로또용)

  // 매일 즐길거리 (Daily Entertainment) 상태
  const [selectedCategory, setSelectedCategory] = useState<'mz' | 'brain' | 'balance' | 'joke' | null>(null);
  const [activeContent, setActiveContent] = useState<DailyContent | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sponsorMapping, setSponsorMapping] = useState<Record<string, string> | null>(null);

  // 컴포넌트 마운트 시 동적 스폰서 맵핑 데이터 로드
  useEffect(() => {
    fetch('/api/game-sponsors')
      .then(res => res.json())
      .then(data => setSponsorMapping(data))
      .catch(err => console.error('Failed to load sponsor mapping:', err));
  }, []);

  const handleSelectCategory = (category: 'mz' | 'brain' | 'balance' | 'joke') => {
    const categoryContents = dailyContents.filter(c => c.category === category);
    const randomContent = categoryContents[Math.floor(Math.random() * categoryContents.length)];
    setActiveContent(randomContent);
    setSelectedCategory(category);
    setIsRevealed(false);
  };

  const handleRevealAnswer = () => {
    if (!selectedCategory) return;
    
    // 통계 기반 동적 스폰서 URL 사용 (기본값 설정)
    let sponsorUrl = COUPANG_URL;
    if (sponsorMapping && sponsorMapping[selectedCategory]) {
      sponsorUrl = sponsorMapping[selectedCategory];
    } else {
      // API 응답 전이거나 실패 시 기본 로직 
      if (selectedCategory === 'mz' || selectedCategory === 'balance') sponsorUrl = COUPANG_URL;
      else if (selectedCategory === 'brain') sponsorUrl = ELEVENST_URL;
      else if (selectedCategory === 'joke') sponsorUrl = EMART_URL;
    }
    
    // 새 창으로 스폰서 링크 팝업 (쿠키 심기)
    window.open(sponsorUrl, '_blank');
    
    // 통계 로깅을 위한 비동기 API 호출 (결과를 기다리지 않음)
    fetch('/api/log-game-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory })
    }).catch(err => console.error('Failed to log click:', err));
    
    // 현재 창에서는 정답 공개
    setIsRevealed(true);
  };

  // 페이지가 로드될 때 '오늘의 출석 멤버' 데이터와 밴드 설정값을 불러옵니다.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `✅ ${bandTitle} 출석체크`;
    }
  }, [bandTitle]);

  useEffect(() => {
    async function fetchTodayAttendees() {
      // 1. 목표 일수 및 플랫폼 설정, 글로벌 전광판 불러오기 (API)
      try {
        const res = await fetch(`/api/get-band?band=${bandId}`);
        const data = await res.json();
        if (!res.ok) {
          if (data.error === 'BANNED') setIsBanned(true);
        } else {
          if (data.config) {
            setTargetDays(data.config.targetDays || 20);
            setPlatform(data.config.platform || 'band');
            if (data.config.bandName) {
              setBandTitle(data.config.bandName);
            } else {
              setBandTitle(bandId.split('-').slice(0, -1).join(' '));
            }
          }
          if (data.globalMarquee) setGlobalMarquee(data.globalMarquee);
        }
      } catch (e) {
        console.error('Failed to fetch band info', e);
      }

      // 2. 이달의 출석 데이터 불러오기 (오늘 출석자 및 연속 출석 계산용)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('band_id', bandId)
        .gte('created_at', startOfMonth);
        
      if (data) {
        // 필터링: 환경설정 및 마커 제외
        const validLogs = data.filter((log: any) => !log.nickname.startsWith('___TARGET:') && !log.nickname.startsWith('___CONFIG:') && !log.nickname.startsWith('___MARQUEE:') && !log.nickname.startsWith('___STATUS:'));
        
        // 상태 추출 (오늘 등록된 가장 최신 상태만 유지)
        const statusLogs = data.filter((log: any) => log.nickname.startsWith('___STATUS:') && new Date(log.created_at).getTime() >= todayStart.getTime());
        statusLogs.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const moodMap: Record<string, number> = {};
        statusLogs.forEach((log: any) => {
          const parts = log.nickname.split(':');
          if (parts.length === 3) {
            moodMap[parts[1]] = parseInt(parts[2], 10);
          }
        });
        setAttendeeMoods(moodMap);
        
        // 닉네임별 이번 달 총 출석 횟수 계산
        const streakMap = new Map<string, number>();
        validLogs.forEach((log: any) => {
          streakMap.set(log.nickname, (streakMap.get(log.nickname) || 0) + 1);
        });

        // 오늘 출석자만 필터링 후 정렬
        const todayLogs = validLogs.filter((log: any) => new Date(log.created_at).getTime() >= todayStart.getTime());
        todayLogs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // myMood 및 hasCheckedIn 초기화 (로컬 스토리지에 닉네임이 있다면)
        const savedNickname = localStorage.getItem('checkin_nickname');
        if (savedNickname) {
          setNickname(savedNickname);
          if (moodMap[savedNickname]) {
            setMyMood(moodMap[savedNickname]);
          }
          if (todayLogs.some((log: any) => log.nickname === savedNickname)) {
            setHasCheckedIn(true);
            setStreakDays(streakMap.get(savedNickname) || 1);
          }
        }
        const formatted = todayLogs.map((log: any) => {
          const date = new Date(log.created_at);
          return {
            id: log.id,
            name: log.nickname,
            time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
            streak: streakMap.get(log.nickname) || 1
          };
        });
        setAttendees(formatted);
      }
    }
    fetchTodayAttendees();
  }, [bandId]);

  const handleUpdateMood = async (moodId: number) => {
    const targetNickname = nickname || localStorage.getItem('checkin_nickname');
    if (!targetNickname) return;
    
    // 낙관적 업데이트 (Optimistic UI Update): 서버 응답을 기다리지 않고 화면부터 즉시 변경
    const previousMood = myMood;
    const previousAttendeeMoods = { ...attendeeMoods };
    
    setMyMood(moodId);
    setAttendeeMoods(prev => ({ ...prev, [targetNickname]: moodId }));
    setIsUpdatingMood(true);

    try {
      const res = await fetch('/api/check-in/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bandId, nickname: targetNickname, statusIndex: moodId })
      });
      if (!res.ok) throw new Error('상태 업데이트 실패');
    } catch (e) {
      // 실패 시 원래 상태로 복구
      setMyMood(previousMood);
      setAttendeeMoods(previousAttendeeMoods);
      alert('상태 업데이트에 실패했습니다.');
    } finally {
      setIsUpdatingMood(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsSubmitting(true);

    // 1. 화이트햇 방식: 쿠팡 새 창 띄우기
    window.open(COUPANG_URL, '_blank');

    // 2. API 서버를 통해 출석 및 방어 로직 수행
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bandId, nickname })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === '오늘은 이미 출석하셨습니다!') {
          setHasCheckedIn(true);
          const existing = attendees.find(a => a.name === nickname);
          if (existing) setStreakDays(existing.streak);
          alert('이미 출석을 완료하셨습니다. 아래에서 기분을 선택해주세요!');
          setIsSubmitting(false);
          localStorage.setItem('checkin_nickname', nickname);
          return;
        }
        throw new Error(data.error);
      }

      localStorage.setItem('checkin_nickname', nickname);
      setStreakDays(data.totalDays);
      if (data.isWinner) {
        setShowConfetti(true);
      }
      
      const timeString = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
      setAttendees(prev => [{ id: Date.now(), name: nickname, time: timeString, streak: data.totalDays }, ...prev]);
      
      setIsSubmitting(false);
      setHasCheckedIn(true);
    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  if (isBanned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-900 to-slate-900 font-sans pb-12 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-6">🛑</span>
        <h1 className="text-3xl font-black text-red-200 mb-4">참여율 저조로 이벤트가 중단되었습니다.</h1>
        <p className="text-lg text-rose-200/70 bg-black/20 p-4 rounded-2xl border border-red-500/30">해당 모임은 참여율 미달 등의 사유로 제휴 이벤트 혜택이 영구 중단되었습니다.<br/>자세한 사항은 방장에게 문의하세요.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 font-sans pb-12 text-white selection:bg-pink-500 selection:text-white">
      {/* 20일 달성 폭죽 효과 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400 drop-shadow-lg">이벤트 자동 응모 완료!</h2>
            <p className="text-white mt-4 font-bold text-xl">20일 출석 달성을 축하합니다!</p>
            <button onClick={() => setShowConfetti(false)} className="mt-8 pointer-events-auto bg-pink-500 hover:bg-pink-400 text-white px-8 py-3 rounded-full font-black border-2 border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.5)]">닫기</button>
          </div>
        </div>
      )}

      {/* 상단 밴드 스타일 헤더 (글래스모피즘) */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg px-4 py-4 md:py-6 sticky top-0 z-10 flex flex-col items-center justify-center border-b border-white/20">
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 tracking-tight drop-shadow-sm">✨ {bandTitle}</h1>
        {/* 글로벌 전광판 */}
        {globalMarquee && (
          <div className="w-full max-w-2xl mt-3 overflow-hidden bg-black/30 border border-yellow-500/30 rounded-full">
            <div className="whitespace-nowrap px-4 py-1.5 text-yellow-300 font-bold text-sm flex items-center">
              <span className="mr-2">🏆</span>
              {/* @ts-ignore */}
              <marquee scrollamount="5">{globalMarquee}</marquee>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-lg md:max-w-2xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 mt-4 md:mt-8">
        
        {/* 출석 입력 폼 영역 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20 relative overflow-hidden">
          {/* 장식용 빛번짐 효과 */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight drop-shadow-md">
              매일매일 출석하고<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400">커피 쿠폰</span> 받아가세요!
            </h2>
            <p className="text-base md:text-lg text-purple-200 font-medium mt-3 bg-black/20 inline-block px-4 py-1.5 rounded-full">{new Date().getMonth() + 1}월 20일 출석 달성 시 자동 응모 🎁</p>
          </div>

          {!hasCheckedIn ? (
            <form onSubmit={handleCheckIn} className="space-y-5 relative z-10">
              <div className="text-left mb-2">
                <label className="block text-sm md:text-base font-bold text-purple-200 ml-1">
                  {platform === 'daangn' && <>당근마켓 동네생활 닉네임 <span className="text-purple-400 font-normal">(프로필 이름)</span></>}
                  {platform === 'kakao' && <>카카오톡 오픈채팅방 닉네임 <span className="text-purple-400 font-normal">(채팅방 프로필)</span></>}
                  {platform === 'band' && <>밴드 프로필 이름 <span className="text-purple-400 font-normal">(실명 또는 닉네임)</span></>}
                </label>
              </div>
              <input 
                type="text" 
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={
                  platform === 'daangn' ? "당근마켓 활동 닉네임을 적어주세요" :
                  platform === 'kakao' ? "채팅방에서 쓰시는 닉네임을 적어주세요" :
                  "활동하시는 이름을 적어주세요"
                }
                className="w-full px-5 py-5 rounded-2xl bg-white/20 border-2 border-white/10 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 text-center text-xl md:text-2xl font-bold text-white placeholder-purple-300 transition-all backdrop-blur-sm"
              />
              <button 
                type="submit"
                disabled={isSubmitting || !nickname.trim()}
                className={`w-full py-5 px-6 font-black text-xl md:text-2xl rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  isSubmitting || !nickname.trim() 
                    ? 'bg-white/10 cursor-not-allowed text-white/50 shadow-none border border-white/10' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white border border-pink-400/50'
                }`}
              >
                {isSubmitting ? '출석 기록 중...' : '🔥 스폰서(쿠팡) 방문하고 출석하기'}
              </button>
            </form>
          ) : (
            // 출석 완료 시 성공 메시지
            <div className="flex flex-col gap-4 relative z-10">
              <div className="bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-100 p-6 md:p-8 rounded-2xl text-center animate-in zoom-in duration-300 border border-emerald-400/30 backdrop-blur-md shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                <div className="text-5xl md:text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="font-extrabold text-2xl md:text-3xl text-white drop-shadow-md">출석이 완료되었습니다!</h3>
                <p className="text-lg md:text-xl mt-3 text-emerald-200 font-medium">
                  {new Date().getMonth() + 1}월 누적 <span className="font-black bg-emerald-500 text-white px-4 py-1.5 rounded-lg mx-1 shadow-lg shadow-emerald-500/50">{streakDays}일째</span> 출석입니다!
                </p>
              </div>
              
              {/* 기분/상태 선택 UI */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <h3 className="text-base md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-indigo-200 mb-5 text-center flex items-center justify-center gap-2">
                  <span>지금 내 상태나 기분을 자유롭게 알려주세요!</span>
                  <span className="text-xl animate-bounce">👇</span>
                </h3>
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 relative z-10">
                  {MOOD_OPTIONS.map(mood => (
                    <button
                      key={mood.id}
                      disabled={isUpdatingMood}
                      onClick={() => handleUpdateMood(mood.id)}
                      className={`py-2.5 px-4 md:py-3 md:px-5 rounded-full text-sm md:text-base font-bold transition-all duration-300 flex items-center gap-2.5 shadow-sm hover:shadow-md ${
                        myMood === mood.id 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_4px_15px_rgba(236,72,153,0.4)] border border-pink-400 scale-105' 
                          : 'bg-white/5 text-purple-100 hover:bg-white/15 hover:text-white border border-white/10 hover:border-white/30 hover:-translate-y-0.5'
                      }`}
                    >
                      <span className="text-lg md:text-xl drop-shadow-sm">{mood.emoji}</span>
                      <span className="leading-none tracking-wide">{mood.text}</span>
                      {myMood === mood.id && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0 animate-pulse ml-1 shadow-[0_0_8px_white]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 공정위 필수 문구 */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
            <p className="text-xs md:text-sm text-purple-300/60 font-medium">
              본 페이지의 링크를 통해 구매 시 수수료를 제공받을 수 있습니다.
            </p>
          </div>
        </div>

        {/* 매일매일 새로운 즐길거리 (메뉴 & 콘텐츠) */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 mt-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xl md:text-2xl text-white drop-shadow-sm">🎁 매일매일 새로운 즐길거리</h3>
            <span className="text-xs font-black text-purple-900 bg-pink-300 px-2 py-1 rounded-md shadow-sm">AD</span>
          </div>

          {!selectedCategory ? (
            // 카테고리 선택 메뉴 (2x2 그리드)
            <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
              <button onClick={() => handleSelectCategory('mz')} className="bg-gradient-to-br from-indigo-500/80 to-blue-600/80 hover:from-indigo-400 hover:to-blue-500 p-4 md:p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col items-center justify-center gap-2 transition-transform transform hover:scale-105">
                <span className="text-3xl md:text-4xl drop-shadow-md">😎</span>
                <span className="text-white font-bold text-sm md:text-base">MZ 신조어 퀴즈</span>
              </button>
              <button onClick={() => handleSelectCategory('brain')} className="bg-gradient-to-br from-purple-500/80 to-pink-600/80 hover:from-purple-400 hover:to-pink-500 p-4 md:p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col items-center justify-center gap-2 transition-transform transform hover:scale-105">
                <span className="text-3xl md:text-4xl drop-shadow-md">🧠</span>
                <span className="text-white font-bold text-sm md:text-base">피의 게임 두뇌 퀴즈</span>
              </button>
              <button onClick={() => handleSelectCategory('balance')} className="bg-gradient-to-br from-rose-500/80 to-orange-600/80 hover:from-rose-400 hover:to-orange-500 p-4 md:p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col items-center justify-center gap-2 transition-transform transform hover:scale-105">
                <span className="text-3xl md:text-4xl drop-shadow-md">⚖️</span>
                <span className="text-white font-bold text-sm md:text-base">극악의 밸런스 게임</span>
              </button>
              <button onClick={() => handleSelectCategory('joke')} className="bg-gradient-to-br from-teal-500/80 to-emerald-600/80 hover:from-teal-400 hover:to-emerald-500 p-4 md:p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col items-center justify-center gap-2 transition-transform transform hover:scale-105">
                <span className="text-3xl md:text-4xl drop-shadow-md">🤣</span>
                <span className="text-white font-bold text-sm md:text-base">피식 아재개그</span>
              </button>
            </div>
          ) : activeContent ? (
            // 게임 플레이 화면
            <div className="bg-black/20 rounded-2xl p-5 border border-white/10 animate-in fade-in slide-in-from-right-4 relative">
              <button onClick={() => setSelectedCategory(null)} className="absolute top-4 right-4 text-white/50 hover:text-white text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">돌아가기</button>
              
              <div className="text-center mb-6 mt-4">
                <span className="text-4xl mb-3 block">
                  {selectedCategory === 'mz' ? '😎' : selectedCategory === 'brain' ? '🧠' : selectedCategory === 'balance' ? '⚖️' : '🤣'}
                </span>
                <h4 className="text-xl md:text-2xl font-black text-white leading-snug break-keep">{activeContent.question}</h4>
              </div>

              {activeContent.options && !isRevealed && (
                <div className="flex flex-col gap-2 mb-4">
                  {activeContent.options.map((opt: string, idx: number) => (
                    <button key={idx} onClick={handleRevealAnswer} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl text-left border border-white/5 transition-colors">
                      {idx + 1}. {opt}
                    </button>
                  ))}
                </div>
              )}

              {!isRevealed && (
                <button 
                  onClick={handleRevealAnswer}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black py-4 rounded-xl shadow-[0_4px_15px_rgba(236,72,153,0.4)] border border-pink-400/50 mt-2 text-lg animate-pulse"
                >
                  👉 정답 및 {selectedCategory === 'balance' ? '통계' : '해설'} 보기
                </button>
              )}

              {isRevealed && (
                <div className="mt-4 p-5 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-xl border border-indigo-400/30 animate-in fade-in zoom-in duration-300 shadow-inner">
                  <h5 className="text-pink-300 font-bold text-sm mb-1">{selectedCategory === 'balance' ? '📊 다른 사람들의 선택' : '💡 정답'}</h5>
                  <p className="text-white font-black text-xl mb-3">{activeContent.answer}</p>
                  
                  {activeContent.explanation && (
                    <>
                      <div className="h-px w-full bg-white/10 my-4"></div>
                      <p className="text-indigo-200 text-sm leading-relaxed">{activeContent.explanation}</p>
                    </>
                  )}
                  
                  <button onClick={() => handleSelectCategory(selectedCategory)} className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold border border-white/10 transition-colors shadow-sm">
                    새로운 문제 풀기 🔄
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* 출석자 명단 리스트 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20 mt-8">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
            <h3 className="font-extrabold text-xl md:text-2xl text-white drop-shadow-sm">🏆 오늘의 출석 멤버</h3>
            <span className="text-base md:text-lg font-black text-pink-300 bg-pink-900/40 border border-pink-500/30 px-4 py-1.5 rounded-full shadow-inner">
              총 {attendees.length}명
            </span>
          </div>

          {/* 기분/상태 통계 요약 (오늘의 멤버들의 상태) */}
          {Object.keys(attendeeMoods).length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-5 mb-2 scrollbar-hide">
              {MOOD_OPTIONS.map(mood => {
                const count = Object.values(attendeeMoods).filter(m => m === mood.id).length;
                if (count === 0) return null;
                return (
                  <div key={mood.id} className="bg-indigo-900/50 border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-200 whitespace-nowrap flex items-center gap-1.5 shadow-sm">
                    <span className="text-sm">{mood.emoji}</span>
                    <span>{mood.short}</span>
                    <span className="text-white bg-pink-500 px-1.5 py-0.5 rounded-full text-[10px]">{count}명</span>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 style-scroll">
            <ul className="space-y-4">
              {attendees.map((user, index) => (
                <li key={user.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors px-5 py-4 md:py-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 border border-white/5">
                  <div className="flex items-center space-x-4">
                    <span className="text-purple-300 text-base md:text-lg font-black w-6 text-center">{attendees.length - index}</span>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center font-black text-xl md:text-2xl shadow-lg border border-white/20 relative">
                      {user.name.charAt(0)}
                      {/* 상태 뱃지 */}
                      {attendeeMoods[user.name] && (
                        <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md border-2 border-slate-700 animate-in zoom-in duration-300">
                          {MOOD_OPTIONS.find(m => m.id === attendeeMoods[user.name])?.emoji}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg md:text-xl tracking-wide">{user.name}</span>
                        {user.streak >= 20 && (
                          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-950 text-[10px] md:text-xs font-black px-2 py-0.5 rounded shadow-sm border border-yellow-300/50 flex items-center gap-1 animate-pulse">
                            👑 응모완료
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-purple-300/80 font-medium">{user.streak}일 누적 출석</span>
                    </div>
                  </div>
                  <span className="text-sm md:text-base text-purple-300 font-bold bg-black/20 px-3 py-1 rounded-lg">{user.time}</span>
                </li>
              ))}
              {attendees.length === 0 && (
                <li className="text-center text-purple-300/70 py-8 font-medium bg-black/10 rounded-2xl border border-white/5 border-dashed">
                  오늘의 첫 출석자가 되어보세요! ✨
                </li>
              )}
            </ul>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-2xl font-bold text-gray-500">Loading...</div>}>
      <CheckInContent />
    </Suspense>
  );
}
