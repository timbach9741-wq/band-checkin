// Native fetch in Node 18+

async function createRooms() {
  const rooms = [
    { bandName: "매일독서모임", platform: "band", totalMembers: 50, contactInfo: "카톡ID: bookclub99", pin: "1234" },
    { bandName: "아침러닝크루", platform: "kakao", totalMembers: 30, contactInfo: "010-1234-5678", pin: "5678" },
    { bandName: "영어스터디그룹", platform: "daangn", totalMembers: 20, contactInfo: "kakao: english_master", pin: "9999" },
    { bandName: "다이어트챌린지", platform: "somoim", totalMembers: 40, contactInfo: "010-9876-5432", pin: "0000" }
  ];

  for (const room of rooms) {
    const res = await fetch("https://band-checkin.vercel.app/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room)
    });
    const data = await res.json();
    console.log(data);
  }
}

createRooms();
