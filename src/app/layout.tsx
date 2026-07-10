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
  title: "🚀 모임 활성화 300% 출석체크 링크 만들기",
  description: "비용 0원! 우리 모임만의 출석체크 이벤트를 10초 만에 만들어보세요.",
  openGraph: {
    title: "🚀 모임 활성화 300% 출석체크 링크 만들기",
    description: "비용 0원! 우리 모임만의 출석체크 이벤트를 10초 만에 만들어보세요.",
    siteName: "출석체크 메이커",
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
