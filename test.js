const http = require('http');

async function test() {
  console.log('--- 시뮬레이션 시작 ---');
  
  // 1. 아재개그(joke) 5번 클릭 시뮬레이션
  for (let i = 0; i < 5; i++) {
    const res = await fetch('http://localhost:3000/api/log-game-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'joke' })
    });
    console.log(`Click Joke ${i+1}:`, await res.json());
  }

  // 2. 피의 게임(brain) 3번 클릭 시뮬레이션
  for (let i = 0; i < 3; i++) {
    const res = await fetch('http://localhost:3000/api/log-game-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'brain' })
    });
    console.log(`Click Brain ${i+1}:`, await res.json());
  }

  // 3. 약간의 대기 후 통계 조회 API 호출
  setTimeout(async () => {
    const res = await fetch('http://localhost:3000/api/game-sponsors');
    const data = await res.json();
    console.log('\n--- 최종 스폰서 매핑 결과 ---');
    console.log(data);
    console.log('기대 결과: joke와 brain이 쿠팡이어야 함 (가장 많이 클릭됨)');
  }, 1000);
}

test();
