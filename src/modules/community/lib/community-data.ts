import { asc } from 'drizzle-orm';
import { cacheLife } from 'next/cache';
import { REGION_CONFIG } from '@/config/region.config';
import { getOptionalDb } from '@/db';
import { programs } from '@/db/schema';
import type { CommunityClassItem, CommunityPageData } from '../types';

/** 1GO 살피GO — 공공기관 출장 8대 고정 클래스 (강사료 0원) */
const FIXED_1GO_CLASSES: CommunityClassItem[] = [
  {
    id: 'prog-1go-fire-safety',
    stage: '1GO',
    title: '우리 아파트 승강기 갇힘 탈출(7자리 ID) & 옥내소화전 실전 체험',
    category: '소방안전',
    agencyName: REGION_CONFIG.publicApi.fireStationName,
    location: '광주 광산구 쌍암동 첨단라인아파트 102동 복도 및 관리동',
    description:
      '승강기 고유번호 7자리 신고 요령, 복도 옥내소화전 실전 방수 및 완강기 착용법을 소방관과 직접 실습합니다.',
    maxCapacity: 24,
    currentApplicants: 18,
    eventDateLabel: '매월 첫째 토요일 10:00',
    isZeroFee: true,
  },
  {
    id: 'prog-1go-health-doctor',
    stage: '1GO',
    title: '찾아가는 마을 활력 닥터 (혈압·혈당·CIST 조기 치매 선별)',
    category: '마을보건',
    agencyName: REGION_CONFIG.publicApi.healthCenterName,
    location: '광주 광산구 월계동 첨단부영아파트 커뮤니티센터',
    description:
      '방문 간호팀 무료 건강 측정, CIST 조기 치매 선별검사 및 어르신 낙상 예방 스트레칭을 진행합니다.',
    maxCapacity: 30,
    currentApplicants: 22,
    eventDateLabel: '매월 둘째 화요일 14:00',
    isZeroFee: true,
  },
  {
    id: 'prog-1go-diy-repair',
    stage: '1GO',
    title: '은퇴 장인의 자가수리 학교 (방충망·수전 트랩·LED·코킹)',
    category: '자가수리',
    agencyName: '광산시니어클럽 노인일자리 기술단',
    location: '광주 광산구 첨단1동 행정복지센터 1층 공유공방',
    description:
      '은퇴 설비 장인의 생활 수리 비법 전수 및 남은 실리콘·LED 자재를 이웃과 나누는 잉여 자재 나눔 은행 운영.',
    maxCapacity: 16,
    currentApplicants: 14,
    eventDateLabel: '매월 둘째 토요일 10:30',
    isZeroFee: true,
  },
  {
    id: 'prog-1go-post-phishing',
    stage: '1GO',
    title: '우체국 안심 완충 포장 & 보이스피싱·스미싱 예방 교실',
    category: '생활금융',
    agencyName: '광주첨단우체국 금융·물류 지원팀',
    location: '광주 광산구 쌍암동 첨단종합사회복지관 2층',
    description:
      '명절 택배 파손 방지 완충 포장 실습과 실제 문자·전화 사기 유형별 즉시 대처법을 함께 익힙니다.',
    maxCapacity: 25,
    currentApplicants: 16,
    eventDateLabel: '매월 셋째 수요일 14:00',
    isZeroFee: true,
  },
  {
    id: 'prog-1go-library-book',
    stage: '1GO',
    title: '공공도서관 세대교차 그림책 낭독 & 마을 북클래스',
    category: '독서문화',
    agencyName: '광주 광산구 첨단도서관',
    location: '광주 광산구 월계동 첨단도서관 다목적실',
    description:
      '어르신이 들려주는 옛이야기와 초등학생·청년이 추천하는 그림책으로 세대 공감을 나누는 무료 북클래스.',
    maxCapacity: 20,
    currentApplicants: 11,
    eventDateLabel: '매월 셋째 토요일 15:00',
    isZeroFee: true,
  },
  {
    id: 'prog-1go-ai-phone',
    stage: '1GO',
    title: '0원 생성형 AI 스마트폰 교실 (병원 예약·음성 비서·사진 복원)',
    category: '디지털AI',
    agencyName: 'GIST · 광주 지역 대학 SW 봉사단',
    location: '광주 광산구 첨단1동 행정복지센터 정보화교실',
    description:
      '무료 AI 앱으로 음성 검색, 병원 진료 예약, 옛날 가족사진 화질 복원까지 대학생 멘토가 1:1로 안내합니다.',
    maxCapacity: 20,
    currentApplicants: 17,
    eventDateLabel: '매월 넷째 목요일 10:00',
    isZeroFee: true,
  },
  {
    id: 'prog-1go-plant-clinic',
    stage: '1GO',
    title: '아파트 베란다 반려식물 분갈이 & 병해충 클리닉',
    category: '도시농업',
    agencyName: '광주광역시 농업기술센터 출장팀',
    location: '광주 광산구 산월동 호반리젠시빌 작은마당',
    description:
      '시들어가는 화분을 직접 가져오면 전문가가 무료로 진단하고 이웃과 모종·분갈이 흙을 나눕니다.',
    maxCapacity: 22,
    currentApplicants: 13,
    eventDateLabel: '격주 금요일 15:00',
    isZeroFee: true,
  },
  {
    id: 'prog-1go-pet-clinic',
    stage: '1GO',
    title: '우리동네 반려동물 펫티켓 & 기초 응급처치 클리닉',
    category: '반려동물',
    agencyName: '광주광역시 동물보호센터 순회팀',
    location: '광주 광산구 쌍암공원 야외광장 쉼터',
    description:
      '아파트 공동생활 펫티켓, 산책 리드줄 에티켓 및 반려견·반려묘 기초 건강 관리법을 무료 교육합니다.',
    maxCapacity: 20,
    currentApplicants: 12,
    eventDateLabel: '매월 넷째 토요일 11:00',
    isZeroFee: true,
  },
];

