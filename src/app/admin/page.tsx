'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function AdminDashboard() {
  const searchParams = useSearchParams();
  const bandId = searchParams.get('band');
  const [bandName, setBandName] = useState(bandId ? bandId.split('-').slice(0, -1).join(' ') : '방');
  
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

    const validData = data.filter((log: any) => !log.nickname.startsWith('___CONFIG:') && !log.nickname.startsWith('___TARGET:') && !log.nickname.startsWith('___MARQUEE:'));

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
        </div>
      </div>
    );
  }

  // 관리자 대시보드 UI (인증 성공)
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white shadow-sm border-b border-slate-200 px-4 py-5 mb-8 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">👑 {bandName} 대시보드</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
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
