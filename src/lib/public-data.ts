import { REGION_CONFIG } from '@/config/region.config';
import fallbackData from '@/data/public-data-fallback.json';

export type PublicDatasetKey =
  | 'parks'
  | 'safety'
  | 'merchants'
  | 'fire'
  | 'welfare'
  | 'weather';

export const VALID_PUBLIC_DATASETS: PublicDatasetKey[] = [
  'parks',
  'safety',
  'merchants',
  'fire',
  'welfare',
  'weather',
];

export type PublicDataMode = 'live' | 'snapshot';

export interface WeatherPayload {
  baseDate: string;
  baseTime: string;
  nx: number;
  ny: number;
  stationName: string;
  pty: number;
  ptyLabel: string;
  sky: number;
  skyLabel: string;
  t1h: number;
  pm10Value: number;
  pm10Grade: string;
  pm25Value: number;
  isBadWeather: boolean;
  recommendedIndoorProgram: {
    id: string;
    title: string;
    location: string;
  };
}

export interface PublicDataResponse<T = unknown> {
  ok: true;
  dataset: PublicDatasetKey;
  datasetLabel: string;
  provider: string;
  mode: PublicDataMode;
  cachedSeconds: number;
  fetchedAt: string;
  data: T;
}

const API_TIMEOUT_MS = 3000;
const CACHE_SECONDS = 3600;

function getServiceKey(): string {
  return (
    process.env.PUBLIC_DATA_API_KEY?.trim() ||
    process.env.DATA_GO_KR_API_KEY?.trim() ||
    ''
  );
}

/** data.go.kr 6대 공공데이터 엔드포인트 매핑 */
function buildEndpointUrl(dataset: PublicDatasetKey, serviceKey: string): string {
  const encodedKey = encodeURIComponent(serviceKey);
  const { center, sigunguCode, publicApi } = REGION_CONFIG;

  switch (dataset) {
    case 'parks':
      return `https://api.data.go.kr/openapi/tn_pubr_public_cty_park_info_api?serviceKey=${encodedKey}&type=json&numOfRows=10&pageNo=1&institutionNm=${encodeURIComponent(publicApi.districtOfficeName)}`;
    case 'safety':
      return `https://api.data.go.kr/openapi/tn_pubr_public_cctv_api?serviceKey=${encodedKey}&type=json&numOfRows=10&pageNo=1&institutionNm=${encodeURIComponent(publicApi.districtOfficeName)}`;
    case 'merchants':
      return `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?serviceKey=${encodedKey}&radius=500&cx=${center.lng}&cy=${center.lat}&type=json&numOfRows=10`;
    case 'fire':
      return `https://api.data.go.kr/openapi/tn_pubr_public_fire_fclty_api?serviceKey=${encodedKey}&type=json&numOfRows=10&pageNo=1`;
    case 'welfare':
      return `https://apis.data.go.kr/B554287/NationalWelfareInformationsV001/NationalWelfarelistV001?serviceKey=${encodedKey}&callTp=L&pageNo=1&numOfRows=10&srchKeyCode=003&ctpvNm=${encodeURIComponent(REGION_CONFIG.sidoName)}&sggNm=${encodeURIComponent(REGION_CONFIG.sigunguName)}`;
    case 'weather': {
      const now = new Date();
      const baseDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      return `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${encodedKey}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=0600&nx=${publicApi.kmaGridNx}&ny=${publicApi.kmaGridNy}&sigungu=${sigunguCode}`;
    }
  }
}

function getFallbackEntry(dataset: PublicDatasetKey): {
  datasetLabel: string;
  provider: string;
  data: unknown;
} {
  if (dataset === 'weather') {
    return {
      datasetLabel: fallbackData.weather.datasetLabel,
      provider: fallbackData.weather.provider,
      data: fallbackData.weather.data,
    };
  }
  const entry = fallbackData[dataset];
  return {
    datasetLabel: entry.datasetLabel,
    provider: entry.provider,
    data: entry.items,
  };
}

/**
 * 공공데이터포털(data.go.kr) 6대 API 통합 어댑터.
 * - 3000ms 타임아웃 및 1시간 캐시(revalidate: 3600) 적용
 * - API 키 미설정, 타임아웃, 응답 오류 시 즉시 `public-data-fallback.json` 스냅샷으로 무중단 전환
 */