/** 2GO 인사하GO — 3~11월 세대 교차 멘토링 캘린더 (가명 닉네임 · 4~8주 시즌제) */
const FIXED_2GO_CALENDAR: CommunityClassItem[] = [
  {
    id: 'prog-2go-baduk-board',
    stage: '2GO',
    monthTag: '3월',
    title: '고스트 바둑왕전(어르신 훈수+학생 대국) & 현대 전략 보드게임',
    category: '세대바둑',
    agencyName: '첨단 마을교육공동체 × GIST 봉사단',
    location: '광주 광산구 월계동 첨단도서관 다목적실',
    description:
      '직함·나이 계급장을 뗀 가명 닉네임 4주 시즌제! 어르신의 훈수와 청년·초등학생의 두뇌 플레이가 만납니다.',
    maxCapacity: 20,
    currentApplicants: 15,
    eventDateLabel: '3월 매주 토요일 15:00 (4주 시즌)',
    isZeroFee: true,
  },
  {
    id: 'prog-2go-april-manitto',
    stage: '2GO',
    monthTag: '4월',
    title: '봄날 쌍암 생태공원 버디 투어 & 다이소 5천원 마니또 선물 교환',
    category: '생태버디',
    agencyName: '광산 첨단 마을안심 TF 1기',
    location: '광주 광산구 쌍암공원 호수 산책로 집결',
    description:
      '부담 없는 5천원 상한선 마니또 선물과 함께 2인 1조 세대 버디로 봄꽃 호수길을 산책합니다.',
    maxCapacity: 24,
    currentApplicants: 19,
    eventDateLabel: '4월 둘째 토요일 10:30',
    isZeroFee: true,
  },
  {
    id: 'prog-2go-esports-pcbang',
    stage: '2GO',
    monthTag: '5월',
    title: '동네 PC방 비수기 상생 대관 — 세대통합 E-스포츠 (스타·LoL)',
    category: 'E스포츠',
    agencyName: '비수기 상생 첨단 E-존 PC방',
    location: '광주 광산구 첨단중앙로 124 3층',
    description:
      '평일 오전 비수기 동네 PC방 상생 대관! 시니어 사령관 + 청년 컨트롤 스타크래프트 팀전 & LoL 입문 코칭.',
    maxCapacity: 16,
    currentApplicants: 12,
    eventDateLabel: '5월 셋째 토요일 09:30 (비수기 대관)',
    isZeroFee: true,
  },
  {
    id: 'prog-2go-village-table',
    stage: '2GO',
    monthTag: '6월',
    title: '혼밥 탈출 마을 한솥밥(공유주방) & 동네 숨은 맛집 원정대',
    category: '마을식탁',
    agencyName: '첨단 공유주방 × 골목 보급소 연합',
    location: '광주 광산구 산월동 공유주방 & 첨단 골목상권',
    description:
      '1인 가구 청년과 신노년층이 함께 따뜻한 한 끼를 만들고, 골목 상권 숨은 맛집 영수증 리뷰를 나눕니다.',
    maxCapacity: 20,
    currentApplicants: 16,
    eventDateLabel: '6월 둘째 일요일 11:30',
    isZeroFee: true,
  },
  {
    id: 'prog-2go-summer-sports',
    stage: '2GO',
    monthTag: '7~8월',
    title: '어르신 파크골프·게이트볼 레슨 & 청년 선셋 러닝·숏폼 챌린지',
    category: '생활체육',
    agencyName: '첨단생활체육공원 동호회 연합',
    location: '광주 광산구 첨단생활체육공원 영산강 강변',
    description:
      '오전엔 어르신이 청년에게 파크골프를, 저녁엔 청년이 이웃에게 선셋 러닝과 골목 숏폼 촬영을 코칭합니다.',
    maxCapacity: 24,
    currentApplicants: 14,
    eventDateLabel: '7~8월 매주 수·토 (하계 시즌)',
    isZeroFee: true,
  },
  {
    id: 'prog-2go-autumn-festival',
    stage: '2GO',
    monthTag: '9~10월',
    title: '동민의 날 연계 수리·나눔 부스(렌탈 0원) & 잔디마당 김밥 소풍',
    category: '마을축제',
    agencyName: '첨단1·2동 주민자치회 연계',
    location: '광주 광산구 쌍암공원 잔디마당',
    description:
      '신규 텐트 렌탈비 0원! 기존 동민의 날 축제 부스를 활용해 자가수리 나눔과 아파트 김밥 소풍을 엽니다.',
    maxCapacity: 40,
    currentApplicants: 27,
    eventDateLabel: '9~10월 축제 주말 11:00',
    isZeroFee: true,
  },
  {
    id: 'prog-2go-november-awards',
    stage: '2GO',
    monthTag: '11월',
    title: '우리동네 3GO 성과 공유회 & 비화폐성 디지털 명예 배지 헌액식',
    category: '성과공유',
    agencyName: '광주 광산 첨단 3GO TF & 행정 멘토',
    location: '광주 광산구 첨단종합사회복지관 대강당',
    description:
      '한 해 동안 동네네컷·자가수리·품앗이에 참여한 이웃들의 디지털 명예 배지 헌액 및 다음 단임 TF팀장 릴레이 지목식.',
    maxCapacity: 50,
    currentApplicants: 31,
    eventDateLabel: '11월 셋째 토요일 14:00',
    isZeroFee: true,
  },
];

