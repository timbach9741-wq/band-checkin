@echo off
chcp 65001 >nul

curl -s -X POST https://band-checkin.vercel.app/api/generate -H "Content-Type: application/json" -d "{\"bandName\":\"매일독서모임\",\"platform\":\"band\",\"totalMembers\":50,\"contactInfo\":\"카톡ID: bookclub99\",\"pin\":\"1234\"}"
echo.

curl -s -X POST https://band-checkin.vercel.app/api/generate -H "Content-Type: application/json" -d "{\"bandName\":\"아침러닝크루\",\"platform\":\"kakao\",\"totalMembers\":30,\"contactInfo\":\"010-1234-5678\",\"pin\":\"5678\"}"
echo.

curl -s -X POST https://band-checkin.vercel.app/api/generate -H "Content-Type: application/json" -d "{\"bandName\":\"영어스터디그룹\",\"platform\":\"daangn\",\"totalMembers\":20,\"contactInfo\":\"kakao: english_master\",\"pin\":\"9999\"}"
echo.

curl -s -X POST https://band-checkin.vercel.app/api/generate -H "Content-Type: application/json" -d "{\"bandName\":\"다이어트챌린지\",\"platform\":\"somoim\",\"totalMembers\":40,\"contactInfo\":\"010-9876-5432\",\"pin\":\"0000\"}"
echo.
