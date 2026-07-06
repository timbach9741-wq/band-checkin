'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function AdminDashboard() {
  const searchParams = useSearchParams();
  const bandId = searchParams.get('band');
  const password = searchParams.get('pw');
  
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    // 아주 간단한 비밀번호 인증 (고객님이 지정한 공용 비밀번호 '1234')
    if (!bandId || password !== '1234') {
      setAuthFailed(true);
      setIsLoading(false);
      return;
    }

    async function fetchStats() {
      const now = new Date();
      // 이번 달 1일 00시 00분부터 월말 자정까지
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('band_id', bandId)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      // 닉네임별로 그룹화하여 출석 횟수 계산
      const userStats = data.reduce((acc: any, log: any) => {
        if (!acc[log.nickname]) {
          acc[log.nickname] = { 
            name: log.nickname, 
            days: 0, 
            lastCheckIn: log.created_at 
          };
        }
        acc[log.nickname].days += 1;
        
        // 최신 출석일 업데이트
        if (new Date(log.created_at) > new Date(acc[log.nickname].lastCheckIn)) {
          acc[log.nickname].lastCheckIn = log.created_at;
        }
        return acc;
      }, {});

      // 배열로 변환 후 출석일수 랭킹순(내림차순)으로 정렬
      const sortedStats = Object.values(userStats).sort((a: any, b: any) => b.days - a.days);
      setStats(sortedStats);
      setIsLoading(false);
    }

    fetchStats();
  }, [bandId, password]);

  // 엑셀(CSV) 다운로드 기능
  const downloadCSV = () => {
    if (stats.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }
    
    // CSV 헤더
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // 한글 깨짐 방지 BOM
    csvContent += '순위,닉네임,누적출석일,최근출석시간,상태\n';
    
    // CSV 데이터
    stats.forEach((user, index) => {
      const isWinner = user.days >= 20;
      const date = new Date(user.lastCheckIn);
      const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      const status = isWinner ? '달성 완료' : `${20 - user.days}일 남음`;
      
      const row = `${index + 1},${user.name},${user.days}일,${formattedDate},${status}`;
      csvContent += row + '\n';
    });
    
    // 다운로드 트리거
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-sm w-full">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-500 text-sm">올바른 밴드 아이디와 비밀번호가 포함된 링크로 접속해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] p-4 md:p-8 font-sans pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 상단 헤더 */}
        <header className="bg-white p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>👑</span> 밴드 관리자 대시보드
            </h1>
            <p className="text-gray-500 mt-2 font-medium text-lg">
              현재 밴드: <span className="text-[#03c75a] font-black bg-[#e8f9ec] px-3 py-1 rounded-lg ml-1">{bandId}</span>
            </p>
          </div>
          <button 
            onClick={downloadCSV}
            className="mt-4 md:mt-0 bg-[#03c75a] hover:bg-[#02b350] active:scale-95 transition-all text-white px-5 py-3 rounded-2xl font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            📥 엑셀(CSV) 다운로드
          </button>
        </header>

        {/* 랭킹 표 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-2xl font-extrabold text-gray-800">이달의 출석 우수자 랭킹 🏆</h2>
            <p className="text-base text-gray-500 mt-2 font-medium">20일 이상 출석자는 커피 쿠폰 대상자로 자동 분류됩니다.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white text-gray-400 text-sm border-b-2 border-gray-100">
                  <th className="p-5 font-bold text-center w-20">순위</th>
                  <th className="p-5 font-bold text-lg">회원 닉네임</th>
                  <th className="p-5 font-bold text-center w-32">누적 출석일</th>
                  <th className="p-5 font-bold text-center w-40">최근 출석 시간</th>
                  <th className="p-5 font-bold text-center w-40">미션 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold text-lg">데이터를 불러오는 중입니다...</td>
                  </tr>
                ) : stats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold text-lg">이번 달 출석 기록이 없습니다.</td>
                  </tr>
                ) : (
                  stats.map((user, index) => {
                    const isWinner = user.days >= 20;
                    const date = new Date(user.lastCheckIn);
                    const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    
                    return (
                      <tr key={user.name} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5 text-center">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-lg ${index < 3 ? 'bg-[#03c75a] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-5 font-black text-gray-800 text-xl">{user.name}</td>
                        <td className="p-5 text-center">
                          <span className={`text-2xl font-black ${isWinner ? 'text-[#03c75a]' : 'text-gray-700'}`}>
                            {user.days}<span className="text-sm font-medium text-gray-400 ml-1">일</span>
                          </span>
                        </td>
                        <td className="p-5 text-center text-gray-400 text-base font-bold">{formattedDate}</td>
                        <td className="p-5 text-center">
                          {isWinner ? (
                            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-black border border-yellow-200 shadow-sm inline-block w-full">
                              🎉 달성 완료
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-bold inline-block w-full">
                              {20 - user.days}일 남음
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
