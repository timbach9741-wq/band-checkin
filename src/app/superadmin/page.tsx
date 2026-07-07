'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function SuperAdminDashboard() {
  const searchParams = useSearchParams();
  const password = searchParams.get('pw');
  
  const [bandStats, setBandStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const [periodInfo, setPeriodInfo] = useState({ start: '', end: '', daysLeft: 0 });

  // 밴드 URL 생성기 상태
  const [newBandName, setNewBandName] = useState('');
  const [newTargetDays, setNewTargetDays] = useState<number>(20);
  const [generatedLinks, setGeneratedLinks] = useState<{checkIn: string, admin: string} | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleGenerateLink = async () => {
    if (!newBandName.trim()) {
      alert('밴드 이름을 입력해주세요 (영문/숫자 추천)');
      return;
    }
    const safeName = newBandName.trim().replace(/\s+/g, '-').toLowerCase();
    
    // DB에 목표 일수 마커 설정 삽입
    await supabase.from('attendance_logs').insert([{ band_id: safeName, nickname: `___TARGET:${newTargetDays}___` }]);
    
    setGeneratedLinks({
      checkIn: `${origin}/check-in?band=${safeName}`,
      admin: `${origin}/admin?band=${safeName}&pw=1234` // 초기 기본 비밀번호
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} 복사되었습니다!\n\n${text}`);
    }).catch(() => {
      alert('복사에 실패했습니다. 직접 드래그해서 복사해주세요.');
    });
  };

  useEffect(() => {
    // 1. 마스터 비밀번호 검증 (고객님이 지정하신 강력한 비밀번호)
    if (password !== 'timbach9741@@') {
      setAuthFailed(true);
      setIsLoading(false);
      return;
    }

    async function fetchAllStats() {
      const now = new Date();
      // 이벤트는 "매월 1일부터 말일"을 한 시즌(프로모션)으로 계산합니다.
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      // 프로모션 기간 마감일(D-Day) 계산
      const daysLeft = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setPeriodInfo({
        start: `${startOfMonth.getFullYear()}.${String(startOfMonth.getMonth()+1).padStart(2, '0')}.${String(startOfMonth.getDate()).padStart(2, '0')}`,
        end: `${endOfMonth.getFullYear()}.${String(endOfMonth.getMonth()+1).padStart(2, '0')}.${String(endOfMonth.getDate()).padStart(2, '0')}`,
        daysLeft
      });

      // 전체 데이터 불러오기 (band_id 조건 없이 전부)
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      // 밴드별로 1차 그룹화, 그 안에서 유저별로 2차 그룹화
      const grouped = data.reduce((acc: any, log: any) => {
        const band = log.band_id;
        if (!acc[band]) {
          acc[band] = { bandId: band, users: {}, totalCheckins: 0, todayCheckins: 0, targetDays: 20 };
        }
        
        const user = log.nickname;
        
        // 목표 일수 마커 파싱 (통계 제외)
        if (user.startsWith('___TARGET:')) {
          const match = user.match(/___TARGET:(\d+)___/);
          if (match) {
            acc[band].targetDays = parseInt(match[1], 10);
          }
          return acc; 
        }
        
        acc[band].totalCheckins += 1;
        
        // 오늘 출석 인원 계산 (로컬 시간 기준)
        const logDate = new Date(log.created_at);
        const logDateStr = `${logDate.getFullYear()}-${logDate.getMonth()}-${logDate.getDate()}`;
        const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        
        if (logDateStr === todayStr) {
          acc[band].todayCheckins += 1;
        }
        
        const user = log.nickname;
        if (!acc[band].users[user]) {
          acc[band].users[user] = { name: user, days: 0, lastCheckIn: log.created_at };
        }
        acc[band].users[user].days += 1;
        
        // 최신 출석일 업데이트
        if (new Date(log.created_at) > new Date(acc[band].users[user].lastCheckIn)) {
          acc[band].users[user].lastCheckIn = log.created_at;
        }
        
        return acc;
      }, {});

      setBandStats(grouped);
      setIsLoading(false);
    }

    fetchAllStats();
  }, [password]);

  // 개별 밴드 엑셀(CSV) 다운로드 기능
  const downloadBandCSV = (bandId: string, usersObj: any, targetDays: number = 20) => {
    // 유저들을 출석일수 내림차순 정렬
    const users = Object.values(usersObj).sort((a: any, b: any) => b.days - a.days);
    
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // 한글 깨짐 방지 BOM
    csvContent += '순위,닉네임,누적출석일,최근출석시간,상태\n';
    
    users.forEach((user: any, index: number) => {
      const isWinner = user.days >= targetDays;
      const date = new Date(user.lastCheckIn);
      const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      const status = isWinner ? '달성 완료' : `${targetDays - user.days}일 남음`;
      
      const row = `${index + 1},${user.name},${user.days}일,${formattedDate},${status}`;
      csvContent += row + '\n';
    });
    
    // 밴드 이름으로 각각 다운로드
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${bandId}_이번달_출석통계.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authFailed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full border border-gray-700">
          <div className="text-5xl mb-4">🛑</div>
          <h2 className="text-2xl font-bold text-white mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-400 text-sm">최고 관리자 전용 마스터 비밀번호가 필요합니다.</p>
        </div>
      </div>
    );
  }

  const bandList = Object.values(bandStats);

  return (
    <div className="min-h-screen bg-[#111827] text-white p-4 md:p-8 font-sans pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 상단 헤더 (마스터 전용 다크모드 디자인) */}
        <header className="bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-3">
              <span>🚀</span> 최고 관리자(Super Admin)
            </h1>
            <p className="text-gray-400 mt-3 font-medium text-base md:text-lg">
              모든 제휴 밴드의 출석 현황을 실시간으로 모니터링합니다.
            </p>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 p-5 rounded-2xl w-full lg:w-auto shadow-inner flex flex-col sm:flex-row gap-6 items-center">
            {/* 총 가입 밴드 수 */}
            <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-xl border border-gray-700 w-full sm:w-auto shrink-0 min-w-[140px]">
              <span className="text-gray-400 font-bold text-sm mb-1">총 가입 밴드 수</span>
              <span className="text-3xl font-black text-white">{bandList.length}<span className="text-base font-medium text-gray-500 ml-1">개</span></span>
            </div>
            
            {/* 프로모션 기간 표시 기능 */}
            <div className="w-full">
              <p className="text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">현재 프로모션 시즌 (이번 달)</p>
              <div className="flex justify-between items-center gap-4 bg-gray-800 p-3 rounded-xl border border-gray-700 overflow-hidden">
                <p className="text-lg md:text-xl font-bold text-gray-200 whitespace-nowrap">{periodInfo.start} ~ {periodInfo.end}</p>
                <div className="text-right shrink-0">
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-base font-black border border-blue-500/30 whitespace-nowrap">
                    마감 D-{periodInfo.daysLeft}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 신규 밴드 URL 생성기 */}
        <div className="bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-300 mb-6 flex items-center gap-2">
            🔗 신규 밴드 제휴 링크 생성기
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={newBandName}
              onChange={(e) => setNewBandName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateLink()}
              placeholder="제휴할 밴드 이름 입력 (예: momcafe, soccer-club)" 
              className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-5 py-4 text-white text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <select 
              value={newTargetDays}
              onChange={(e) => setNewTargetDays(Number(e.target.value))}
              className="bg-gray-900 border border-gray-600 rounded-xl px-5 py-4 text-white text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer font-bold"
            >
              <option value={10}>🎯 10일 출석</option>
              <option value={15}>🎯 15일 출석</option>
              <option value={20}>🎯 20일 출석</option>
              <option value={30}>🎯 30일 출석</option>
            </select>
            <button 
              onClick={handleGenerateLink}
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black px-8 py-4 rounded-xl text-lg transition-colors shrink-0"
            >
              링크 자동 생성
            </button>
          </div>
          
          {generatedLinks && (
            <div className="mt-6 bg-gray-900 p-6 rounded-2xl border border-emerald-900/50 space-y-5 shadow-inner">
              <div>
                <p className="text-emerald-400 font-bold mb-2 text-sm flex items-center gap-2">
                  ✅ 일반 회원용 출석체크 링크 <span className="text-gray-500 font-normal">(밴드 공지사항 등록용)</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" readOnly value={generatedLinks.checkIn} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 w-full outline-none" />
                  <button onClick={() => copyToClipboard(generatedLinks.checkIn, '출석체크 링크가')} className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm">복사하기</button>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-800">
                <p className="text-blue-400 font-bold mb-2 text-sm flex items-center gap-2">
                  👑 밴드장 전용 관리자 링크 <span className="text-gray-500 font-normal">(초기비밀번호: 1234)</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" readOnly value={generatedLinks.admin} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 w-full outline-none" />
                  <button onClick={() => copyToClipboard(generatedLinks.admin, '관리자 링크가')} className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm">복사하기</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 밴드 목록 카드형 UI */}
        <div className="space-y-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-300 px-2 flex items-center gap-2">
            📊 운영 중인 밴드 세부 현황
          </h2>
          
          {isLoading ? (
             <div className="bg-gray-800 rounded-3xl p-12 text-center text-gray-500 border border-gray-700 font-bold text-xl">
               데이터를 분석하는 중입니다...
             </div>
          ) : bandList.length === 0 ? (
             <div className="bg-gray-800 rounded-3xl p-12 text-center text-gray-500 border border-gray-700 font-bold text-xl">
               이번 달 출석 기록이 아직 없습니다.
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bandList.map((band: any) => {
                const uniqueUsers = Object.keys(band.users).length;
                
                return (
                  <div key={band.bandId} className="bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-700 hover:border-gray-500 transition-colors shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-3xl font-black text-white">{band.bandId}</h3>
                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-md text-sm font-bold border border-blue-500/20 inline-block w-max mt-1">
                          시즌 마감 D-{periodInfo.daysLeft} ({periodInfo.end} 까지)
                        </span>
                      </div>
                      <a 
                        href={`/admin?band=${band.bandId}&pw=1234`}
                        target="_blank"
                        className="text-sm font-bold text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                      >
                        밴드장 화면 ↗
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
                      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex flex-col justify-center items-center text-center">
                        <p className="text-gray-400 text-sm font-bold mb-2 break-keep">이번달 총참여자</p>
                        <p className="text-2xl font-black text-white">{uniqueUsers}<span className="text-sm font-medium text-gray-500 ml-1">명</span></p>
                      </div>
                      <div className="bg-gray-900 rounded-2xl p-4 border border-emerald-900/50 flex flex-col justify-center items-center text-center shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/50"></div>
                        <p className="text-emerald-500/90 text-sm font-black mb-2 break-keep">🔥 오늘 출석자</p>
                        <p className="text-3xl font-black text-emerald-400">{band.todayCheckins}<span className="text-sm font-medium text-emerald-500/50 ml-1">명</span></p>
                      </div>
                      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex flex-col justify-center items-center text-center">
                        <p className="text-gray-400 text-sm font-bold mb-2 break-keep">총 출석건수</p>
                        <p className="text-2xl font-black text-blue-400">{band.totalCheckins}<span className="text-sm font-medium text-gray-500 ml-1">건</span></p>
                      </div>
                    </div>

                    <button 
                      onClick={() => downloadBandCSV(band.bandId, band.users, band.targetDays)}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 text-lg font-black py-4 rounded-2xl transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      📥 {band.bandId} 명단 개별 추출
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center font-bold text-gray-500">Loading...</div>}>
      <SuperAdminDashboard />
    </Suspense>
  );
}
