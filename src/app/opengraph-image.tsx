import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '출석체크 링크 만들기';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fontData = await fetch(
    'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITcgqGQZVKFcxDl.ttf'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#eff6ff',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: '40px',
            padding: '60px 80px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            width: '630px',
            height: '550px',
            border: '8px solid #c7d2fe',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '52px',
              fontWeight: '900',
              color: '#1e3a8a',
              marginBottom: '30px',
              lineHeight: 1.4,
              textAlign: 'center',
            }}
          >
            모임 활성화 300%
            <br />
            출석체크 이벤트
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#4f46e5',
              backgroundColor: '#e0e7ff',
              padding: '16px 32px',
              borderRadius: '20px',
            }}
          >
            비용 0원 • 10초 완성
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'NotoSansKR',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  );
}
