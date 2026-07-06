'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function CheckInContent() {
  const searchParams = useSearchParams();
  const bandId = searchParams.get('band') || 'default';
  const bandTitle = searchParams.get('title') || '오늘의 출석체크';
  
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [streakDays, setStreakDays] = useState(1);

  // DB 연동된 실제 출석자 데이터 상태
  const [attendees, setAttendees] = useState<any[]>([]);

  // [임시 제휴 링크 설정] 
  // 고객님이 추후 애드픽에서 캠페인을 생성하신 뒤, 실제 주소로 변경해주시면 됩니다.
  const COUPANG_URL = 'https://bitl.bz/4aadvo'; // 1. 쿠팡 (출석체크용)
  const ELEVENST_URL = 'https://bitl.bz/04CdRt'; // 2. 11번가 (운세용)
  const EMART_URL = 'https://bitl.bz/ZDWuPt'; // 3. SSG (로또용)

  // 자체 로또 번호 생성기 상태
  const [lottoNumbers, setLottoNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isBonusSpinning, setIsBonusSpinning] = useState(false);

  const generateLotto = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSpinning || isBonusSpinning) return;

    // 1. 화이트햇 방식: 유저 눈에 보이게 이마트몰 새 창 띄우기
    window.open(EMART_URL, '_blank');

    setIsSpinning(true);
    setIsBonusSpinning(true);
    setLottoNumbers([]); 
    setBonusNumber(null);

    // 역대 당첨 데이터 패턴을 분석한 현실적인 로또 생성기 알고리즘
    const generateRealisticNumbers = () => {
      let temp = new Set<number>();
      let isValid = false;
      while (!isValid) {
        temp.clear();
        while (temp.size < 6) temp.add(Math.floor(Math.random() * 45) + 1);
        const arr = Array.from(temp);
        
        // 1. 번호 총합 검사
        const sum = arr.reduce((a, b) => a + b, 0);
        // 2. 홀짝 비율 검사 
        const odds = arr.filter(n => n % 2 !== 0).length;
        
        if (sum >= 100 && sum <= 170 && odds >= 2 && odds <= 4) {
          isValid = true;
        }
      }
      
      // 보너스 번호 1개 추가 (기존 6개와 겹치지 않게)
      let bonus = Math.floor(Math.random() * 45) + 1;
      while(temp.has(bonus)) {
        bonus = Math.floor(Math.random() * 45) + 1;
      }
      
      return { main: Array.from(temp).sort((a, b) => a - b), bonus };
    };

    // 2. 룰렛 애니메이션: 1.5초 뒤 6개 정지, 보너스 번호는 1초 더 돌다가 짠!
    let count = 0;
    const interval = setInterval(() => {
      // 6개 번호와 보너스 번호 모두 미친듯이 돌아감
      const temp = new Set<number>();
      while (temp.size < 7) temp.add(Math.floor(Math.random() * 45) + 1);
      const arr = Array.from(temp);
      setLottoNumbers(arr.slice(0, 6));
      setBonusNumber(arr[6]);
      
      count++;
      if (count > 15) { // 1.5초 뒤 6개 메인 번호 정지
        clearInterval(interval);
        
        const finalData = generateRealisticNumbers();
        setLottoNumbers(finalData.main);
        setIsSpinning(false);
        
        // 보너스 번호만 단독으로 1초 더 돌아가는 쫄깃한 연출
        let bonusCount = 0;
        const bonusInterval = setInterval(() => {
          let rand = Math.floor(Math.random() * 45) + 1;
          setBonusNumber(rand);
          bonusCount++;
          
          if (bonusCount > 10) { // 1초 뒤 정지
            clearInterval(bonusInterval);
            setBonusNumber(finalData.bonus);
            setIsBonusSpinning(false);
          }
        }, 100);
      }
    }, 100);
  };

  // 페이지가 로드될 때 '오늘의 출석 멤버' 데이터를 DB에서 불러옵니다.
  useEffect(() => {
    async function fetchTodayAttendees() {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 오늘 자정 기준
      
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('band_id', bandId)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false }); // 최신순 정렬
        
      if (data) {
        const formatted = data.map((log: any) => {
          const date = new Date(log.created_at);
          return {
            id: log.id,
            name: log.nickname,
            time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
          };
        });
        setAttendees(formatted);
      }
    }
    fetchTodayAttendees();
  }, [bandId]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsSubmitting(true);

    // 1. 화이트햇 방식: 쿠팡 새 창 띄우기
    window.open(COUPANG_URL, '_blank');

    // 2. Supabase DB에 출석 기록 저장
    const { error: insertError } = await supabase
      .from('attendance_logs')
      .insert([{ band_id: bandId, nickname: nickname }]);

    if (insertError) {
      console.error('출석 저장 실패:', insertError);
      alert('출석 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
      return;
    }

    // 3. 이번 달 누적 출석 일수 계산
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { count } = await supabase
      .from('attendance_logs')
      .select('*', { count: 'exact', head: true })
      .eq('band_id', bandId)
      .eq('nickname', nickname)
      .gte('created_at', startOfMonth);
      
    setStreakDays(count || 1);

    // 4. 화면 리스트 맨 위에 즉시 추가 (피드백용)
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setAttendees(prev => [{ id: Date.now(), name: nickname, time: timeString }, ...prev]);
    
    setIsSubmitting(false);
    setHasCheckedIn(true);
    setNickname(''); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 font-sans pb-12 text-white selection:bg-pink-500 selection:text-white">
      {/* 상단 밴드 스타일 헤더 (글래스모피즘) */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg px-4 py-4 md:py-6 sticky top-0 z-10 flex items-center justify-center border-b border-white/20">
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 tracking-tight drop-shadow-sm">✨ {bandTitle}</h1>
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
            <p className="text-base md:text-lg text-purple-200 font-medium mt-3 bg-black/20 inline-block px-4 py-1.5 rounded-full">한 달 20일 이상 출석 시 자동 응모 🎁</p>
          </div>

          {!hasCheckedIn ? (
            <form onSubmit={handleCheckIn} className="space-y-5 relative z-10">
              <div className="text-left mb-2">
                <label className="block text-sm md:text-base font-bold text-purple-200 ml-1">
                  밴드 프로필 이름 <span className="text-purple-400 font-normal">(실명 또는 닉네임)</span>
                </label>
              </div>
              <input 
                type="text" 
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="활동하시는 이름을 적어주세요"
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
            <div className="bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-100 p-6 md:p-8 rounded-2xl text-center animate-in zoom-in duration-300 border border-emerald-400/30 relative z-10 backdrop-blur-md shadow-[0_0_30px_rgba(52,211,153,0.2)]">
              <div className="text-5xl md:text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="font-extrabold text-2xl md:text-3xl text-white drop-shadow-md">출석이 완료되었습니다!</h3>
              <p className="text-lg md:text-xl mt-3 text-emerald-200 font-medium">
                이번 달 누적 <span className="font-black bg-emerald-500 text-white px-4 py-1.5 rounded-lg mx-1 shadow-lg shadow-emerald-500/50">{streakDays}일째</span> 출석입니다!
              </p>
            </div>
          )}

          {/* 공정위 필수 문구 */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
            <p className="text-xs md:text-sm text-purple-300/60 font-medium">
              본 페이지의 링크를 통해 구매 시 수수료를 제공받을 수 있습니다.
            </p>
          </div>
        </div>

        {/* 제휴 콘텐츠 / 쿠키 드랍 배너 영역 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-lg md:text-xl text-white drop-shadow-sm">🎁 매일매일 새로운 즐길거리</h3>
            <span className="text-xs font-black text-purple-900 bg-pink-300 px-2 py-1 rounded-md shadow-sm">AD</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              // 화이트햇 방식: 11번가 새 창 열기
              window.open(ELEVENST_URL, '_blank');
              // 현재 창은 네이버 운세로 이동
              setTimeout(() => {
                window.location.href = 'https://search.naver.com/search.naver?query=오늘의운세';
              }, 500);
            }}
            className="w-full bg-gradient-to-r from-indigo-500/40 to-blue-500/40 hover:from-indigo-400/50 hover:to-blue-400/50 border border-white/10 text-white py-4 rounded-2xl font-bold flex justify-between items-center px-6 transition-all transform hover:scale-[1.02] shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl md:text-4xl drop-shadow-md">🔮</span>
              <div className="flex flex-col items-start">
                <span className="text-base md:text-lg font-black tracking-wide">오늘의 무료 운세 보기</span>
                <span className="text-xs text-indigo-200 mt-0.5">11번가 스폰서 구경하고 운세 확인</span>
              </div>
            </div>
            <span className="text-white/50 text-xl font-black">▶</span>
          </button>

          <div className="w-full bg-gradient-to-r from-rose-500/40 to-orange-500/40 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <button 
              onClick={generateLotto}
              disabled={isSpinning}
              className="w-full text-white py-2 font-bold flex justify-between items-center px-2 transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl md:text-4xl drop-shadow-md">🎯</span>
                <span className="text-base md:text-lg font-black tracking-wide text-left flex flex-col">
                  <span>이번 주 행운의 로또 번호 뽑기</span>
                  <span className="text-xs text-orange-200 font-normal mt-0.5">이마트몰 스폰서 구경하고 번호 생성</span>
                </span>
              </div>
              <span className="text-white/50 text-xl font-black">▶</span>
            </button>
            
            {/* 자체 로또 번호 결과창 */}
            {(lottoNumbers.length > 0 || isSpinning) && (
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap justify-center items-center gap-2">
                {lottoNumbers.map((num, i) => {
                  let bgColor = "bg-yellow-400 text-yellow-900"; 
                  if (num > 10) bgColor = "bg-blue-400 text-blue-900"; 
                  if (num > 20) bgColor = "bg-red-400 text-red-900"; 
                  if (num > 30) bgColor = "bg-gray-400 text-gray-900"; 
                  if (num > 40) bgColor = "bg-green-400 text-green-900"; 
                  
                  return (
                    <div 
                      key={i} 
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-[0_0_15px_rgba(255,255,255,0.3)] border-2 border-white/20 transform transition-all ${bgColor} ${isSpinning ? 'animate-ping duration-75' : 'animate-bounce'}`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {num}
                    </div>
                  );
                })}

                {/* 마지막 보너스 번호 연출 */}
                {bonusNumber !== null && (
                  <>
                    <span className="text-white font-black text-2xl mx-1">+</span>
                    <div 
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-[0_0_20px_rgba(236,72,153,0.5)] border-2 border-pink-400 transform transition-all ${
                        bonusNumber > 40 ? "bg-green-400 text-green-900" :
                        bonusNumber > 30 ? "bg-gray-400 text-gray-900" :
                        bonusNumber > 20 ? "bg-red-400 text-red-900" :
                        bonusNumber > 10 ? "bg-blue-400 text-blue-900" :
                        "bg-yellow-400 text-yellow-900"
                      } ${isBonusSpinning ? 'animate-ping duration-75 opacity-50' : 'animate-bounce scale-110 ring-4 ring-pink-500/50'}`}
                    >
                      {bonusNumber}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 출석자 명단 리스트 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h3 className="font-extrabold text-xl md:text-2xl text-white drop-shadow-sm">🏆 오늘의 출석 멤버</h3>
            <span className="text-base md:text-lg font-black text-pink-300 bg-pink-900/40 border border-pink-500/30 px-4 py-1.5 rounded-full shadow-inner">
              총 {attendees.length}명
            </span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 style-scroll">
            <ul className="space-y-4">
              {attendees.map((user, index) => (
                <li key={user.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors px-5 py-4 md:py-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 border border-white/5">
                  <div className="flex items-center space-x-4">
                    <span className="text-purple-300 text-base md:text-lg font-black w-6 text-center">{attendees.length - index}</span>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center font-black text-xl md:text-2xl shadow-lg border border-white/20">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-lg md:text-xl tracking-wide">{user.name}</span>
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
