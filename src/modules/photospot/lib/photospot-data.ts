import { asc } from 'drizzle-orm';
import { cacheLife } from 'next/cache';
import { REGION_CONFIG } from '@/config/region.config';
import { getOptionalDb } from '@/db';
import { photoSpots } from '@/db/schema';
import type { PhotoSpotItem, PhotoSpotsData } from '../types';

/** Neon DB 미연결 또는 시드 전에도 3스팟 코스가 정상 동작하도록 보장하는 로컬 스냅샷 */
const FALLBACK_SPOTS: PhotoSpotItem[] = [
  {
    id: 'spot-cheomdan-01',
    courseName: REGION_CONFIG.frameAssets.courseTitle,
    spotOrder: 1,
    spotName: '쌍암공원 호수 산책로 수변 데크',
    description:
      '출발지 안심 보행 데크! GIST 앞 쌍암호수를 배경으로 2인이 나란히 서서 양팔을 머리 위로 쭉 뻗는 스트레칭 포즈를 완성하세요.',
    lat: 35.222228,
    lng: 126.844251,
    qrCodeKey: '3GO-CHEOMDAN-SPOT-01',
    poseMissionType: 'STRETCH',
    frameAssetUrl: REGION_CONFIG.frameAssets.variants[1].path,
    regionCode: REGION_CONFIG.regionCode,
  },
  {
    id: 'spot-cheomdan-02',
    courseName: REGION_CONFIG.frameAssets.courseTitle,
    spotOrder: 2,
    spotName: '응암공원 첨단도서관 숲길 쉼터',
    description:
      '월계동 응암공원 지압 산책로 거점! 두 사람이 양손목을 머리 위에서 맞대어 커다란 협동 하트를 만들어 보세요.',
    lat: 35.216895,
    lng: 126.832033,
    qrCodeKey: '3GO-CHEOMDAN-SPOT-02',
    poseMissionType: 'BIG_HEART',
    frameAssetUrl: REGION_CONFIG.frameAssets.defaultFrameUrl,
    regionCode: REGION_CONFIG.regionCode,
  },
  {
    id: 'spot-cheomdan-03',
    courseName: REGION_CONFIG.frameAssets.courseTitle,
    spotOrder: 3,
    spotName: '첨단생활체육공원 영산강 강변길',
    description:
      '영산강 자전거길·파크골프장과 이어지는 완주 스팟! 이웃과 힘찬 하이파이브 포즈로 첨단 원정대 보급소 할인 쿠폰을 획득하세요.',
    lat: 35.210192,
    lng: 126.851544,
    qrCodeKey: '3GO-CHEOMDAN-SPOT-03',
    poseMissionType: 'HIGH_FIVE',
    frameAssetUrl: REGION_CONFIG.frameAssets.variants[2].path,
    regionCode: REGION_CONFIG.regionCode,
  },
];

/**
 * Neon PostgreSQL `photo_spots` 테이블에서 동네네컷 3스팟 코스를 조회합니다.
 * Next.js 16 `'use cache'` 기반이며, DB 미연결·오류 시 시연 스냅샷으로 자동 전환합니다.
 */
export async function getPhotoSpotsData(): Promise<PhotoSpotsData> {
  'use cache';
  cacheLife('minutes');

  const db = getOptionalDb();
  if (!db) {
    return { spots: FALLBACK_SPOTS, dataSource: 'DEMO_SNAPSHOT' };
  }

  try {
    const rows = await db
      .select()
      .from(photoSpots)
      .orderBy(asc(photoSpots.spotOrder))
      .limit(4);

    if (rows.length === 0) {
      return { spots: FALLBACK_SPOTS, dataSource: 'DEMO_SNAPSHOT' };
    }

    return {
      spots: rows.map((row) => ({
        id: row.id,
        courseName: row.courseName,
        spotOrder: row.spotOrder,
        spotName: row.spotName,
        description: row.description,
        lat: row.lat,
        lng: row.lng,
        qrCodeKey: row.qrCodeKey,
        poseMissionType: row.poseMissionType,
        frameAssetUrl: row.frameAssetUrl,
        regionCode: row.regionCode,
      })),
      dataSource: 'NEON_DB',
    };
  } catch (error) {
    console.warn('[PhotoSpots] Neon DB 조회 실패 ➔ 스냅샷 전환:', error);
    return { spots: FALLBACK_SPOTS, dataSource: 'DEMO_SNAPSHOT' };
  }
}
