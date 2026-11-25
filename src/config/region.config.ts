/**
 * 지자체 10분 복제(Fork) 및 복수 생활권(2개 이상) 운영을 위한 단일 지역 설정 파일.
 * 모든 지역명, 중심 좌표, 반경, 시군구/법정동/행정동 코드, 공공 API 파라미터,
 * 동네네컷 지역 프레임 경로는 반드시 이 파일에서만 관리합니다.
 */

export interface RegionFrameAsset {
  id: string;
  label: string;
  path: string;
  season: 'ALL' | 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
}

export type RegionId = 'gwangju-gwangsan-cheomdan' | 'gwangju-bukgu';

export interface RegionConfig {
  /** 서비스 브랜드 및 지역 식별 정보 */
  serviceName: string;
  regionId: RegionId;
  sidoName: string;
  sigunguName: string;
  dongAreaName: string;
  displayName: string;
  shortName: string;

  /** 행정·법정동 코드 (공공데이터포털 API 연동용) */
  sidoCode: string;
  sigunguCode: string;
  legalDongCode: string;
  adminDongCodes: string[];
  /** DB `region_code` 컬럼 저장 기준 코드 (시군구 5자리) */
  regionCode: string;

  /** 생활권 GPS 인증 기준 (중심 좌표 및 반경) */
  center: {
    lat: number;
    lng: number;
    landmarkName: string;
  };
  radiusKm: number;
  radiusMeters: number;

  /** 공공데이터포털 6대 API 지역 매핑 */
  publicApi: {
    /** 기상청 단기예보 격자 좌표 */
    kmaGridNx: number;
    kmaGridNy: number;
    /** 에어코리아 대기오염 측정소명 */
    airKoreaStation: string;
    /** 관할 소방서 / 119안전센터명 */
    fireStationName: string;
    /** 관할 보건소명 */
    healthCenterName: string;
    /** 관할 시군구청명 */
    districtOfficeName: string;
  };

  /** 동네네컷 원정대 지역 특화 프레임 경로 */
  frameAssets: {
    defaultFrameUrl: string;
    logoWatermarkUrl: string;
    courseTitle: string;
    variants: RegionFrameAsset[];
  };

  /** 3GO 단계별 시맨틱 컬러 토큰 */
  theme: {
    stage1Go: string;
    stage2Go: string;
    stage3Go: string;
    background: string;
  };
}

const COMMON_THEME = {
  stage1Go: '#10B981', // 살피GO 안심 에메랄드
  stage2Go: '#F97316', // 인사하GO 활력 오렌지
  stage3Go: '#1E3A8A', // 이어지GO 신뢰 네이비
  background: '#F8FAFC', // 웜 화이트
};

/**
 * 복수 생활권 프리셋 맵 (2개 지역 동시 운영 또는 원클릭 전환 지원)
 * - 1순위 기본값: 광주광역시 광산구 첨단 (첨단1·2동, 쌍암동·월계동·산월동 생활권)
 * - 2순위 보조 거점: 광주광역시 북구 (용봉·중외공원 생활권, 타 자치구/동으로 교체 가능)
 */
export const REGION_PRESETS: Record<RegionId, RegionConfig> = {
  'gwangju-gwangsan-cheomdan': {
    serviceName: '우리동네 3GO × 동네네컷 원정대',
    regionId: 'gwangju-gwangsan-cheomdan',
    sidoName: '광주광역시',
    sigunguName: '광산구',
    dongAreaName: '첨단(첨단1·2동)',
    displayName: '광주광역시 광산구 첨단',
    shortName: '광주 광산 첨단',

    // 광주광역시(29) 광산구(29200) / 쌍암동 법정동(2920011600) / 첨단1동(2920062400)·첨단2동(2920062600)
    sidoCode: '29',
    sigunguCode: '29200',
    legalDongCode: '2920011600',
    adminDongCodes: ['2920062400', '2920062600'],
    regionCode: '29200',

    // 첨단1동 행정복지센터·쌍암공원 중심 좌표 (반경 1.5km 내 쌍암공원·응암공원·첨단생활체육공원 포함)
    center: {
      lat: 35.219527,
      lng: 126.842364,
      landmarkName: '첨단1동 행정복지센터 · 쌍암공원 생활권',
    },
    radiusKm: 1.5,
    radiusMeters: 1500,

    publicApi: {
      kmaGridNx: 58,
      kmaGridNy: 75,
      airKoreaStation: '비아동',
      fireStationName: '광주광산소방서 첨단119안전센터',
      healthCenterName: '광주광역시 광산구보건소',
      districtOfficeName: '광주광역시 광산구청',
    },

    frameAssets: {
      defaultFrameUrl: '/frames/gwangju-gwangsan-cheomdan/default-4cut.svg',
      logoWatermarkUrl: '/frames/gwangju-gwangsan-cheomdan/cheomdan-emblem.svg',
      courseTitle: '광주 광산 첨단 쌍암·응암·영산강 안심 산책 코스',
      variants: [
        {
          id: 'cheomdan-default',
          label: '광산 첨단 안심마을 기본 프레임',
          path: '/frames/gwangju-gwangsan-cheomdan/default-4cut.svg',
          season: 'ALL',
        },
        {
          id: 'cheomdan-ssangam',
          label: '쌍암공원 호수 산책 프레임',
          path: '/frames/gwangju-gwangsan-cheomdan/ssangam-park.svg',
          season: 'SPRING',
        },
        {
          id: 'cheomdan-alley',
          label: '첨단 골목상권 보급소 프레임',
          path: '/frames/gwangju-gwangsan-cheomdan/alley-supply.svg',
          season: 'AUTUMN',
        },
      ],
    },

    theme: COMMON_THEME,
  },

  'gwangju-bukgu': {
    serviceName: '우리동네 3GO × 동네네컷 원정대',
    regionId: 'gwangju-bukgu',
    sidoName: '광주광역시',
    sigunguName: '북구',
    dongAreaName: '용봉·중외 생활권',
    displayName: '광주광역시 북구',
    shortName: '광주 북구',

    // 광주광역시(29) 북구(29170) 행정표준코드
    sidoCode: '29',
    sigunguCode: '29170',
    legalDongCode: '2917000000',
    adminDongCodes: ['2917057000'],
    regionCode: '29170',

    // 광주광역시 북구 용봉동·북구청 생활권 중심 좌표
    center: {
      lat: 35.1742,
      lng: 126.9121,
      landmarkName: '광주 북구청 · 용봉 생활권',
    },
    radiusKm: 1.5,
    radiusMeters: 1500,

    publicApi: {
      kmaGridNx: 59,
      kmaGridNy: 74,
      airKoreaStation: '두암동',
      fireStationName: '광주북부소방서',
      healthCenterName: '광주광역시 북구보건소',
      districtOfficeName: '광주광역시 북구청',
    },

    frameAssets: {
      defaultFrameUrl: '/frames/gwangju-bukgu/default-4cut.svg',
      logoWatermarkUrl: '/frames/gwangju-bukgu/bukgu-emblem.svg',
      courseTitle: '광주 북구 중외·용봉 안심 산책 코스',
      variants: [
        {
          id: 'bukgu-default',
          label: '북구 안심마을 기본 프레임',
          path: '/frames/gwangju-bukgu/default-4cut.svg',
          season: 'ALL',
        },
        {
          id: 'bukgu-mudeung',
          label: '무등산·중외공원 산책 프레임',
          path: '/frames/gwangju-bukgu/mudeung-park.svg',
          season: 'SPRING',
        },
        {
          id: 'bukgu-alley',
          label: '용봉 골목상권 보급소 프레임',
          path: '/frames/gwangju-bukgu/alley-supply.svg',
          season: 'AUTUMN',
        },
      ],
    },

    theme: COMMON_THEME,
  },
};

