/**
 * 1GO(살피GO) · 2GO(인사하GO) 원클릭 개설 예시 템플릿 모음.
 * 통합 기획서 부록 2(14대 생활 꿀팁 클래스) 및 부록 4(7대 상설 동네 크루) 기반으로
 * 처음 개설하는 주민·어르신도 클릭 한 번으로 예시를 채우고 수정할 수 있게 돕습니다.
 */

export interface Stage1Template {
  id: string;
  chipLabel: string;
  title: string;
  category: string;
  locationSuffix: string;
  maxCapacity: string;
  description: string;
}

export interface Stage2Template {
  id: string;
  chipLabel: string;
  title: string;
  category: string;
  monthTag: string;
  locationSuffix: string;
  maxCapacity: string;
  description: string;
}

export const STAGE1_QUICK_TEMPLATES: Stage1Template[] = [
  {
    id: 'tpl-1go-sink',
    chipLabel: '🔧 싱크대 경첩·방충망',
    title: '처진 싱크대 문짝 경첩 보강 & 방충망 셀프 수리',
    category: '생활기술',
    locationSuffix: '행정복지센터 1층 공유공방',
    maxCapacity: '12',
    description:
      '집에서 삐걱거리는 싱크대 경첩·댐퍼와 찢어진 방충망을 은퇴 장인과 함께 고쳐봅니다. 남은 피스·자재는 나눔 은행에서 무상 공유하며, 드라이버만 챙겨 오세요!',
  },
  {
    id: 'tpl-1go-ai',
    chipLabel: '📱 0원 AI 스마트폰·약봉투',
    title: '무료 AI로 약봉투 판독 & 옛날 가족사진 컬러 복원 교실',
    category: '디지털AI',
    locationSuffix: '행정복지센터 정보화교실',
    maxCapacity: '16',
    description:
      '스마트폰 카메라로 약봉투 복용법을 쉽게 읽어주고, 빛바랜 옛날 흑백 사진을 AI로 컬러 복원하는 무료 특강입니다. 스마트폰과 충전기만 가져오세요.',
  },
  {
    id: 'tpl-1go-repair-cafe',
    chipLabel: '♻️ 팝업 폐가전 리페어 카페',
    title: '팝업 폐가전 분해·수리 DIY 교실 (선풍기·드라이어·PC 청소)',
    category: '생활기술',
    locationSuffix: '첨단1동 공유공방 (분기 팝업)',
    maxCapacity: '14',
    description:
      '안 돌아가는 선풍기·스탠드·PC 먼지 청소를 청소년과 은퇴 장인이 함께 분해·수리합니다. 고압 위험 대형가전은 제외하며, 정상 부품은 부품 은행에 보관합니다.',
  },
  {
    id: 'tpl-1go-plant',
    chipLabel: '🌱 반려식물 분갈이 클리닉',
    title: '아파트 베란다 반려식물 분갈이 & 병해충 처방 교실',
    category: '독서문화',
    locationSuffix: '쌍암공원 야외 쉼터',
    maxCapacity: '18',
    description:
      '시들어가는 화분을 직접 들고 오시면 뿌리 정리와 분갈이를 도와드립니다. 다육이 잎꽂이·상추 모종도 이웃과 자유롭게 나눕니다.',
  },
  {
    id: 'tpl-1go-baby-safe',
    chipLabel: '🏠 층간소음 패드·안심 홈',
    title: '층간소음 방지 의자 패드 & 영유아 안심 홈 세팅 실습',
    category: '생활안전',
    locationSuffix: '단지 내 커뮤니티센터',
    maxCapacity: '15',
    description:
      '의자 발 패드 시공, 창문 스토퍼·문 끼임 방지 장치 설치 요령을 이웃과 함께 배우는 무료 생활안전 클래스입니다.',
  },
];

export const STAGE2_QUICK_TEMPLATES: Stage2Template[] = [
  {
    id: 'tpl-2go-seed',
    chipLabel: '🌱 씨앗·모종 도서관',
    title: '우리동네 씨앗·모종 도서관 & 베란다 텃밭 4주 챌린지',
    category: '생태버디',
    monthTag: '4월',
    locationSuffix: '첨단도서관 1층 로비',
    maxCapacity: '20',
    description:
      '상추·방울토마토 씨앗과 다육이 모종을 무료 대출받아 어르신 재배 노하우를 배우고, 학생이 그린 씨앗 봉투와 재배 네컷을 공유하는 4주 시즌제 모임입니다.',
  },
  {
    id: 'tpl-2go-plogging',
    chipLabel: '🧹 골목 줍깅·1365 봉사',
    title: '우리 골목 줍깅 & 스팟 동네네컷 환경 봉사 크루',
    category: '생활체육',
    monthTag: '상시',
    locationSuffix: '쌍암공원 입구 광장',
    maxCapacity: '20',
    description:
      '토요일 오전 1시간 통학로·공원 산책로를 함께 걸으며 쓰레기를 줍고, 동네네컷 스팟 인증으로 1365 봉사시간과 디지털 명예 배지를 적립합니다.',
  },
  {
    id: 'tpl-2go-photo-crew',
    chipLabel: '📸 스마트폰 출사 크루',
    title: '스마트폰 사진단 — 우리 동네 골목 갤러리 출사 크루',
    category: '마을축제',
    monthTag: '7~8월',
    locationSuffix: '응암공원 숲길 입구',
    maxCapacity: '16',
    description:
      '매주 토요일 오전 동네 꽃길과 숨은 명소를 걸으며 스마트폰 촬영 팁을 나누고, 완성된 동네네컷으로 주민센터 미니 사진전을 여는 4주 시즌 모임입니다.',
  },
  {
    id: 'tpl-2go-retro-game',
    chipLabel: '🎯 추억의 골목놀이 리그',
    title: '주말 세대통합 추억의 골목놀이 (딱지치기·보드게임 대항전)',
    category: '세대바둑',
    monthTag: '3월',
    locationSuffix: '쌍암공원 잔디광장',
    maxCapacity: '24',
    description:
      '직함·나이 없이 가명 닉네임으로 팀을 짜 어르신과 초등학생이 딱지치기·루미큐브·다빈치코드를 함께 즐기는 4주 시즌제 모임입니다.',
  },
  {
    id: 'tpl-2go-repair-buddy',
    chipLabel: '🍲 시니어 미식·반찬 나눔',
    title: '혼밥 탈출 시니어 미식 탐험대 & 반찬 공동 조리 버디',
    category: '마을식탁',
    monthTag: '6월',
    locationSuffix: '산월동 공유주방',
    maxCapacity: '16',
    description:
      '1인 가구 청년과 어르신이 2인 1조로 김치·밑반찬을 함께 만들어 나누고, 원정대 보급소 맛집 영수증 리뷰도 남기는 따뜻한 식탁 모임입니다.',
  },
];
