'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Mock DB for Phase 1 testing
const MOCK_DB: Record<string, { destinationUrl: string, affiliateUrl: string, title: string }> = {
  'test1': {
    destinationUrl: 'https://www.youtube.com',
    affiliateUrl: 'https://coupa.ng/mock-link-1', // Mock 쿠팡 링크
    title: '유용한 엑셀 단축키 모음 PDF'
  },
  'test2': {
    destinationUrl: 'https://www.naver.com',
    affiliateUrl: 'https://adpick.co.kr/mock-link-2',
    title: '충격적인 결말 확인하기'
  }
};

export default function RedirectPage() {
  const params = useParams();
  const id = params.id as string;
  const data = MOCK_DB[id];

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 0.8초 동안 안전성 검사(로딩) 연출
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (!data) return;
    
    // 1. 팝업 차단을 피하기 위해 사용자 '클릭' 시 제휴 링크 새 창(또는 앱) 열기 -> 쿠키 생성
    window.open(data.affiliateUrl, '_blank');
    
    // 2. 현재 창은 사용자가 원했던 진짜 목적지로 이동
    window.location.href = data.destinationUrl;
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <h1 className="text-xl font-bold">유효하지 않거나 만료된 링크입니다.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isLoading ? '안전하게 이동 중입니다...' : '로딩 완료!'}
        </h1>
        
        <p className="text-gray-500">
          요청하신 <span className="font-semibold text-blue-600">[{data.title}]</span> 페이지로 연결합니다.
        </p>

        {isLoading ? (
          <button 
            disabled
            className="w-full py-4 px-6 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed transition-all"
          >
            서버 응답 대기 중...
          </button>
        ) : (
          <button 
            onClick={handleContinue}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105 active:scale-95"
          >
            내용 확인하기 (이동)
          </button>
        )}
        
        <p className="text-xs text-gray-400 mt-4">
          * 이 페이지는 보안 검사를 통과한 안전한 링크입니다.
        </p>
      </div>
    </div>
  );
}
