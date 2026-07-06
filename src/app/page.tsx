export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-8 text-center">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">제휴 마케팅 자동화 라우터 (The Brain)</h1>
      <p className="mb-8 text-gray-600">이 서버는 단축 링크를 처리하고 쿠키를 삽입하는 중앙 엔진입니다.</p>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="font-semibold mb-4 text-gray-800 border-b pb-2">작동 테스트 (Mock DB)</h2>
        <div className="space-y-4">
          <a href="/test1" className="block p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200">
            <span className="font-medium text-blue-600 block mb-1">테스트 링크 1 이동해보기</span>
            <span className="text-xs text-gray-500 break-all">경로: /test1</span>
          </a>
          <a href="/test2" className="block p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200">
            <span className="font-medium text-blue-600 block mb-1">테스트 링크 2 이동해보기</span>
            <span className="text-xs text-gray-500 break-all">경로: /test2</span>
          </a>
        </div>
      </div>
    </div>
  );
}
