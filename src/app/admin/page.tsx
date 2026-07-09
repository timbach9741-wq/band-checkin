'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function AdminDashboard() {
  const searchParams = useSearchParams();
  const bandId = searchParams.get('band');
  const [bandName, setBandName] = useState(bandId ? bandId.split('-').slice(0, -1).join(' ') : '방');
  const [totalMembers, setTotalMembers] = useState(0);
  
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setErrorMsg('4자리 숫자를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bandId, pin })
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsAuthenticated(true);
        if (data.bandName) {
          setBandName(data.bandName);
        }
        if (data.totalMembers) {
          setTotalMembers(data.totalMembers);
        }
        fetchStats();
      } else {
        setErrorMsg(data.error || '비밀번호가 일치하지 않습니다.');
        setPin('');
      }
    } catch (e) {
      setErrorMsg('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    setIsLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    // RLS allows SELECTing non-config rows
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('band_id', bandId)
      .gte('created_at', startOfMonth);

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    const validData = data.filter((log: any) => !log.nickname.startsWith('___'));

    const userStats = validData.reduce((acc: any, log: any) => {
      if (!acc[log.nickname]) {
        acc[log.nickname] = { name: log.nickname, days: 0, lastCheckIn: log.created_at };
      }
      acc[log.nickname].days += 1;
      if (new Date(log.created_at) > new Date(acc[log.nickname].lastCheckIn)) {
        acc[log.nickname].lastCheckIn = log.created_at;
      }
      return acc;
    }, {});

    const sortedStats = Object.values(userStats).sort((a: any, b: any) => b.days - a.days);
    setStats(sortedStats);
    setIsLoading(false);
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const downloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += '순위,닉네임,누적출석일,최근출석시간,상태\n';
    
    stats.forEach((user: any, idx: number) => {
      const date = new Date(user.lastCheckIn);
      const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
      const status = user.days >= 20 ? '달성 완료' : `${20 - user.days}일 남음`;
      csvContent += `${idx + 1},${user.name},${user.days}일,${formattedDate},${status}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `${bandName}_출석현황_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 자동 제출
  useEffect(() => {
    if (pin.length === 4 && !isAuthenticated) {
      handleVerifyPin();
    }
  }, [pin]);

  if (!bandId) {
    return <div className="p-10 text-center text-red-500 font-bold">잘못된 접근입니다. (방 정보가 없습니다.)</div>;
  }

  // 잠금 화면 UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">관리자 암호 입력</h2>
          <p className="text-slate-400 text-sm mb-8">방 생성 시 설정한 PIN 4자리를 입력하세요.</p>
          
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${pin.length > i ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
            ))}
          </div>
          
          {errorMsg && <p className="text-red-400 text-sm mb-4 font-bold animate-pulse">{errorMsg}</p>}

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button key={num} onClick={() => handleNumberClick(num.toString())} className="h-16 text-2xl font-bold text-white bg-slate-700/50 hover:bg-slate-600 rounded-2xl active:scale-95 transition-all">
                {num}
              </button>
            ))}
            <button onClick={() => setPin('')} className="h-16 text-sm font-bold text-slate-400 hover:text-white rounded-2xl active:scale-95 transition-all">초기화</button>
            <button onClick={() => handleNumberClick('0')} className="h-16 text-2xl font-bold text-white bg-slate-700/50 hover:bg-slate-600 rounded-2xl active:scale-95 transition-all">0</button>
            <button onClick={handleDelete} className="h-16 text-2xl font-bold text-slate-300 hover:text-white rounded-2xl active:scale-95 transition-all">⌫</button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <a 
              href="https://t.me/YOUR_TELEGRAM_LINK" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 text-sm hover:text-white underline decoration-slate-500 underline-offset-4 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('대표님의 텔레그램(Telegram) 방으로 연결됩니다.\n(현재 임시 주소입니다. 텔레그램 주소를 알려주시면 바로 반영하겠습니다!)');
              }}
            >
              비밀번호를 잊으셨나요? 문의하기
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 관리자 대시보드 UI (인증 성공)
  const winnersCount = stats.filter(s => s.days >= 20).length;
  const currentRate = totalMembers > 0 ? Math.floor((winnersCount / totalMembers) * 100) : 0;
  
  let rewardTitle = '목표 미달성 (커피 지급 불가)';
  let rewardDesc = `현재 당첨자 비율: ${currentRate}% (목표 60%)`;
  let isRewardSuccess = false;

  if (totalMembers > 0) {
    if (totalMembers <= 30) {
      if (currentRate >= 60) { isRewardSuccess = true; rewardTitle = '🎉 커피 1잔 확보 성공!'; }
    } else if (totalMembers <= 50) {
      if (currentRate >= 60) { isRewardSuccess = true; rewardTitle = '🎉 커피 3잔 확보 성공!'; }
    } else {
      if (currentRate >= 60) { isRewardSuccess = true; rewardTitle = '🎉 커피 5잔 확보 성공!'; }
      else if (winnersCount >= 30) { isRewardSuccess = true; rewardTitle = '🎉 커피 5잔 확보 성공!'; rewardDesc = '출석 30명 달성 보너스!'; }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white shadow-sm border-b border-slate-200 px-4 py-4 mb-8 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          👑 {bandName}
        </h1>
        <button 
          onClick={downloadCSV}
          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
        >
          📥 엑셀(CSV) 다운
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {totalMembers > 0 && (
          <div className={`p-6 rounded-2xl shadow-sm border ${isRewardSuccess ? 'bg-yellow-50 border-yellow-300' : 'bg-slate-100 border-slate-300'}`}>
            <h2 className={`text-xl font-black mb-2 ${isRewardSuccess ? 'text-yellow-800' : 'text-slate-600'}`}>{rewardTitle}</h2>
            <p className={`font-bold ${isRewardSuccess ? 'text-yellow-700' : 'text-slate-500'}`}>{rewardDesc}</p>
            {!isRewardSuccess && (
              <p className="text-sm mt-2 text-slate-400 font-medium">※ 전체 인원({totalMembers}명)의 60% 이상이 20일 출석을 완료해야 방장님께 운영 지원용 기프티콘이 지급됩니다.</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 mb-1">현재 출석 인원</h3>
            <p className="text-3xl font-black text-slate-800">{stats.length}명</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-md text-white">
            <h3 className="text-sm font-bold text-indigo-100 mb-1">응모 달성자 (20일 이상)</h3>
            <p className="text-3xl font-black">{stats.filter(s => s.days >= 20).length}명</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">이번 달 출석 랭킹</h2>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 text-center text-slate-500">데이터를 불러오는 중...</div>
            ) : stats.length === 0 ? (
              <div className="p-10 text-center text-slate-500">아직 출석 기록이 없습니다.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="p-4 font-bold">순위</th>
                    <th className="p-4 font-bold">닉네임</th>
                    <th className="p-4 font-bold">누적 출석</th>
                    <th className="p-4 font-bold">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((user, idx) => {
                    const isWinner = user.days >= 20;
                    return (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="p-4 font-bold text-slate-800 text-lg flex items-center gap-2">
                          {user.name}
                          {isWinner && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded border border-yellow-200">응모달성</span>}
                        </td>
                        <td className="p-4 font-black text-indigo-600">{user.days}일</td>
                        <td className="p-4">
                          {isWinner ? (
                            <span className="text-green-600 font-bold text-sm">완료</span>
                          ) : (
                            <span className="text-slate-400 font-medium text-sm">{20 - user.days}일 남음</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
