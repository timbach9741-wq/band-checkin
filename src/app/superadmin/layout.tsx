import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '👑 마스터 대시보드 - 총괄 관리자',
  description: '모든 출석부 방의 통계와 현황을 관리하는 최고 관리자 페이지입니다.',
};

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
