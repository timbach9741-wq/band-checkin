'use client';

import { useState } from 'react';

export default function SuperadminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [bands, setBands] = useState<any[]>([]);

  const fetchBands = async (pw: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/superadmin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetchDashboard', password: pw })
      });
      const data = await res.json();
      if (res.ok) {
        setBands(data.bands || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/superadmin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsAuthenticated(true);
        fetchBands(password);
      } else {
        setErrorMsg(data.error || '인증 실패');
        setIsLoading(false);
      }
    } catch (e) {
      setErrorMsg('서버 오류');
      setIsLoading(false);
    }
  };

  const handleBan = async (bandId: string) => {
    if (!confirm('이 방을 영구 차단하시겠습니까? (이벤트 혜택 중단)')) return;
    
    try {
      const res = await fetch('/api/superadmin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', password, payload: { bandId } })
      });
      if (res.ok) {
        alert('차단되었습니다.');
        fetchBands(password);
      } else {
        alert('차단 실패');
      }
    } catch (e) {
      alert('오류 발생');
    }
  };

  const handleReward = async (bandName: string, nickname: string) => {
    if (!confirm(`'${nickname}'님을 당첨자로 선정하고 전광판에 띄우시겠습니까?`)) return;
    
    try {
      const res = await fetch('/api/superadmin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reward', password, payload: { bandName, nickname } })
      });
      const data = await res.json();
      if (res.ok) {
        alert('전광판에 송출되었습니다!\n\n송출 문구:\n' + data.text);
      } else {
        alert('송출 실패');
      }
    } catch (e) {
      alert('오류 발생');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <span className="text-3xl">🛡️</span>
          </div>
          <h2 className="text-white text-2xl font-black mb-2">총괄 마스터 로그인</h2>
          <p className="text-slate-400 text-sm mb-8">안전한 데이터 엑세스를 위해 마스터 암호를 입력하세요.</p>
          
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-4 text-white text-center tracking-widest focus:outline-none focus:border-indigo-500 transition-colors mb-4 font-mono"
            placeholder="마스터 암호"
          />
          
          {errorMsg && <p className="text-red-400 text-sm mb-4 font-bold">{errorMsg}</p>}
          
          <button 
            type="submit" 
            disabled={isLoading || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors"
          >
            {isLoading ? '인증 중...' : '로그인'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-slate-900 text-white shadow-xl px-6 py-6 mb-8 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>🛡️</span> 총괄 마스터 컨트롤 타워
          </h1>
          <p className="text-slate-400 text-sm mt-1">모든 방의 통계 및 이벤트를 통제합니다.</p>
        </div>
        <button onClick={() => fetchBands(password)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold text-sm border border-slate-700 transition-colors">
          새로고침
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-black text-slate-800">전체 생성 방 목록 ({bands.length}개)</h2>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 text-center text-slate-500 font-bold">데이터를 불러오는 중...</div>
            ) : bands.length === 0 ? (
              <div className="p-10 text-center text-slate-500">방이 존재하지 않습니다.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-500 text-sm border-b border-slate-200">
                    <th className="p-4 font-bold">상태</th>
                    <th className="p-4 font-bold">모임 이름 (플랫폼)</th>
                    <th className="p-4 font-bold text-center">참여율</th>
                    <th className="p-4 font-bold">연락처/카톡ID</th>
                    <th className="p-4 font-bold">20일 달성자 및 통제</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bands.map((band, idx) => (
                    <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${band.banned ? 'bg-red-50/50' : ''}`}>
                      <td className="p-4">
                        {band.banned ? (
                          <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs">차단됨</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-xs">정상</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-base">{band.bandName}</div>
                        <div className="text-slate-400 text-xs mt-1 uppercase tracking-wider">{band.platform}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-xl font-black ${band.participationRate < 10 ? 'text-red-500' : 'text-indigo-600'}`}>
                            {band.participationRate}%
                          </span>
                          <span className="text-xs text-slate-500 mt-1">{band.activeMembers}명 / {band.totalMembers}명</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {band.contactInfo}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          {!band.banned && (
                            <button onClick={() => handleBan(band.bandId)} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              🛑 혜택 중단
                            </button>
                          )}
                          
                          {band.winners && band.winners.length > 0 ? (
                            <div className="mt-2 bg-yellow-50 p-3 rounded-xl border border-yellow-200 w-full">
                              <p className="text-xs font-bold text-yellow-800 mb-2">🎁 당첨자 명단 ({band.winners.length}명)</p>
                              <div className="flex flex-wrap gap-2">
                                {band.winners.map((w: any, i: number) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-slate-700 bg-white px-2 py-1 rounded border border-yellow-200">{w.name} ({w.days}일)</span>
                                    {!band.banned && (
                                      <button 
                                        onClick={() => handleReward(band.bandName, w.name)}
                                        className="bg-indigo-600 text-white hover:bg-indigo-500 px-2 py-1 rounded text-xs font-bold shadow-sm"
                                      >
                                        전광판 송출
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 mt-2">달성자 없음</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
