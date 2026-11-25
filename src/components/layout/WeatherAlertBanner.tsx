'use client';

import Link from 'next/link';
import { ArrowRight, CloudRainWind, X } from 'lucide-react';
import { usePublicWeather } from '@/lib/use-public-weather';
import { useAppContext } from '@/modules/onboarding/context/AppContext';

/**
 * 기상청 단기예보·에어코리아 악천후 응답 또는 [🎭 시연 모드]의 악천후 토글 시
 * 야외 산책 대신 실내 1GO 클래스를 추천하는 알림 배너입니다.
 */
export function WeatherAlertBanner() {
  const { activeRegion, simulators, setSimulator } = useAppContext();
  const { weather, isBadWeatherEffective } = usePublicWeather();

  if (!isBadWeatherEffective) {
    return null;
  }

  const indoorProgram = weather?.recommendedIndoorProgram ?? {
    id: 'prog-1go-diy-repair',
    title: '은퇴 장인의 자가수리 학교 (방충망·LED 교체)',
    location: `${activeRegion.shortName} 행정복지센터 1층 공유공방`,
  };

  return (
    <div
      role="alert"
      className="mx-3.5 mt-3 space-y-2.5 rounded-2xl border-2 border-[#C2410C] bg-orange-50 p-3.5 text-[#1D1D1D] shadow-sm"
    >
      <div className="flex items-start gap-2.5">
        <CloudRainWind
          className="mt-0.5 h-6 w-6 shrink-0 text-[#C2410C]"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-bold text-[#9A3412]">
            기상 악화 감지 ({weather?.stationName ?? activeRegion.publicApi.airKoreaStation}{' '}
            · {weather?.ptyLabel ?? '우천'} · 미세먼지 {weather?.pm10Grade ?? '나쁨'})
          </p>
          <p className="text-sm leading-snug text-[#1D1D1D]">
            야외 산책 대신 실내 1GO 클래스{' '}
            <strong className="font-bold text-[#047857]">
              &lsquo;{indoorProgram.title}&rsquo;
            </strong>
            ({indoorProgram.location})를 추천해 드립니다.
          </p>
        </div>

        {simulators.badWeatherAlert && (
          <button
            type="button"
            onClick={() => setSimulator('badWeatherAlert', false)}
            className="inline-flex min-h-12 min-w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-orange-100 px-2 text-xs font-bold text-[#9A3412] hover:bg-orange-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>닫기</span>
          </button>
        )}
      </div>

      <Link
        href="/community"
        className="flex min-h-12 w-full items-center justify-between rounded-xl bg-[#047857] px-3.5 py-2 text-sm font-bold text-white hover:bg-emerald-800"
      >
        <span>실내 1GO 클래스 바로 예약하기</span>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </Link>
    </div>
  );
}
