import type { Metadata, Viewport } from 'next';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { REGION_CONFIG } from '@/config/region.config';
import { AppProvider } from '@/modules/onboarding/context/AppContext';
import './globals.css';

export const metadata: Metadata = {
  title: `${REGION_CONFIG.serviceName} (${REGION_CONFIG.displayName})`,
  description:
    '이웃을 살피GO, 먼저 인사하GO, 안심으로 이어지GO — KRDS 접근성 표준·공공데이터·온디바이스 AI 기반 0원 오픈소스 마을 안심망 & 골목 상생 PWA 플랫폼',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '우리동네 3GO',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#246BEB',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* KRDS 대한민국 정부 디지털 디자인 시스템 표준 서체: Pretendard GOV */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov.min.css"
        />
      </head>
      <body className="min-h-full">
        <AppProvider>
          <MobileAppShell>{children}</MobileAppShell>
        </AppProvider>
      </body>
    </html>
  );
}
