'use client';

import { CloudSun, Radio, Server } from 'lucide-react';
import { usePublicWeather } from '@/lib/use-public-weather';
import { cn } from '@/lib/utils';

/**
 * 홈(/) 및 동네네컷(/photospot) 화면에 표시되는 [공공데이터 실시간 / 스냅샷] 상태 칩.
 * 기상청·에어코리아 응답 상태와 현재 기온/미세먼지 요약을 함께 보여줍니다.
 */
export function PublicDataStatusChip({ className }: { className?: string }) {
  const { mode, weather } = usePublicWeather();
  const isLive = mode === 'live';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-xs font-bold',
        isLive
          ? 'border-emerald-300 bg-emerald-50 text-[#065F46]'
          : 'border-slate-300 bg-white text-[#1D1D1D]',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {isLive ? (
          <Radio className="h-3.5 w-3.5 text-[#047857]" aria-hidden="true" />
        ) : (
          <Server className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
        )}
        <span>
          {isLive ? '공공데이터 실시간 연동' : '공공데이터 스냅샷 모드'}
        </span>
      </span>

      {weather && (
        <span className="inline-flex items-center gap-1 text-[#555555]">
          <CloudSun className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
          <span>
            {weather.stationName} {weather.t1h}℃ · 미세먼지 {weather.pm10Grade}
          </span>
        </span>
      )}
    </div>
  );
}
