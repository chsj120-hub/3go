export type DesignProposalId = 'A' | 'B' | 'C';

export interface DesignProposalSpec {
  id: DesignProposalId;
  shortLabel: string;
  title: string;
  tagline: string;
  recommended?: boolean;
  krdsComplianceScore: string;
  webMogakjakTone: string;
  mobileCheeezeTone: string;
  bestFor: string;
}

export const DESIGN_PROPOSALS: Record<DesignProposalId, DesignProposalSpec> = {
  A: {
    id: 'A',
    shortLabel: '시안 A · KRDS 표준',
    title: 'KRDS 공공 신뢰형 + 모각작 미니멀',
    tagline: '정부 공식 딥블루(#246BEB) 중심 · 정돈된 공공 리빙랩 톤',
    krdsComplianceScore: 'KRDS AAA/AA 최우선',
    webMogakjakTone:
      '명확한 1px 보더 카드, 느슨한 연대 참여 현황, 정갈한 신규 마스코트 성장 슬롯',
    mobileCheeezeTone:
      '밝은 라이트 카드 기반 스팟 스와이프 + D-7 쿠폰 타이머 + 고대비 띱 버튼',
    bestFor: '지자체 주민참여예산·공공기관 평가에서 신뢰도와 접근성 최고점을 원할 때',
  },
  B: {
    id: 'B',
    shortLabel: '시안 B · SEED 친근형',
    title: 'SEED 웜 로컬 + 모각작 게이미피케이션 (추천)',
    tagline: '따뜻한 웜 화이트 + KRDS 보정 3GO 컬러 + 당근 SEED 카드·칩',
    recommended: true,
    krdsComplianceScore: 'KRDS AA(4.5:1+) + 세대포용 균형',
    webMogakjakTone:
      '부드러운 20px 라운드 카드, 신규 마스코트 마을 온도/레벨 바, 1클릭 참여 퍼널',
    mobileCheeezeTone:
      '따뜻한 웜 카드 스와이프 + 보급소 쿠폰 카운트다운 + 이웃 베스트 컷 띱 투표',
    bestFor: '초등학생부터 어르신까지 매일 쓰고 싶은 친근한 동네 앱 + 공공 표준 균형',
  },
  C: {
    id: 'C',
    shortLabel: '시안 C · 화이트 스튜디오',
    title: '확정안: 웹·기본은 시안 A(KRDS) / 모바일·네컷은 친근한 화이트 스튜디오',
    tagline: '글씨·색상·아이콘은 KRDS 시안 A 고정, 동네네컷만 화사한 화이트 포토 스튜디오 구성',
    recommended: true,
    krdsComplianceScore: 'KRDS AAA/AA(4.5:1+) 완전 준수',
    webMogakjakTone:
      'KRDS 딥블루(#246BEB)·1px 정돈 카드 + 모각작 신규 마스코트 성장 슬롯',
    mobileCheeezeTone:
      '다크 대신 친근한 화이트 포토 스튜디오(#FFFFFF/#F8FAFC) + 4컷 프레임 + D-7 쿠폰 + 띱 버튼',
    bestFor: '공공 신뢰성(시안 A)과 친근한 모바일·동네네컷 체험(시안 C 화이트)을 동시에 확보할 때',
  },
};

/** 레퍼런스(모각작·치이이즈·SEED)와 KRDS 지침 충돌 시 해결 기준 */
export const KRDS_CONFLICT_RULES = [
  {
    conflict: '밝은 에메랄드(#10B981)·오렌지(#F97316) 버튼 위 흰 글씨 명도 대비 미달(2.5~2.8:1)',
    resolution:
      'KRDS AA 4.5:1 우선 적용 ➔ 버튼/텍스트는 #047857(5.48:1), #C2410C(5.18:1), #1E3A8A(10.35:1) 사용, 원색은 장식/배지 포인트로 유지',
  },
  {
    conflict: '모바일 네컷 앱(치이이즈) 특유의 아이콘 단독 버튼·작은 12px 안내 문구',
    resolution:
      'KRDS·KWCAG 우선 적용 ➔ 모든 인터랙션 버튼 48~52px 이상 + 한글 텍스트 라벨 필수 병기 + Pretendard GOV 17px 기본 축 적용',
  },
  {
    conflict: '치이이즈의 7일 소멸 앨범 vs 공공 데이터의 투명 아카이빙',
    resolution:
      '시한부 행사 톡방·원정대 보급소 쿠폰 타이머에만 D-7 긴장감 UX를 적용하고, 예산 품의·회의록은 영구 투명 공개 유지',
  },
  {
    conflict: '모각작 캐릭터 마스코트 저작권 및 톤 충돌',
    resolution:
      '기존 모각작 캐릭터는 미사용하고, 추후 자체 제작할 광주 첨단 마스코트를 즉시 끼워 넣을 수 있는 전용 아바타 슬롯으로 설계',
  },
];
