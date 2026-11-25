import { NextResponse } from 'next/server';
import {
  fetchPublicDataset,
  VALID_PUBLIC_DATASETS,
  type PublicDatasetKey,
} from '@/lib/public-data';

/**
 * GET /api/public-data/[dataset]
 * - 지원 dataset: parks | safety | merchants | fire | welfare | weather
 * - data.go.kr API 호출(타임아웃 3000ms, 캐시 1시간) 및 장애/키 미설정 시 즉시 Fallback JSON 반환
 * - 응답 mode: "live" | "snapshot"
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ dataset: string }> },
) {
  const { dataset } = await context.params;

  if (!VALID_PUBLIC_DATASETS.includes(dataset as PublicDatasetKey)) {
    return NextResponse.json(
      {
        ok: false,
        message: `지원하지 않는 공공데이터셋입니다: ${dataset}`,
        supported: VALID_PUBLIC_DATASETS,
      },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const simulateBadWeather = searchParams.get('simulateBadWeather') === 'true';

  const result = await fetchPublicDataset(dataset as PublicDatasetKey, {
    simulateBadWeather,
  });

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
