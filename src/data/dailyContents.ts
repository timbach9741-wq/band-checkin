export interface DailyContent {
  id: number;
  category: 'mz' | 'brain' | 'balance' | 'joke';
  question: string;
  options?: string[]; // For MZ quiz (4 choices) or Balance game (2 choices)
  answer: string; // The correct answer or the result
  explanation?: string; // Explanation for the answer
}

export const dailyContents: DailyContent[] = [
  // MZ 신조어 퀴즈
  { id: 1, category: 'mz', question: "다음 중 '추구미'의 올바른 뜻은?", options: ["추운 겨울에 먹는 구이", "내가 추구하는 미(아름다움/이미지)", "추가로 구매하는 미역", "추잡하게 구는 사람"], answer: "내가 추구하는 미(아름다움/이미지)", explanation: "자신이 지향하고 쫓고자 하는 스타일이나 이미지를 뜻합니다. (예: 내 추구미는 시크함이야)" },
  { id: 2, category: 'mz', question: "'럭키비키'의 뜻으로 알맞은 것은?", options: ["행운의 강아지 이름", "운이 좋다는 뜻의 감탄사", "비키니 브랜드", "비가 오는 날의 행운"], answer: "운이 좋다는 뜻의 감탄사", explanation: "아이브 장원영의 초긍정적 사고방식(원영적 사고)에서 유래된 유행어로, '완전 럭키비키잖아!'처럼 쓰입니다." },
  { id: 3, category: 'mz', question: "'완내스'는 무슨 줄임말일까요?", options: ["완전 내 스타일", "완전 내 스피드", "완벽한 내 스코어", "완벽하게 내리는 스노우"], answer: "완전 내 스타일", explanation: "음식이나 옷, 사람 등이 자신의 취향에 완벽하게 맞을 때 사용하는 말입니다." },
  { id: 4, category: 'mz', question: "'오우야'를 요즘 표현으로 줄이면?", options: ["오우", "오야", "ㅗㅜㅑ", "우야"], answer: "ㅗㅜㅑ", explanation: "감탄사 '오우야'의 초성만 따서 시각적으로 표현한 밈입니다." },
  { id: 5, category: 'mz', question: "'분조카'는 어디를 말하는 것일까요?", options: ["분식집 조그만 카페", "분위기 좋은 카페", "분노 조절 카운슬러", "분당에 있는 조용한 카페"], answer: "분위기 좋은 카페", explanation: "인스타그램 감성의 분위기 좋고 사진 찍기 좋은 카페를 줄여서 부르는 말입니다." },
  { id: 6, category: 'mz', question: "'스불재'의 뜻은?", options: ["스스로 불러온 재앙", "스피드 불고기 재료", "스마트폰 불량 재시작", "스포일러 불법 재생"], answer: "스스로 불러온 재앙", explanation: "자신이 자초한 일로 인해 스스로 고통받는 상황을 자조적으로 이르는 말입니다." },
  { id: 7, category: 'mz', question: "'중꺾마'의 원래 의미는?", options: ["중간에 꺾이는 마음", "중요한 건 꺾이지 않는 마음", "중국 꺾고 마라톤 우승", "중고거래 꺾기 마스터"], answer: "중요한 건 꺾이지 않는 마음", explanation: "어떤 시련에도 포기하지 않는 강한 의지를 뜻하는 e스포츠 발 유행어입니다." },
  { id: 8, category: 'mz', question: "'식집사'의 뜻은?", options: ["식당에서 서빙하는 사람", "식물을 반려동물처럼 정성껏 키우는 사람", "식기세척기 집착하는 사람", "식빵에 집착하는 사람"], answer: "식물을 반려동물처럼 정성껏 키우는 사람", explanation: "반려동물을 키우는 사람을 '집사'라 부르듯, 반려식물을 정성껏 기르는 사람을 뜻합니다." },

  // 피의 게임 두뇌 퀴즈
  { id: 11, category: 'brain', question: "다음에 올 숫자는 무엇일까요? [ 1, 1, 2, 3, 5, 8, ? ]", answer: "13", explanation: "피보나치 수열입니다. 앞의 두 숫자를 더하면 다음 숫자가 됩니다. (5 + 8 = 13)" },
  { id: 12, category: 'brain', question: "어느 달에는 28일이 있습니다. 그렇다면 30일이 있는 달은 1년에 몇 개일까요?", answer: "11개", explanation: "2월을 제외한 모든 달(11개)은 최소 30일 이상을 가지고 있습니다." },
  { id: 13, category: 'brain', question: "뛰어가면서 치는 것은 무엇일까요?", answer: "심장", explanation: "달리기(뛰기)를 하면 심장이 강하게 뜁니다(칩니다)." },
  { id: 14, category: 'brain', question: "할아버지, 아버지, 아들이 같이 낚시를 갔습니다. 각자 한 마리씩 잡았는데, 총 물고기는 2마리입니다. 어떻게 된 일일까요?", answer: "할아버지, 아버지, 아들 총 2명입니다.", explanation: "할아버지의 아들은 아버지이고, 그 아버지의 아들이 아들이므로 총 3세대가 모인 2명의 사람(아버지이자 아들인 사람)이 포함되어 있습니다." },
  { id: 15, category: 'brain', question: "전진만 있고 후진은 없는 것은?", answer: "시간 (또는 나이)", explanation: "시간과 나이는 거꾸로 되돌릴 수 없습니다." },
  { id: 16, category: 'brain', question: "문은 문인데 닫지 못하는 문은?", answer: "소문", explanation: "입에서 입으로 전해지는 소문은 닫을 수 없습니다." },
  { id: 17, category: 'brain', question: "방 안에 초가 5개 켜져 있었습니다. 바람이 불어 2개가 꺼졌습니다. 다음 날 방에 남아있는 초는 몇 개일까요?", answer: "2개", explanation: "꺼지지 않은 3개는 다 타서 없어졌고, 바람에 꺼진 2개만 타다 남아있습니다." },
  { id: 18, category: 'brain', question: "다음에 올 알파벳은? [ O, T, T, F, F, S, S, E, N, ? ]", answer: "T", explanation: "숫자 1부터 10까지의 영어 앞글자입니다. (One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten)" },

  // 극악의 밸런스 게임
  { id: 21, category: 'balance', question: "당신의 선택은?", options: ["평생 양치 안 하고 살기 (대신 냄새 안남)", "평생 샤워 안 하고 살기 (대신 냄새 안남)"], answer: "통계 확인하기", explanation: "양치를 선택한 사람 45%, 샤워를 선택한 사람 55% (가상 통계)" },
  { id: 22, category: 'balance', question: "당신의 선택은?", options: ["100억 받고 스마트폰 평생 금지", "그냥 지금처럼 살기"], answer: "통계 확인하기", explanation: "100억 선택 62%, 그냥 살기 선택 38%" },
  { id: 23, category: 'balance', question: "어떤 초능력을 갖고 싶나요?", options: ["과거로 돌아가는 능력", "미래를 보는 능력"], answer: "통계 확인하기", explanation: "과거로 가기 48%, 미래 보기 52%" },
  { id: 24, category: 'balance', question: "어떤 회사가 더 나은가요?", options: ["연봉 3천만원, 주 3일제 칼퇴", "연봉 1억원, 주 6일제 야근 필수"], answer: "통계 확인하기", explanation: "주 3일제 70%, 주 6일제 30%" },
  { id: 25, category: 'balance', question: "더 견디기 힘든 상황은?", options: ["여름에 에어컨/선풍기 없이 살기", "겨울에 보일러/전기장판 없이 살기"], answer: "통계 확인하기", explanation: "여름 55%, 겨울 45%" },
  { id: 26, category: 'balance', question: "더 소름 돋는 능력은?", options: ["다른 사람의 속마음이 다 들림", "다른 사람이 언제 죽는지 보임"], answer: "통계 확인하기", explanation: "속마음 들림 40%, 언제 죽는지 보임 60%" },
  { id: 27, category: 'balance', question: "어떤 친구가 더 최악인가요?", options: ["돈 빌리고 안 갚는 친구", "내 뒷담화 하고 다니는 친구"], answer: "통계 확인하기", explanation: "돈 빌림 51%, 뒷담화 49%" },
  { id: 28, category: 'balance', question: "하나만 먹고 살아야 한다면?", options: ["평생 치킨만 먹기", "평생 라면만 먹기"], answer: "통계 확인하기", explanation: "치킨 35%, 라면 65%" },

  // 피식 아재개그
  { id: 31, category: 'joke', question: "세상에서 제일 가난한 왕은?", answer: "최저임금", explanation: "가장 낮은 임금을 의미하는 언어유희입니다." },
  { id: 32, category: 'joke', question: "신발이 화나면?", answer: "신발끈", explanation: "화가 나서 '끈'(끝)이 났다는 의미입니다." },
  { id: 33, category: 'joke', question: "아몬드가 죽으면?", answer: "다이아몬드", explanation: "죽다(Die) + 아몬드의 합성어입니다." },
  { id: 34, category: 'joke', question: "세상에서 가장 뜨거운 바다는?", answer: "열바다", explanation: "'열받아'와 발음이 비슷한 언어유희입니다." },
  { id: 35, category: 'joke', question: "바나나가 웃으면?", answer: "바나나킥", explanation: "과자 이름이기도 하며 웃음소리(킥킥)를 나타냅니다." },
  { id: 36, category: 'joke', question: "차를 발로 차면?", answer: "카놀라유", explanation: "차(Car)가 놀라유(놀랐어요)의 사투리 표현입니다." },
  { id: 37, category: 'joke', question: "소금의 유통기한은 언제까지일까?", answer: "천일염", explanation: "천 일(1000일) 염이라는 의미의 언어유희입니다." },
  { id: 38, category: 'joke', question: "왕이 넘어지면?", answer: "킹콩", explanation: "왕(King)이 '콩'하고 넘어졌다는 뜻입니다." }
];
