@echo off
chcp 65001 >nul

curl -s -X POST https://band-checkin.vercel.app/api/generate -H "Content-Type: application/json" -d "{\"bandName\":\"daily-reading-club\",\"platform\":\"band\",\"totalMembers\":50,\"contactInfo\":\"kakao: bookclub99\",\"pin\":\"1234\"}"
echo.

curl -s -X POST https://band-checkin.vercel.app/api/generate -H "Content-Type: application/json" -d "{\"bandName\":\"morning-running-crew\",\"platform\":\"kakao\",\"totalMembers\":30,\"contactInfo\":\"010-1234-5678\",\"pin\":\"5678\"}"
echo.

curl -s -X POST https://band-checkin.vercel.app/api/generate -H "Content-Type: application/json" -d "{\"bandName\":\"english-study-group\",\"platform\":\"daangn\",\"totalMembers\":20,\"contactInfo\":\"kakao: english_master\",\"pin\":\"9999\"}"
echo.

curl -s -X POST https://band-checkin.vercel.app/api/generate -H "Content-Type: application/json" -d "{\"bandName\":\"diet-challenge-team\",\"platform\":\"band\",\"totalMembers\":40,\"contactInfo\":\"010-9876-5432\",\"pin\":\"0000\"}"
echo.
