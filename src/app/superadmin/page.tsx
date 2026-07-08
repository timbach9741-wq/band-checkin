'use client';

import { useState } from 'react';

export default function SuperadminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [bands, setBands] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalBands: 0, totalUsers: 0, totalWinners: 0, month: '' });
  const [expandedBand, setExpandedBand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);

  const fetchBands = async (pw: string, offset: number = 0) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/superadmin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetchDashboard', password: pw, payload: { monthOffset: offset } })
      });
      const data = await res.json();
      if (res.ok) {
        setBands(data.bands || []);
        setSummary(data.summary || {});
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
        fetchBands(password, 0);
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
      if (res.ok) { alert('차단되었습니다.'); fetchBands(password, monthOffset); }
      else alert('차단 실패');
    } catch (e) { alert('오류 발생'); }
  };

  const handleUnban = async (bandId: string) => {
    if (!confirm('이 방의 차단을 해제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/superadmin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban', password, payload: { bandId } })
      });
      if (res.ok) { alert('차단이 해제되었습니다.'); fetchBands(password, monthOffset); }
      else alert('해제 실패');
    } catch (e) { alert('오류 발생'); }
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
      if (res.ok) alert('전광판에 송출되었습니다!\n\n송출 문구:\n' + data.text);
      else alert('송출 실패');
    } catch (e) { alert('오류 발생'); }
  };

  const handleMonthChange = (offset: number) => {
    setMonthOffset(offset);
    fetchBands(password, offset);
  };

  const downloadCSV = (band?: any) => {
    const targetBands = band ? [band] : bands;
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += '모임이름,플랫폼,닉네임,누적출석일,최근출석시간,상태\n';
    
    targetBands.forEach((b: any) => {
      if (b.users && b.users.length > 0) {
        b.users.forEach((u: any) => {
          const date = new Date(u.lastCheckIn);
          const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
          const status = u.days >= 20 ? '달성 완료' : `${20 - u.days}일 남음`;
          csvContent += `${b.bandName},${b.platform},${u.name},${u.days}일,${formattedDate},${status}\n`;
        });
      }
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', band ? `${band.bandName}_출석통계.csv` : `전체_출석통계_${summary.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBands = bands.filter(b => 
    b.bandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.platform?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMonthLabel = (offset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  };

  // ========== LOGIN SCREEN ==========
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <span className="text-3xl">🛡️</span>
          </div>
          <h2 className="text-white text-2xl font-black mb-2">총괄 마스터 로그인</h2>
          <p className="text-slate-400 text-sm mb-8">안전한 데이터 엑세스를 위해 마스터 암호를 입력하세요.</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-4 text-white text-center tracking-widest focus:outline-none focus:border-indigo-500 transition-colors mb-4 font-mono"
            placeholder="마스터 암호" />
          {errorMsg && <p className="text-red-400 text-sm mb-4 font-bold">{errorMsg}</p>}
          <button type="submit" disabled={isLoading || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors">
            {isLoading ? '인증 중...' : '로그인'}
          </button>
        </form>
      </div>
    );
  }

  // ========== DASHBOARD ==========
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-xl px-6 py-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>🛡️</span> 총괄 마스터 컨트롤 타워
            </h1>
            <p className="text-slate-400 text-sm mt-1">모든 방의 통계 및 이벤트를 통제합니다.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => downloadCSV()} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-bold text-sm border border-emerald-500 transition-colors hidden md:block">
              📥 전체 CSV
            </button>
            <button onClick={() => fetchBands(password, monthOffset)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold text-sm border border-slate-700 transition-colors">
              새로고침
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6 mt-4">

        {/* 통계 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">총 방 수</h3>
            <p className="text-3xl font-black text-slate-800">{summary.totalBands}<span className="text-base font-bold text-slate-400 ml-1">개</span></p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">총 활동 유저</h3>
            <p className="text-3xl font-black text-indigo-600">{summary.totalUsers}<span className="text-base font-bold text-slate-400 ml-1">명</span></p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-md text-white">
            <h3 className="text-xs font-bold text-indigo-100 mb-1 uppercase tracking-wider">20일 달성자</h3>
            <p className="text-3xl font-black">{summary.totalWinners}<span className="text-base font-bold text-indigo-200 ml-1">명</span></p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">조회 기간</h3>
            <p className="text-lg font-black text-slate-800">{summary.month}</p>
          </div>
        </div>

        {/* 월별 선택 + 검색 */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
            <button onClick={() => handleMonthChange(monthOffset - 1)} className="px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">◀ 이전달</button>
            <span className="px-4 py-2 text-sm font-black text-indigo-600 bg-indigo-50 rounded-lg">{getMonthLabel(monthOffset)}</span>
            <button onClick={() => handleMonthChange(monthOffset + 1)} disabled={monthOffset >= 0}
              className="px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">다음달 ▶</button>
          </div>
          
          <div className="relative w-full md:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="방 이름 또는 플랫폼 검색..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-400 transition-colors" />
          </div>
        </div>

        {/* 방 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-black text-slate-800">전체 생성 방 목록 ({filteredBands.length}개)</h2>
            <button onClick={() => downloadCSV()} className="text-sm font-bold text-emerald-600 hover:text-emerald-500 md:hidden">📥 CSV</button>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 text-center text-slate-500 font-bold">데이터를 불러오는 중...</div>
            ) : filteredBands.length === 0 ? (
              <div className="p-10 text-center text-slate-500">{searchQuery ? '검색 결과가 없습니다.' : '방이 존재하지 않습니다.'}</div>
            ) : (
              <div>
                {filteredBands.map((band, idx) => (
                  <div key={idx} className={`border-b border-slate-100 ${band.banned ? 'bg-red-50/50' : ''}`}>
                    {/* 방 요약 행 (클릭 가능) */}
                    <div 
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedBand(expandedBand === band.bandId ? null : band.bandId)}
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        {band.banned ? (
                          <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs">차단됨</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-xs">정상</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-base flex items-center gap-2">
                          {band.bandName}
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">{band.platform}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{band.contactInfo}</div>
                      </div>

                      <div className="flex-shrink-0 text-center w-20">
                        <span className={`text-xl font-black ${band.participationRate < 10 ? 'text-red-500' : 'text-indigo-600'}`}>
                          {band.participationRate}%
                        </span>
                        <div className="text-[10px] text-slate-400">{band.activeMembers} / {band.totalMembers}명</div>
                      </div>

                      <div className="flex-shrink-0 w-20 text-center">
                        {band.winners?.length > 0 ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded border border-yellow-200">🎁 {band.winners.length}명</span>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-slate-400 text-lg font-bold">
                        {expandedBand === band.bandId ? '▲' : '▼'}
                      </div>
                    </div>

                    {/* 아코디언: 상세 유저 랭킹 */}
                    {expandedBand === band.bandId && (
                      <div className="bg-slate-50 border-t border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* 방 컨트롤 버튼들 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {band.banned ? (
                            <button onClick={(e) => { e.stopPropagation(); handleUnban(band.bandId); }}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              ✅ 차단 해제
                            </button>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); handleBan(band.bandId); }}
                              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              🛑 혜택 중단
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); downloadCSV(band); }}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            📥 이 방 CSV
                          </button>
                        </div>

                        {/* 달성자 전광판 송출 영역 */}
                        {band.winners && band.winners.length > 0 && (
                          <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 mb-4">
                            <p className="text-xs font-bold text-yellow-800 mb-2">🎁 20일 달성자 ({band.winners.length}명) — 클릭하여 전광판 송출</p>
                            <div className="flex flex-wrap gap-2">
                              {band.winners.map((w: any, i: number) => (
                                <button key={i} onClick={() => handleReward(band.bandName, w.name)}
                                  className="bg-indigo-600 text-white hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors">
                                  📢 {w.name} ({w.days}일)
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 유저별 출석 랭킹 테이블 */}
                        {band.users && band.users.length > 0 ? (
                          <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden border border-slate-200">
                            <thead>
                              <tr className="bg-slate-100 text-slate-500 text-xs border-b border-slate-200">
                                <th className="p-3 font-bold">순위</th>
                                <th className="p-3 font-bold">닉네임</th>
                                <th className="p-3 font-bold text-center">누적 출석</th>
                                <th className="p-3 font-bold">최근 출석</th>
                                <th className="p-3 font-bold text-center">상태</th>
                              </tr>
                            </thead>
                            <tbody>
                              {band.users.map((user: any, uidx: number) => {
                                const isWinner = user.days >= 20;
                                const date = new Date(user.lastCheckIn);
                                const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
                                return (
                                  <tr key={uidx} className={`border-b border-slate-100 text-sm ${isWinner ? 'bg-yellow-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="p-3 text-slate-400 font-bold">{uidx + 1}</td>
                                    <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                                      {user.name}
                                      {isWinner && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded border border-yellow-200 font-black">👑 달성</span>}
                                    </td>
                                    <td className="p-3 font-black text-indigo-600 text-center">{user.days}일</td>
                                    <td className="p-3 text-slate-500 text-xs">{formattedDate}</td>
                                    <td className="p-3 text-center">
                                      {isWinner ? (
                                        <span className="text-green-600 font-bold text-xs">✅ 완료</span>
                                      ) : (
                                        <span className="text-slate-400 text-xs">{20 - user.days}일 남음</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center text-slate-400 text-sm py-6 bg-white rounded-xl border border-slate-200">아직 출석 기록이 없습니다.</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
