import { asc, eq } from 'drizzle-orm';
import { cacheLife } from 'next/cache';
import { REGION_CONFIG } from '@/config/region.config';
import { getOptionalDb } from '@/db';
import {
  localMerchants,
  programs,
  type ProgramStage,
} from '@/db/schema';

export interface HomeProgramItem {
  id: string;
  stage: ProgramStage;
  title: string;
  category: string;
  agencyName: string;
  location: string;
  description: string;
  maxCapacity: number;
  currentApplicants: number;
  eventDateIso: string;
  isIndoor: boolean;
}

export interface HomeMerchantItem {
  id: string;
  name: string;
  category: string;
  address: string;
  couponTitle: string;
  discountText: string;
  barcodePrefix: string;
}

export interface HomeDashboardData {
  programs: HomeProgramItem[];
  merchants: HomeMerchantItem[];
  dataSource: 'NEON_DB' | 'DEMO_SNAPSHOT';
}

const INDOOR_KEYWORDS = ['공유공방', '도서관', 'PC방', '커뮤니티센터', '공유주방', '복도'];

function detectIsIndoor(location: string, category: string): boolean {
  if (category === 'E스포츠' || category === '세대바둑' || category === '자가수리') {
    return true;
  }
  return INDOOR_KEYWORDS.some((keyword) => location.includes(keyword));
}

/** DATABASE_URL 미설정 또는 시드 전에도 무중단 시연이 가능하도록 보장하는 로컬 스냅샷 */
const FALLBACK_PROGRAMS: HomeProgramItem[] = [
  {
    id: 'prog-1go-fire-safety',
    stage: '1GO',
    title: '우리 아파트 승강기 갇힘 탈출(7자리 ID) & 옥내소화전 실전 체험',
    category: '소방안전',
    agencyName: REGION_CONFIG.publicApi.fireStationName,
    location: '광주 광산구 쌍암동 첨단라인아파트 102동 복도 및 관리동 앞',
    description:
      '광주광산소방서 첨단119안전센터 무료 출장 교육. 승강기 고유번호 신고와 옥내소화전 실전 방수를 실습합니다.',
    maxCapacity: 24,
    currentApplicants: 18,
    eventDateIso: '2026-12-05T10:00:00+09:00',
    isIndoor: true,
  },
  {
    id: 'prog-1go-health-doctor',
    stage: '1GO',
    title: '찾아가는 마을 활력 닥터 (혈압·혈당·CIST 조기 치매 선별)',
    category: '마을보건',
    agencyName: REGION_CONFIG.publicApi.healthCenterName,
    location: '광주 광산구 월계동 첨단부영아파트 커뮤니티센터',
    description:
      '광산구보건소 방문 간호팀 무료 건강 체크 및 어르신 낙상 예방 스트레칭 클래스입니다.',
    maxCapacity: 30,
    currentApplicants: 22,
    eventDateIso: '2026-12-08T14:00:00+09:00',
    isIndoor: true,
  },
  {
    id: 'prog-1go-diy-repair',
    stage: '1GO',
    title: '은퇴 장인의 자가수리 학교 (방충망·수전 트랩·LED 교체)',
    category: '자가수리',
    agencyName: '광주광역시 광산구 노인일자리 시니어 기술단',
    location: '광주 광산구 첨단1동 행정복지센터 1층 공유공방',
    description:
      '은퇴 설비 장인이 알려주는 생활 수리 특강과 잉여 자재 나눔 은행이 함께 열립니다.',
    maxCapacity: 16,
    currentApplicants: 14,
    eventDateIso: '2026-12-12T10:30:00+09:00',
    isIndoor: true,
  },
  {
    id: 'prog-2go-baduk-board',
    stage: '2GO',
    title: '세대교차 고스트 바둑왕전 & 현대 전략 보드게임',
    category: '세대바둑',
    agencyName: '첨단 마을교육공동체 × GIST 대학생 봉사단',
    location: '광주 광산구 월계동 첨단도서관 다목적실',
    description:
      '직함·나이 계급장 없는 가명 닉네임 4주 시즌제! 어르신 훈수와 학생 대국이 만나는 보드게임 리그.',
    maxCapacity: 20,
    currentApplicants: 15,
    eventDateIso: '2026-12-14T15:00:00+09:00',
    isIndoor: true,
  },
  {
    id: 'prog-2go-esports-pcbang',
    stage: '2GO',
    title: '동네 PC방 비수기 상생 대관 — 세대통합 E-스포츠 팀전',
    category: 'E스포츠',
    agencyName: '비수기 상생 첨단 E-존 PC방',
    location: '광주 광산구 첨단중앙로 124 3층 (쌍암동 중심상가)',
    description:
      '평일 오전 비수기 동네 PC방을 상생 대관해 시니어 사령관 + 청년 컨트롤 2인 1조 팀전을 펼칩니다.',
    maxCapacity: 16,
    currentApplicants: 12,
    eventDateIso: '2026-12-19T10:00:00+09:00',
    isIndoor: true,
  },
  {
    id: 'prog-2go-village-table',
    stage: '2GO',
    title: '혼밥 탈출 마을 한솥밥 & 쌍암공원 호수 생태 버디 투어',
    category: '마을식탁',
    agencyName: '광산 첨단 마을안심 TF 1기',
    location: '광주 광산구 산월동 공유주방 & 쌍암공원 일대',
    description:
      '1인 가구 청년과 신노년층이 2인 1조 버디로 산책한 뒤 공유주방에서 따뜻한 한 끼를 나눕니다.',
    maxCapacity: 20,
    currentApplicants: 16,
    eventDateIso: '2026-12-21T11:00:00+09:00',
    isIndoor: false,
  },
];