/** 기본 대표 지역 ID (광주광역시 광산구 첨단) */
export const DEFAULT_REGION_ID: RegionId = 'gwangju-gwangsan-cheomdan';

/** 현재 플랫폼에서 동시 지원하는 활성 지역 목록 (2개 거점 운영 가능) */
export const ACTIVE_REGIONS: RegionConfig[] = [
  REGION_PRESETS['gwangju-gwangsan-cheomdan'],
  REGION_PRESETS['gwangju-bukgu'],
];

/**
 * 지역 ID 또는 시군구 코드(regionCode)로 지역 설정을 조회합니다.
 * 일치 항목이 없으면 기본 지역(광주광역시 광산구 첨단)을 반환합니다.
 */
export function getRegionConfig(regionIdOrCode?: string | null): RegionConfig {
  if (!regionIdOrCode) {
    return REGION_PRESETS[DEFAULT_REGION_ID];
  }

  if (regionIdOrCode in REGION_PRESETS) {
    return REGION_PRESETS[regionIdOrCode as RegionId];
  }

  const byCode = ACTIVE_REGIONS.find(
    (region) =>
      region.regionCode === regionIdOrCode ||
      region.sigunguCode === regionIdOrCode,
  );

  return byCode ?? REGION_PRESETS[DEFAULT_REGION_ID];
}

/**
 * 기본 활성 지역 설정 객체.
 * NEXT_PUBLIC_REGION_ID 환경 변수가 있으면 해당 지역을, 없으면 광주 광산구 첨단을 사용합니다.
 */
export const REGION_CONFIG: RegionConfig = getRegionConfig(
  process.env.NEXT_PUBLIC_REGION_ID,
);

/**
 * 두 위경도 좌표 간 거리(m)를 Haversine 공식으로 계산합니다.
 * 생활권 반경(기본 1.5km) 내 GPS 인증 여부에 사용됩니다.
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number = REGION_CONFIG.center.lat,
  lng2: number = REGION_CONFIG.center.lng,
): number {
  const EARTH_RADIUS_M = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_M * c);
}

/** 주어진 좌표가 지정 지역(기본: 광주 광산구 첨단) 반경 1.5km 이내인지 판정합니다. */
export function isWithinRegionRadius(
  lat: number,
  lng: number,
  region: RegionConfig = REGION_CONFIG,
): boolean {
  return (
    calculateDistanceMeters(lat, lng, region.center.lat, region.center.lng) <=
    region.radiusMeters
  );
}

/**
 * 복수 지역(2개 거점) 동시 운영용 GPS 매칭 함수.
 * 활성 지역 중 사용자 좌표가 반경 내에 속하는 가장 가까운 지역과 거리(m)를 반환합니다.
 */
export function findMatchedRegion(
  lat: number,
  lng: number,
  regions: RegionConfig[] = ACTIVE_REGIONS,
): { region: RegionConfig; distanceMeters: number } | null {
  const matched = regions
    .map((region) => ({
      region,
      distanceMeters: calculateDistanceMeters(
        lat,
        lng,
        region.center.lat,
        region.center.lng,
      ),
    }))
    .filter(({ region, distanceMeters }) => distanceMeters <= region.radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  return matched[0] ?? null;
}

/** 주어진 좌표가 활성 지역(2개 거점) 중 한 곳 이상의 반경 내에 속하는지 확인합니다. */
export function isWithinAnyActiveRegion(lat: number, lng: number): boolean {
  return findMatchedRegion(lat, lng) !== null;
}
