'use client';

import { useEffect, useState } from 'react';
import type { PublicDataMode, WeatherPayload } from '@/lib/public-data';
import { useAppContext } from '@/modules/onboarding/context/AppContext';

interface PublicWeatherState {
  mode: PublicDataMode;
  weather: WeatherPayload | null;
  isBadWeatherEffective: boolean;
}

/**
 * `/api/public-data/weather` 응답과 데모 스위처 [악천후 시뮬레이션]을 통합 구독합니다.
 */
export function usePublicWeather(): PublicWeatherState {
  const { simulators } = useAppContext();
  const [mode, setMode] = useState<PublicDataMode>('snapshot');
  const [weather, setWeather] = useState<WeatherPayload | null>(null);

  useEffect(() => {
    let active = true;
    const query = simulators.badWeatherAlert ? '?simulateBadWeather=true' : '';

    fetch(`/api/public-data/weather${query}`)
      .then((res) => res.json())
      .then(
        (json: {
          ok?: boolean;
          mode?: PublicDataMode;
          data?: WeatherPayload;
        }) => {
          if (!active || !json.ok) return;
          if (json.mode) setMode(json.mode);
          if (json.data) setWeather(json.data);
        },
      )
      .catch(() => {
        // 오프라인 시 기본 스냅샷 모드 유지
      });

    return () => {
      active = false;
    };
  }, [simulators.badWeatherAlert]);

  const isBadWeatherEffective =
    simulators.badWeatherAlert || Boolean(weather?.isBadWeather);

  return {
    mode,
    weather,
    isBadWeatherEffective,
  };
}