/**
 * `/community` 페이지용 1GO 8대 고정 클래스 + 2GO 3~11월 캘린더 데이터를 로드합니다.
 * Neon DB `programs` 테이블의 최신 `current_applicants` 및 주민 신규 개설 클래스를 병합합니다.
 */
export async function getCommunityData(): Promise<CommunityPageData> {
  'use cache';
  cacheLife('minutes');

  const db = getOptionalDb();
  if (!db) {
    return {
      stage1Classes: FIXED_1GO_CLASSES,
      stage2Calendar: FIXED_2GO_CALENDAR,
      dataSource: 'DEMO_SNAPSHOT',
    };
  }

  try {
    const dbRows = await db
      .select()
      .from(programs)
      .orderBy(asc(programs.eventDate));

    const dbById = new Map(dbRows.map((row) => [row.id, row]));

    const merged1Go = FIXED_1GO_CLASSES.map((item) => {
      const found = dbById.get(item.id);
      return found
        ? {
            ...item,
            currentApplicants: found.currentApplicants,
            maxCapacity: found.maxCapacity,
          }
        : item;
    });

    const merged2Go = FIXED_2GO_CALENDAR.map((item) => {
      const found = dbById.get(item.id);
      return found
        ? {
            ...item,
            currentApplicants: found.currentApplicants,
            maxCapacity: found.maxCapacity,
          }
        : item;
    });

    // 주민이 모달에서 새로 제안해 DB에 저장된 추가 클래스 병합
    const fixedIds = new Set([
      ...FIXED_1GO_CLASSES.map((i) => i.id),
      ...FIXED_2GO_CALENDAR.map((i) => i.id),
    ]);

    for (const row of dbRows) {
      if (fixedIds.has(row.id)) continue;
      const customItem: CommunityClassItem = {
        id: row.id,
        stage: row.stage,
        title: row.title,
        category: row.category,
        agencyName: row.agencyName,
        location: row.location,
        description: row.description,
        maxCapacity: row.maxCapacity,
        currentApplicants: row.currentApplicants,
        eventDateLabel: new Intl.DateTimeFormat('ko-KR', {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(row.eventDate),
        monthTag: row.stage === '2GO' ? '주민제안' : undefined,
        isZeroFee: true,
        isResidentProposed: true,
      };
      if (row.stage === '1GO') {
        merged1Go.unshift(customItem);
      } else {
        merged2Go.unshift(customItem);
      }
    }

    return {
      stage1Classes: merged1Go,
      stage2Calendar: merged2Go,
      dataSource: 'NEON_DB',
    };
  } catch (error) {
    console.warn('[CommunityData] Neon DB 조회 실패 ➔ 스냅샷 전환:', error);
    return {
      stage1Classes: FIXED_1GO_CLASSES,
      stage2Calendar: FIXED_2GO_CALENDAR,
      dataSource: 'DEMO_SNAPSHOT',
    };
  }
}