const FALLBACK_MERCHANTS: HomeMerchantItem[] = [
  {
    id: 'merchant-cheomdan-01',
    name: '쌍암 호수로스터스',
    category: '카페',
    address: '광주 광산구 첨단중앙로182번길 22 1층',
    couponTitle: '동네네컷 완주자 아메리카노 할인',
    discountText: '전 음료 1,000원 즉시 할인',
    barcodePrefix: '3GO-CHD01',
  },
  {
    id: 'merchant-cheomdan-02',
    name: '월계 수제식빵공방',
    category: '베이커리',
    address: '광주 광산구 임방울대로 688 1층',
    couponTitle: '산책 원정대 갓 구운 단팥빵 보급',
    discountText: '5,000원 이상 구매 시 단팥빵 1개 증정',
    barcodePrefix: '3GO-CHD02',
  },
  {
    id: 'merchant-cheomdan-03',
    name: '첨단 추억의 떡볶이',
    category: '분식',
    address: '광주 광산구 첨단중앙로 152 1층',
    couponTitle: '세대 동반 원정대 간식 보급소',
    discountText: '세트 메뉴 15% 할인 (포장 가능)',
    barcodePrefix: '3GO-CHD03',
  },
  {
    id: 'merchant-cheomdan-04',
    name: '비수기 상생 첨단 E-존 PC방',
    category: '동네PC방',
    address: '광주 광산구 첨단중앙로 124 3층',
    couponTitle: '세대통합 원정대 평일 오전 상생 이용권',
    discountText: '어르신·청년 동반 방문 시 2시간 무료',
    barcodePrefix: '3GO-CHD04',
  },
];

/**
 * 홈 대시보드용 1GO/2GO 추천 프로그램 및 원정대 보급소 목록을 Neon DB에서 조회합니다.
 * Next.js 16 `'use cache'`를 적용하며, DB 미연결·오류 시 로컬 스냅샷으로 안전하게 전환합니다.
 */
export async function getHomeDashboardData(): Promise<HomeDashboardData> {
  'use cache';
  cacheLife('minutes');

  const db = getOptionalDb();
  if (!db) {
    return {
      programs: FALLBACK_PROGRAMS,
      merchants: FALLBACK_MERCHANTS,
      dataSource: 'DEMO_SNAPSHOT',
    };
  }

  try {
    const [programRows, merchantRows] = await Promise.all([
      db.select().from(programs).orderBy(asc(programs.eventDate)).limit(6),
      db
        .select()
        .from(localMerchants)
        .where(eq(localMerchants.isActive, true))
        .limit(6),
    ]);

    if (programRows.length === 0 && merchantRows.length === 0) {
      return {
        programs: FALLBACK_PROGRAMS,
        merchants: FALLBACK_MERCHANTS,
        dataSource: 'DEMO_SNAPSHOT',
      };
    }

    return {
      programs:
        programRows.length > 0
          ? programRows.map((row) => ({
              id: row.id,
              stage: row.stage,
              title: row.title,
              category: row.category,
              agencyName: row.agencyName,
              location: row.location,
              description: row.description,
              maxCapacity: row.maxCapacity,
              currentApplicants: row.currentApplicants,
              eventDateIso: row.eventDate.toISOString(),
              isIndoor: detectIsIndoor(row.location, row.category),
            }))
          : FALLBACK_PROGRAMS,
      merchants:
        merchantRows.length > 0
          ? merchantRows.map((row) => ({
              id: row.id,
              name: row.name,
              category: row.category,
              address: row.address,
              couponTitle: row.couponTitle,
              discountText: row.discountText,
              barcodePrefix: row.barcodePrefix,
            }))
          : FALLBACK_MERCHANTS,
      dataSource: 'NEON_DB',
    };
  } catch (error) {
    console.warn('[HomeData] Neon DB 조회 실패 ➔ 시연 스냅샷 전환:', error);
    return {
      programs: FALLBACK_PROGRAMS,
      merchants: FALLBACK_MERCHANTS,
      dataSource: 'DEMO_SNAPSHOT',
    };
  }
}
