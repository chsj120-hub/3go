'use client';

import { useState } from 'react';
import {
  Check,
  CloudRainWind,
  Footprints,
  MapPin,
  Navigation,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ACTIVE_REGIONS } from '@/config/region.config';
import { useAppContext } from '../context/AppContext';
import { DEMO_ROLE_ORDER, DEMO_USERS } from '../demo-users';
import { cn } from '@/lib/utils';

/**
 * 심사위원·시연용 원클릭 데모 스위처.
 * SEED Design의 BottomSheet + KRDS 고대비 접근성 기준을 결합해 구현했습니다.
 */
export function DemoSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentUser,
    setDemoRole,
    activeRegion,
    setActiveRegionId,
    simulators,
    toggleSimulator,
    openOnboarding,
  } = useAppContext();

  const activeSimCount = Object.values(simulators).filter(Boolean).length;

  return (
    <>
      {/* 우측 상단 반투명 플로팅 버튼 */}
      <div className="pointer-events-none fixed left-1/2 top-[102px] z-30 flex w-full max-w-[430px] -translate-x-1/2 justify-end px-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto inline-flex min-h-12 items-center gap-1.5 rounded-full border border-slate-400/80 bg-[#1D1D1D]/85 px-3.5 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-[#1D1D1D] active:scale-95"
        >
          <span aria-hidden="true">🎭</span>
          <span>시연 모드</span>
          <span className="rounded-full bg-emerald-400/25 px-2 py-0.5 text-[11px] font-bold text-emerald-200">
            {currentUser.roleLabel}
          </span>
          {activeSimCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C2410C] text-[11px] font-bold text-white">
              {activeSimCount}
            </span>
          )}
        </button>
      </div>

      {/* SEED + KRDS 표준 바텀시트 */}
      <BottomSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        subtitle="공모전 시연 안전장치"
        title="🎭 역할 & 센서 시뮬레이터"
      >
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1D]">
            <UserCheck className="h-4 w-4 text-[#047857]" aria-hidden="true" />
            <span>1. 시연 역할 즉시 전환 (4종)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ROLE_ORDER.map((roleKey) => {
              const profile = DEMO_USERS[roleKey];
              const selected = currentUser.role === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setDemoRole(roleKey)}
                  className={cn(
                    'flex min-h-16 flex-col items-start justify-between rounded-2xl border-2 p-3 text-left transition active:scale-[0.98]',
                    selected
                      ? 'border-[#047857] bg-emerald-50/90'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-bold text-[#1D1D1D]">
                      {profile.roleLabel}
                    </span>
                    {selected && (
                      <Check className="h-4 w-4 text-[#047857]" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {profile.nickname}
                  </span>
                  <span className="mt-1 text-[11px] leading-snug text-[#555555]">
                    {profile.shortDesc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1D]">
            <SlidersHorizontal
              className="h-4 w-4 text-[#C2410C]"
              aria-hidden="true"
            />
            <span>2. 가상 환경 시뮬레이터 (3종)</span>
          </div>

          <div className="space-y-2">
            <SimulatorRow
              icon={Navigation}
              title="가상 GPS 도착"
              description={`${activeRegion.center.landmarkName} (반경 ${activeRegion.radiusKm}km 인증)`}
              active={simulators.virtualGpsArrived}
              activeColor="bg-[#047857]"
              onToggle={() => toggleSimulator('virtualGpsArrived')}
            />
            <SimulatorRow
              icon={Footprints}
              title="보행 잠금 강제 (Safety Lock)"
              description="보행 진동 감지 화면 블러 오버레이 즉시 시연"
              active={simulators.forceSafetyLock}
              activeColor="bg-[#C2410C]"
              onToggle={() => {
                toggleSimulator('forceSafetyLock');
                setIsOpen(false);
              }}
            />
            <SimulatorRow
              icon={CloudRainWind}
              title="악천후 시뮬레이션"
              description="우천·미세먼지 감지 시 야외 ➔ 실내 클래스 자동 전환 알림"
              active={simulators.badWeatherAlert}
              activeColor="bg-[#1E3A8A]"
              onToggle={() => toggleSimulator('badWeatherAlert')}
            />
          </div>
        </section>

        <section className="mt-5 space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1D]">
            <MapPin className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
            <span>3. 활성 거점 지역 (지자체 10분 복제 테스트)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVE_REGIONS.map((region) => {
              const selected = activeRegion.regionId === region.regionId;
              return (
                <button
                  key={region.regionId}
                  type="button"
                  onClick={() => setActiveRegionId(region.regionId)}
                  className={cn(
                    'flex min-h-12 items-center justify-between rounded-xl border-2 px-3 py-2 text-xs font-bold transition',
                    selected
                      ? 'border-[#246BEB] bg-blue-50 text-[#1E3A8A]'
                      : 'border-slate-200 bg-white text-[#1D1D1D] hover:bg-slate-50',
                  )}
                >
                  <span>{region.shortName}</span>
                  {selected && <Check className="h-4 w-4" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openOnboarding();
            }}
            className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-[#246BEB] bg-blue-50 px-3 py-2 text-xs font-bold text-[#1E3A8A] hover:bg-blue-100"
          >
            🚀 최초 진입 온보딩 모달(로그인·GPS·신뢰사다리) 다시 시연하기
          </button>
        </section>
      </BottomSheet>
    </>
  );
}

interface SimulatorRowProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  active: boolean;
  activeColor: string;
  onToggle: () => void;
}

function SimulatorRow({
  icon: Icon,
  title,
  description,
  active,
  activeColor,
  onToggle,
}: SimulatorRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={cn(
        'flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 p-3 text-left transition active:scale-[0.99]',
        active
          ? 'border-slate-400 bg-slate-50'
          : 'border-slate-200 bg-white hover:bg-slate-50',
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#1D1D1D]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#1D1D1D]">{title}</p>
          <p className="text-xs leading-snug text-[#555555]">{description}</p>
        </div>
      </div>

      <span
        className={cn(
          'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold',
          active ? cn(activeColor, 'text-white') : 'bg-slate-200 text-[#1D1D1D]',
        )}
      >
        {active ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}