export async function fetchPublicDataset(
  dataset: PublicDatasetKey,
  options?: { simulateBadWeather?: boolean },
): Promise<PublicDataResponse> {
  const fallback = getFallbackEntry(dataset);
  const serviceKey = getServiceKey();
  const fetchedAt = new Date().toISOString();

  // 시연용 악천후 강제 파라미터 지원
  if (dataset === 'weather' && options?.simulateBadWeather) {
    const baseWeather = fallback.data as WeatherPayload;
    return {
      ok: true,
      dataset,
      datasetLabel: fallback.datasetLabel,
      provider: fallback.provider,
      mode: 'snapshot',
      cachedSeconds: CACHE_SECONDS,
      fetchedAt,
      data: {
        ...baseWeather,
        pty: 1,
        ptyLabel: '비 (강수 감지)',
        sky: 4,
        skyLabel: '흐림',
        pm10Value: 96,
        pm10Grade: '나쁨',
        isBadWeather: true,
      } satisfies WeatherPayload,
    };
  }

  // API 키 미설정 시 즉시 스냅샷 반환 (0ms 지연)
  if (!serviceKey) {
    return {
      ok: true,
      dataset,
      datasetLabel: fallback.datasetLabel,
      provider: fallback.provider,
      mode: 'snapshot',
      cachedSeconds: CACHE_SECONDS,
      fetchedAt,
      data: fallback.data,
    };
  }

  try {
    const url = buildEndpointUrl(dataset, serviceKey);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      next: { revalidate: CACHE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const raw = (await response.json()) as Record<string, unknown>;

    // 기상청 초단기실황 응답 파싱 (실패 시 fallback으로 안전 전환)
    if (dataset === 'weather') {
      const baseWeather = fallback.data as WeatherPayload;
      const body = (raw.response as { body?: { items?: { item?: Array<{ category: string; obsrValue: string }> } } } | undefined)?.body;
      const items = body?.items?.item ?? [];
      if (items.length === 0) {
        throw new Error('EMPTY_WEATHER_ITEMS');
      }

      const ptyVal = Number(
        items.find((i) => i.category === 'PTY')?.obsrValue ?? 0,
      );
      const t1hVal = Number(
        items.find((i) => i.category === 'T1H')?.obsrValue ?? baseWeather.t1h,
      );
      const isBadWeather = ptyVal > 0 || baseWeather.pm10Value >= 81;

      return {
        ok: true,
        dataset,
        datasetLabel: fallback.datasetLabel,
        provider: fallback.provider,
        mode: 'live',
        cachedSeconds: CACHE_SECONDS,
        fetchedAt,
        data: {
          ...baseWeather,
          pty: ptyVal,
          ptyLabel: ptyVal > 0 ? '강수 감지' : '강수 없음',
          t1h: Number.isFinite(t1hVal) ? t1hVal : baseWeather.t1h,
          isBadWeather,
        } satisfies WeatherPayload,
      };
    }

    // 일반 목록형 데이터셋
    const responseItems =
      (raw.response as { body?: { items?: unknown } } | undefined)?.body?.items ??
      (raw.body as { items?: unknown } | undefined)?.items;

    if (!responseItems || (Array.isArray(responseItems) && responseItems.length === 0)) {
      throw new Error('EMPTY_DATASET_ITEMS');
    }

    return {
      ok: true,
      dataset,
      datasetLabel: fallback.datasetLabel,
      provider: fallback.provider,
      mode: 'live',
      cachedSeconds: CACHE_SECONDS,
      fetchedAt,
      data: responseItems,
    };
  } catch (error) {
    console.warn(
      `[PublicData:${dataset}] 실시간 API 호출 실패(3초 타임아웃/오류) ➔ 스냅샷 전환:`,
      error instanceof Error ? error.message : error,
    );
    return {
      ok: true,
      dataset,
      datasetLabel: fallback.datasetLabel,
      provider: fallback.provider,
      mode: 'snapshot',
      cachedSeconds: CACHE_SECONDS,
      fetchedAt,
      data: fallback.data,
    };
  }
}
