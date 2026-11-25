import type { PoseMissionType } from '@/db/schema';

export interface PhotoSpotItem {
  id: string;
  courseName: string;
  spotOrder: number;
  spotName: string;
  description: string;
  lat: number;
  lng: number;
  qrCodeKey: string;
  poseMissionType: PoseMissionType;
  frameAssetUrl: string;
  regionCode: string;
}

export interface PhotoSpotsData {
  spots: PhotoSpotItem[];
  dataSource: 'NEON_DB' | 'DEMO_SNAPSHOT';
}

export const POSE_MISSION_LABELS: Record<PoseMissionType, string> = {
  STRETCH: '2인 양팔 스트레칭 포즈',
  BIG_HEART: '이웃과 머리 위 큰 하트',
  MASCOT_POSE: '우리동네 마스코트 따라하기',
  HIGH_FIVE: '세대 교차 힘찬 하이파이브',
};
