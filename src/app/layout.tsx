import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://band-checkin.vercel.app'),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      translate="no"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
