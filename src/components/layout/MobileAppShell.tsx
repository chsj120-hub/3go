'use client';

import React from 'react';
import { DemoSwitcher } from '@/modules/onboarding/components/DemoSwitcher';
import { AppHeader } from './AppHeader';
import { BottomNavBar } from './BottomNavBar';
import { SafetyLockOverlay } from './SafetyLockOverlay';
import { WeatherAlertBanner } from './WeatherAlertBanner';

/**
 * 우리동네 3GO 모바일 9:16 PWA 공통 셸.
 * 데스크톱에서는 중앙 max-w-[430px] 모바일 프레임으로 깔끔하게 렌더링합니다.
 */
export function MobileAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-slate-200/75">
      <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[#F8FAFC] shadow-2xl">
        <AppHeader />
        <WeatherAlertBanner />
        <DemoSwitcher />

        {/* 플로팅 [🎭 시연 모드] 버튼과 겹치지 않도록 상단 여백 확보 */}
        <main className="flex-1 px-4 pb-28 pt-14">{children}</main>

        <BottomNavBar />
        <SafetyLockOverlay />
      </div>
    </div>
  );
}
