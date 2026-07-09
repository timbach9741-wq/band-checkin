export type DailyContent = {
  id: string;
  category: 'mz' | 'brain' | 'balance' | 'joke';
  title: string;
  description: string;
  options?: string[]; // 퀴즈의 경우 보기 제공
  answer: string;
  explanation?: string;
};

export const dailyContents: DailyContent[] = [
  // MZ 신조어 퀴즈 (16개)
  { id: 'mz1', category: 'mz', title: 'MZ 신조어 영역', description: '다음 중 "분조카"의 올바른 뜻은?', options: ['분노 조절 카페', '분위기 좋은 카페', '분식집 떡볶이 카레', '분명히 조용했던 카페'], answer: '분위기 좋은 카페' },
  { id: 'mz2', category: 'mz', title: 'MZ 신조어 영역', description: '"스불재"는 무슨 줄임말일까?', options: ['스스로 불러온 재앙', '스마트폰 불량 재시작', '스크린 불빛 재난', '스스로 불태운 재산'], answer: '스스로 불러온 재앙' },
  { id: 'mz3', category: 'mz', title: 'MZ 신조어 영역', description: '"알잘딱깔센"의 올바른 뜻은?', options: ['알아서 잘 딱 깔끔하고 센스있게', '알고보니 잘생긴 딱 내스타일 센터', '알람 잘 딱 깔고 센스있게', '알뜰하고 잘게 딱 깔끔한 센터'], answer: '알아서 잘 딱 깔끔하고 센스있게' },
  { id: 'mz4', category: 'mz', title: 'MZ 신조어 영역', description: '"점메추"의 뜻은?', options: ['점심 메뉴 추천', '점점 메말라가는 추억', '점수 메기는 추천', '점심 메이트 추천'], answer: '점심 메뉴 추천' },
  { id: 'mz5', category: 'mz', title: 'MZ 신조어 영역', description: '"갓생"이란 어떤 의미일까?', options: ['신(God)처럼 완벽한 생물', '부지런하고 모범적인 삶', '막 태어난 생명', '갓 구운 생선'], answer: '부지런하고 모범적인 삶' },
  { id: 'mz6', category: 'mz', title: 'MZ 신조어 영역', description: '"킹받네"의 올바른 의미는?', options: ['왕에게 상을 받네', '진짜 너무 열받네', '최고의 선물을 받네', '왕이 되어버렸네'], answer: '진짜 너무 열받네 (킹=King을 강조어로 사용)' },
  { id: 'mz7', category: 'mz', title: 'MZ 신조어 영역', description: '"완내스"의 뜻은?', options: ['완전 내 스타일', '완벽한 내 스토리', '완전 내 스케줄', '완전히 내버린 스레기'], answer: '완전 내 스타일' },
  { id: 'mz8', category: 'mz', title: 'MZ 신조어 영역', description: '"억텐"은 무슨 줄임말일까?', options: ['억지 텐션', '억울한 텐션', '억대의 텐트', '억지로 텐(10) 만들기'], answer: '억지 텐션 (억지로 분위기 맞춤)' },
  { id: 'mz9', category: 'mz', title: 'MZ 신조어 영역', description: '"폼 미쳤다"의 뜻은?', options: ['거품이 너무 많다', '기량이나 상태가 최고조다', '폼클렌징이 좋다', '포즈가 이상하다'], answer: '기량이나 상태가 최고조다' },
  { id: 'mz10', category: 'mz', title: 'MZ 신조어 영역', description: '"군침 싹 도노"에 어울리는 이모티콘 캐릭터는?', options: ['루피(잔망루피)', '뽀로로', '펭수', '춘식이'], answer: '루피 (잔망루피)' },
  { id: 'mz11', category: 'mz', title: 'MZ 신조어 영역', description: '"중꺾마"의 뜻은?', options: ['중간에 꺾이는 마술', '중요한 것은 꺾이지 않는 마음', '중고차 꺾어 팔기 마스터', '중간고사 꺾인 마음'], answer: '중요한 것은 꺾이지 않는 마음' },
  { id: 'mz12', category: 'mz', title: 'MZ 신조어 영역', description: '"너 T야?" 라는 질문의 의도는?', options: ['너 티셔츠 샀어?', '너 너무 감정 없이 이성적이야?', '너 통신사 SKT야?', '너 차(Tea) 마실래?'], answer: '너 너무 감정 없이 이성적이야? (MBTI의 T)' },
  { id: 'mz13', category: 'mz', title: 'MZ 신조어 영역', description: '"오운완"의 뜻은?', options: ['오늘의 운세 완벽', '오늘 운동 완료', '오랜만에 운전 완료', '오전 운동 완료'], answer: '오늘 운동 완료' },
  { id: 'mz14', category: 'mz', title: 'MZ 신조어 영역', description: '"캘박"의 뜻은?', options: ['캘린더 박제(일정 등록)', '캘리포니아 박씨', '캘리그라피 박람회', '캘린더 박살'], answer: '캘린더 박제 (일정을 달력에 저장함)' },
  { id: 'mz15', category: 'mz', title: 'MZ 신조어 영역', description: '"당모치"의 올바른 뜻은?', options: ['당연히 모든 치킨은 옳다', '당장 모여 치킨 먹자', '당연히 모양은 치즈', '당분간 모임 취소'], answer: '당연히 모든 치킨은 옳다' },
  { id: 'mz16', category: 'mz', title: 'MZ 신조어 영역', description: '"자만추"의 뜻은?', options: ['자신만만한 추억', '자장면 만두 추가', '자연스러운 만남 추구', '자고로 만남은 추워야'], answer: '자연스러운 만남 추구' },

  // 피의 게임 두뇌 퀴즈 (16개)
  { id: 'br1', category: 'brain', title: '피의 게임 두뇌 영역', description: '5대의 기계가 5개의 장난감을 만드는데 5분이 걸린다. 100대의 기계가 100개의 장난감을 만드는데 몇 분이 걸릴까?', options: ['1분', '5분', '20분', '100분'], answer: '5분 (기계 1대가 장난감 1개를 만드는데 5분이 걸리므로)' },
  { id: 'br2', category: 'brain', title: '피의 게임 두뇌 영역', description: '어떤 달은 31일이 있고, 어떤 달은 30일이 있다. 28일이 있는 달은 몇 개일까?', options: ['1개', '4개', '6개', '12개'], answer: '12개 (모든 달에는 최소 28일이 포함되어 있다)' },
  { id: 'br3', category: 'brain', title: '피의 게임 두뇌 영역', description: '달리기 경주에서 2등을 추월했다. 당신은 지금 몇 등인가?', options: ['1등', '2등', '3등', '꼴찌'], answer: '2등 (2등의 자리를 빼앗았으므로)' },
  { id: 'br4', category: 'brain', title: '피의 게임 두뇌 영역', description: '철수의 아빠에게는 3명의 아들이 있다. 첫째의 이름은 원, 둘째의 이름은 투 이다. 셋째의 이름은 무엇일까?', options: ['쓰리', '포', '철수', '모름'], answer: '철수' },
  { id: 'br5', category: 'brain', title: '피의 게임 두뇌 영역', description: '1부터 100까지의 숫자 중에서 숫자 "8"은 총 몇 번 나올까?', options: ['10번', '11번', '19번', '20번'], answer: '20번 (8, 18.. 80, 81~89, 98. 특히 88은 두 번!)' },
  { id: 'br6', category: 'brain', title: '피의 게임 두뇌 영역', description: '어제는 내일의 모레이다. 오늘은 무슨 요일인가? (문제가 논리적으로 성립하는 요일)', options: ['월요일', '수요일', '금요일', '말이 안 되는 문장이다'], answer: '말이 안 되는 문장이다 (어제는 내일의 모레가 될 수 없음)' },
  { id: 'br7', category: 'brain', title: '피의 게임 두뇌 영역', description: 'A와 B가 체스를 5판 두었는데, 둘 다 3판씩 이겼다. 어떻게 가능할까?', options: ['둘 다 천재다', '무승부가 있었다', '서로 다른 사람과 두었다', '규칙을 어겼다'], answer: '서로 다른 사람과 체스를 두었다' },
  { id: 'br8', category: 'brain', title: '피의 게임 두뇌 영역', description: '성냥개비 3개로 4를 만드는 가장 쉬운 방법은?', options: ['성냥을 부러뜨린다', '로마 숫자 IV를 만든다', '숫자 4모양을 만든다', '사각형을 만든다'], answer: '로마 숫자 IV를 만든다' },
  { id: 'br9', category: 'brain', title: '피의 게임 두뇌 영역', description: '거울에 비친 아날로그 시계가 3시 15분을 가리키고 있다. 실제 시간은?', options: ['3시 15분', '8시 45분', '9시 15분', '2시 45분'], answer: '8시 45분' },
  { id: 'br10', category: 'brain', title: '피의 게임 두뇌 영역', description: '비가 오는 날 기차 안에서 창밖을 보니 소가 엎드려 있었다. 왜 엎드려 있었을까?', options: ['피곤해서', '비 피하려고', '풀 먹으려고', '네 다리가 바닥에 닿아있으니까'], answer: '소가 서있는지 엎드려있는지는 다리 모양을 봐야 안다 (넌센스)' },
  { id: 'br11', category: 'brain', title: '피의 게임 두뇌 영역', description: '앞에서 읽으나 뒤에서 읽으나 똑같은 단어가 아닌 것은?', options: ['기러기', '토마토', '우영우', '오디오'], answer: '오디오 (오디오 -> 오디오)' },
  { id: 'br12', category: 'brain', title: '피의 게임 두뇌 영역', description: '10명의 사람이 방에 있다. 모두가 서로 한 번씩 악수를 한다면 총 악수 횟수는?', options: ['10번', '45번', '50번', '90번'], answer: '45번 (n(n-1)/2 공식을 적용)' },
  { id: 'br13', category: 'brain', title: '피의 게임 두뇌 영역', description: '물고기 10마리가 어항에 있다. 2마리가 익사했고, 3마리가 헤엄쳐 도망갔고, 4마리가 죽었다. 어항에는 몇 마리가 남았을까?', options: ['1마리', '5마리', '6마리', '10마리'], answer: '10마리 (물고기는 익사할 수 없고 도망갈 곳도 없으며, 죽은 물고기도 어항 안에 있다)' },
  { id: 'br14', category: 'brain', title: '피의 게임 두뇌 영역', description: '무게가 같은 동전 8개와 무거운 가짜 동전 1개가 있다. 양팔저울을 최소 몇 번 사용해야 가짜를 찾을 수 있을까?', options: ['2번', '3번', '4번', '8번'], answer: '2번 (3개씩 묶어 달아본다)' },
  { id: 'br15', category: 'brain', title: '피의 게임 두뇌 영역', description: '아빠 개구리가 "개굴개굴", 엄마 개구리가 "개굴개굴" 운다. 아기 개구리는?', options: ['개굴개굴', '올챙이는 울지 않는다', '개굴', '안 운다'], answer: '올챙이는 울지 않는다' },
  { id: 'br16', category: 'brain', title: '피의 게임 두뇌 영역', description: '눈이 녹으면 무엇이 될까?', options: ['물', '봄', '얼음', '눈물'], answer: '봄 (감성적인 정답)' },

  // 극악의 밸런스 게임 (16개)
  { id: 'ba1', category: 'balance', title: '극악의 밸런스 영역', description: '둘 중 하나만 선택해야 한다면?', options: ['평생 양치 안 하기', '평생 샤워 안 하기'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba2', category: 'balance', title: '극악의 밸런스 영역', description: '둘 중 하나를 겪어야 한다면?', options: ['10년 전 과거로 가서 다시 살기', '10년 후 미래로 훌쩍 건너뛰기'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba3', category: 'balance', title: '극악의 밸런스 영역', description: '친구와 약속을 잡는다면?', options: ['매번 30분씩 지각하는 친구', '매번 30분 일찍 와서 재촉하는 친구'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba4', category: 'balance', title: '극악의 밸런스 영역', description: '둘 중 하나의 능력을 가질 수 있다면?', options: ['투명인간 되기', '순간이동 하기'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba5', category: 'balance', title: '극악의 밸런스 영역', description: '요즘 더 스트레스 받는 상황은?', options: ['배터리 1%인데 충전기 없음', '와이파이 풀칸인데 인터넷 안 됨'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba6', category: 'balance', title: '극악의 밸런스 영역', description: '둘 중 평생 하나만 먹어야 한다면?', options: ['평생 밀가루 없이 살기', '평생 고기 없이 살기'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba7', category: 'balance', title: '극악의 밸런스 영역', description: '둘 중 하나의 초능력을 가진다면?', options: ['과거의 나에게 10초 통화하기', '미래의 나에게 10초 통화하기'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba8', category: 'balance', title: '극악의 밸런스 영역', description: '더 최악의 이별 통보는?', options: ['카톡으로 이별 통보받기', '환승 이별 당하기'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba9', category: 'balance', title: '극악의 밸런스 영역', description: '둘 중 하나만 가능하다면?', options: ['평생 여름 (에어컨 있음)', '평생 겨울 (히터 있음)'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba10', category: 'balance', title: '극악의 밸런스 영역', description: '더 화나는 상황은?', options: ['내가 한 말 계속 까먹는 애인', '내 말에 매번 꼬투리 잡는 애인'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba11', category: 'balance', title: '극악의 밸런스 영역', description: '둘 중 평생 입어야 할 옷은?', options: ['한겨울에 반팔 입기', '한여름에 패딩 입기'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba12', category: 'balance', title: '극악의 밸런스 영역', description: '환생한다면 무엇으로?', options: ['돈 많은 백수 고양이', '월 1000만 원 버는 직장인'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba13', category: 'balance', title: '극악의 밸런스 영역', description: '무인도에 한 가지만 가져간다면?', options: ['무한 배터리 스마트폰 (통신불가)', '생존 전문가 1명'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba14', category: 'balance', title: '극악의 밸런스 영역', description: '더 참을 수 없는 직장 동료는?', options: ['일은 잘하는데 성격 파탄자', '성격은 천사인데 일 못하는 민폐'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba15', category: 'balance', title: '극악의 밸런스 영역', description: '둘 중 하나를 포기해야 한다면?', options: ['평생 라면 끊기', '평생 치킨 끊기'], answer: '정답은 없습니다! 당신의 선택은?' },
  { id: 'ba16', category: 'balance', title: '극악의 밸런스 영역', description: '만약 100억이 생긴다면?', options: ['아무에게도 안 알리고 숨어살기', '동네방네 자랑하고 유명해지기'], answer: '정답은 없습니다! 당신의 선택은?' },

  // 피식 아재개그 (16개)
  { id: 'jo1', category: 'joke', title: '피식 아재개그', description: '왕이 넘어지면 뭐라고 할까?', answer: '킹콩' },
  { id: 'jo2', category: 'joke', title: '피식 아재개그', description: '신발이 화가 나면?', answer: '신발끈' },
  { id: 'jo3', category: 'joke', title: '피식 아재개그', description: '소나무가 삐지면?', answer: '칫솔' },
  { id: 'jo4', category: 'joke', title: '피식 아재개그', description: '전화기로 세운 건물은?', answer: '콜로세움' },
  { id: 'jo5', category: 'joke', title: '피식 아재개그', description: '우유가 넘어지면?', answer: '아야' },
  { id: 'jo6', category: 'joke', title: '피식 아재개그', description: '딸기가 도망가면?', answer: '딸기쨈 (딸기가 째앰!)' },
  { id: 'jo7', category: 'joke', title: '피식 아재개그', description: '소가 번개에 맞아 죽으면?', answer: '우적' },
  { id: 'jo8', category: 'joke', title: '피식 아재개그', description: '바나나가 웃으면?', answer: '바나나킥' },
  { id: 'jo9', category: 'joke', title: '피식 아재개그', description: '차를 발로 차면?', answer: '카톡' },
  { id: 'jo10', category: 'joke', title: '피식 아재개그', description: '세상에서 가장 가난한 왕은?', answer: '최저임금' },
  { id: 'jo11', category: 'joke', title: '피식 아재개그', description: '수박이 수영을 하면?', answer: '수박바' },
  { id: 'jo12', category: 'joke', title: '피식 아재개그', description: '할아버지가 좋아하는 돈은?', answer: '할머니' },
  { id: 'jo13', category: 'joke', title: '피식 아재개그', description: '오리가 얼어 죽으면?', answer: '언덕' },
  { id: 'jo14', category: 'joke', title: '피식 아재개그', description: '화장실에서 나온 사람은?', answer: '일본사람 (볼일 본 사람)' },
  { id: 'jo15', category: 'joke', title: '피식 아재개그', description: '사람이 죽지 않는 산맥은?', answer: '안데스 산맥' },
  { id: 'jo16', category: 'joke', title: '피식 아재개그', description: '가장 억울한 도형은?', answer: '원통' }
];
