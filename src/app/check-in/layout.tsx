import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "🎁 오늘의 출석체크 & 혜택",
  description: "지금 바로 출석 도장을 찍고 무료 운세와 로또 번호 혜택을 받아가세요!",
  openGraph: {
    title: "🎁 오늘의 출석체크 & 혜택",
    description: "지금 바로 출석 도장을 찍고 무료 운세와 로또 번호 혜택을 받아가세요!",
    siteName: "출석체크 이벤트",
    locale: "ko_KR",
    type: "website",
  }
};

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
