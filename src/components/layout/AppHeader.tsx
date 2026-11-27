'use client';

import Link from 'next/link';
import { Landmark, MapPin, MapPinOff, Type } from 'lucide-react';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { activeRegion, isGpsVerified, isLargeText, toggleLargeText } =
    useAppContext();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* KRDS 대한민국 정부 디지털 디자인 시스템 표준 상단 공공 안내 바 */}
      <div className="flex items-center justify-between bg-[#EDF2F7] px-3.5 py-1.5 text-[11px] font-bold text-[#1D1D1D]">
        <span className="inline-flex items-center gap-1">
          <Landmark className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
          <span>{activeRegion.displayName} 공공 리빙랩 · KRDS 접근성 준수</span>
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <Link
          href="/"
          className="flex min-h-12 shrink-0 flex-col justify-center rounded-xl px-0.5"
        >
          <span className="whitespace-nowrap text-[10.5px] font-bold tracking-tighter text-[#047857]">
            살피GO · 인사하GO · 이어지GO
          </span>
          <span className="whitespace-nowrap text-lg font-bold leading-tight text-[#1D1D1D]">
            우리동네 3GO
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {/* 지역 GPS 인증 배지 (src/config/region.config.ts 연동, KRDS 4.5:1 고대비) */}
          <div
            className={cn(
              'inline-flex min-h-12 items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold',
              isGpsVerified
                ? 'border-emerald-300 bg-emerald-50 text-[#065F46]'
                : 'border-amber-400 bg-amber-50 text-amber-950',
            )}
            title={`${activeRegion.displayName} (반경 ${activeRegion.radiusKm}km)`}
          >
            {isGpsVerified ? (
              <MapPin className="h-4 w-4 shrink-0 text-[#047857]" aria-hidden="true" />
            ) : (
              <MapPinOff className="h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
            )}
            <span className="max-w-[100px] truncate">
              {activeRegion.shortName}
              {isGpsVerified ? ' 인증' : ' 미인증'}
            </span>
          </div>

          {/* [가+ 큰 글씨] 접근성 토글 (1.25배 확대, localStorage 유지) */}
          <button
            type="button"
            onClick={toggleLargeText}
            aria-pressed={isLargeText}
            className={cn(
              'inline-flex min-h-12 items-center gap-1 rounded-xl border-2 px-2.5 py-1.5 text-xs font-bold transition-colors active:scale-95',
              isLargeText
                ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-sm'
                : 'border-slate-400 bg-white text-[#1D1D1D] hover:bg-slate-50',
            )}
          >
            <Type className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">
              {isLargeText ? '가- 기본' : '가+ 큰글씨'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
