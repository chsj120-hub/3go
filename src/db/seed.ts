import { config } from 'dotenv';
import { REGION_CONFIG } from '../config/region.config';
import { getDb } from './index';
import {
  budgetProposals,
  chatMessages,
  communitySos,
  digitalBadges,
  localMerchants,
  photoQuestLogs,
  photoSpots,
  programs,
  users,
  type BudgetItem,
} from './schema';

// 로컬 실행 시 .env.local 우선, .env 보조 로드
config({ path: '.env.local' });
config({ path: '.env' });

/**
 * 공모전 시연용 멱등성(Idempotent) 시드 스크립트.
 * 기본 시범 지역: 광주광역시 광산구 첨단 (region.config.ts 연동)
 * 여러 번 실행해도 중복 오류가 발생하지 않도록 고정 ID + onConflictDoNothing()을 사용합니다.
 *
 * 시드 구성:
 * - 데모 계정 4종: 준회원 / 정회원 / TF팀장 / 공무원
 * - 1~2단계 대표 프로그램 6종 (살피GO 3종, 인사하GO 3종)
 * - 동네네컷 원정대 3스팟 (쌍암공원 · 응암공원 · 첨단생활체육공원)
 * - 원정대 보급소(골목 상점) 4곳 (첨단 쌍암동·월계동 일대)
 * - 3단계 생활 품앗이 SOS 3건
 * - 공개 예산 품의 3건 (e호조/에듀파인 표준 품목 포함)
 * - 보조 시연 데이터: 디지털 명예 배지 2건, 완주 로그 1건, 인앱 TF 톡방 로그 3건
 */
export async function runSeed() {
  const db = getDb();
  const now = new Date();
  const regionCode = REGION_CONFIG.regionCode;

  console.log(
    `🌱 [${REGION_CONFIG.displayName}] 우리동네 3GO 멱등성 시드를 시작합니다...`,
  );

  // 1. 데모 계정 4종 (준회원 / 정회원 / TF팀장 / 공무원)
  const demoUsers = [
    {
      id: 'demo-associate',
      email: 'associate@3go-demo.kr',
      nickname: '새싹이웃 민수',
      role: 'ASSOCIATE' as const,
      gpsVerifiedAt: null,
      regionCode,
      isCriminalCheckApproved: false,
    },
    {
      id: 'demo-regular',
      email: 'regular@3go-demo.kr',
      nickname: '첨단동 맥가이버',
      role: 'REGULAR' as const,
      gpsVerifiedAt: now,
      regionCode,
      isCriminalCheckApproved: true,
    },
    {
      id: 'demo-tf-leader',
      email: 'tf-leader@3go-demo.kr',
      nickname: '쌍암호수 원정대장',
      role: 'TF_LEADER' as const,
      gpsVerifiedAt: now,
      regionCode,
      isCriminalCheckApproved: true,
    },
    {
      id: 'demo-official',
      email: 'official@3go-demo.kr',
      nickname: '광산 마을지원관',
      role: 'OFFICIAL' as const,
      gpsVerifiedAt: now,
      regionCode,
      isCriminalCheckApproved: true,
    },
  ];

  await db.insert(users).values(demoUsers).onConflictDoNothing();
  console.log(`✅ 데모 계정 ${demoUsers.length}종 시드 완료`);

  // 2. 1~2단계 대표 프로그램 6종 (1GO 살피GO 3종 + 2GO 인사하GO 3종)
  const demoPrograms = [
    {
      id: 'prog-1go-fire-safety',
      stage: '1GO' as const,
      title: '우리 아파트 승강기 갇힘 탈출(7자리 ID) & 옥내소화전 실전 체험',
      category: '소방안전',
      agencyName: REGION_CONFIG.publicApi.fireStationName,
      location: '광주 광산구 쌍암동 첨단라인아파트 102동 복도 및 관리동 앞',
      description:
        '광주광산소방서 첨단119안전센터 출장 교육(무료). 승강기 7자리 고유번호 신고법과 실제 복도 옥내소화전·완강기 사용법을 이웃과 함께 실습합니다.',
      maxCapacity: 24,
      currentApplicants: 18,
      eventDate: new Date('2026-12-05T10:00:00+09:00'),
      regionCode,
    },
    {
      id: 'prog-1go-health-doctor',
      stage: '1GO' as const,
      title: '찾아가는 마을 활력 닥터 (혈압·혈당·CIST 조기 치매 선별)',
      category: '마을보건',
      agencyName: REGION_CONFIG.publicApi.healthCenterName,
      location: '광주 광산구 월계동 첨단부영아파트 커뮤니티센터',
      description:
        '광산구보건소 방문 간호팀과 함께하는 무료 건강 체크 및 어르신 낙상 예방 스트레칭 클래스입니다.',
      maxCapacity: 30,
      currentApplicants: 22,
      eventDate: new Date('2026-12-08T14:00:00+09:00'),
      regionCode,
    },
    {
      id: 'prog-1go-diy-repair',
      stage: '1GO' as const,
      title: '은퇴 장인의 자가수리 학교 (방충망·수전 트랩·LED 교체)',
      category: '자가수리',
      agencyName: '광주광역시 광산구 노인일자리 시니어 기술단',
      location: '광주 광산구 첨단1동 행정복지센터 1층 공유공방',
      description:
        '은퇴 설비 장인이 직접 알려주는 생활 수리 특강! 남은 실리콘·LED 자재를 이웃과 나누는 잉여 자재 나눔 은행도 함께 열립니다.',
      maxCapacity: 16,
      currentApplicants: 14,
      eventDate: new Date('2026-12-12T10:30:00+09:00'),
      regionCode,
    },
    {
      id: 'prog-2go-baduk-board',
      stage: '2GO' as const,
      title: '세대교차 고스트 바둑왕전 & 현대 전략 보드게임',
      category: '세대바둑',
      agencyName: '첨단 마을교육공동체 × GIST 대학생 봉사단',
      location: '광주 광산구 월계동 첨단도서관 다목적실',
      description:
        '직함·나이 계급장을 뗀 가명 닉네임 4주 시즌제! 어르신의 훈수와 청년·초등학생의 두뇌 플레이가 만나는 세대 화합 보드게임 리그입니다.',
      maxCapacity: 20,
      currentApplicants: 15,
      eventDate: new Date('2026-12-14T15:00:00+09:00'),
      regionCode,
    },
    {
      id: 'prog-2go-esports-pcbang',
      stage: '2GO' as const,
      title: '동네 PC방 비수기 상생 대관 — 세대통합 E-스포츠 팀전',
      category: 'E스포츠',
      agencyName: '비수기 상생 첨단 E-존 PC방',
      location: '광주 광산구 첨단중앙로 124 3층 (쌍암동 중심상가)',
      description:
        '평일 오전 비수기 동네 PC방을 상생 대관해 시니어 사령관 + 청년 컨트롤 2인 1조 스타크래프트 협동전을 펼칩니다.',
      maxCapacity: 16,
      currentApplicants: 12,
      eventDate: new Date('2026-12-19T10:00:00+09:00'),
      regionCode,
    },
    {
      id: 'prog-2go-village-table',
      stage: '2GO' as const,
      title: '혼밥 탈출 마을 한솥밥 & 쌍암공원 호수 생태 버디 투어',
      category: '마을식탁',
      agencyName: '광산 첨단 마을안심 TF 1기',
      location: '광주 광산구 산월동 공유주방 & 쌍암공원 일대',
      description:
        '1인 가구 청년과 신노년층이 2인 1조 버디로 쌍암공원을 산책한 뒤 공유주방에서 함께 따뜻한 한 끼를 만들어 나눕니다.',
      maxCapacity: 20,
      currentApplicants: 16,
      eventDate: new Date('2026-12-21T11:00:00+09:00'),
      regionCode,
    },
  ];

  await db.insert(programs).values(demoPrograms).onConflictDoNothing();
  console.log(`✅ 1~2단계 대표 프로그램 ${demoPrograms.length}종 시드 완료`);

  // 3. 동네네컷 원정대 3스팟 (광주 광산구 첨단 반경 1.5km 생활권 산책 코스)
  const demoPhotoSpots = [
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
      poseMissionType: 'STRETCH' as const,
      frameAssetUrl: REGION_CONFIG.frameAssets.variants[1].path,
      regionCode,
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
      poseMissionType: 'BIG_HEART' as const,
      frameAssetUrl: REGION_CONFIG.frameAssets.defaultFrameUrl,
      regionCode,
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
      poseMissionType: 'HIGH_FIVE' as const,
      frameAssetUrl: REGION_CONFIG.frameAssets.variants[2].path,
      regionCode,
    },
  ];

  await db.insert(photoSpots).values(demoPhotoSpots).onConflictDoNothing();
  console.log(`✅ 동네네컷 원정대 스팟 ${demoPhotoSpots.length}곳 시드 완료`);

  // 4. 원정대 보급소(골목 상권 제휴 상점) 4곳 (첨단 쌍암동·월계동 일대)
  const demoMerchants = [
    {
      id: 'merchant-cheomdan-01',
      name: '쌍암 호수로스터스',
      category: '카페',
      address: '광주광역시 광산구 첨단중앙로182번길 22 1층 (쌍암동)',
      lat: 35.2214,
      lng: 126.8435,
      couponTitle: '동네네컷 완주자 아메리카노 할인',
      discountText: '전 음료 1,000원 즉시 할인',
      barcodePrefix: '3GO-CHD01',
      regionCode,
      isActive: true,
    },
    {
      id: 'merchant-cheomdan-02',
      name: '월계 수제식빵공방',
      category: '베이커리',
      address: '광주광역시 광산구 임방울대로 688 1층 (월계동)',
      lat: 35.2175,
      lng: 126.8352,
      couponTitle: '산책 원정대 갓 구운 단팥빵 보급',
      discountText: '5,000원 이상 구매 시 단팥빵 1개 증정',
      barcodePrefix: '3GO-CHD02',
      regionCode,
      isActive: true,
    },
    {
      id: 'merchant-cheomdan-03',
      name: '첨단 추억의 떡볶이',
      category: '분식',
      address: '광주광역시 광산구 첨단중앙로 152 1층 (쌍암동)',
      lat: 35.2189,
      lng: 126.8428,
      couponTitle: '세대 동반 원정대 간식 보급소',
      discountText: '세트 메뉴 15% 할인 (포장 가능)',
      barcodePrefix: '3GO-CHD03',
      regionCode,
      isActive: true,
    },
    {
      id: 'merchant-cheomdan-04',
      name: '비수기 상생 첨단 E-존 PC방',
      category: '동네PC방',
      address: '광주광역시 광산구 첨단중앙로 124 3층 (쌍암동)',
      lat: 35.2162,
      lng: 126.8426,
      couponTitle: '세대통합 원정대 평일 오전 상생 이용권',
      discountText: '어르신·청년 동반 방문 시 2시간 무료',
      barcodePrefix: '3GO-CHD04',
      regionCode,
      isActive: true,
    },
  ];

  await db.insert(localMerchants).values(demoMerchants).onConflictDoNothing();
  console.log(`✅ 원정대 보급소(골목 상점) ${demoMerchants.length}곳 시드 완료`);

  // 5. 3단계(이어지GO) 생활 품앗이 SOS 3건 (정회원 전용)
  const demoSosList = [
    {
      id: 'sos-cheomdan-01',
      authorId: 'demo-regular',
      category: 'CARRY' as const,
      title: '생수 2묶음과 쌀 20kg 현관 안쪽 이동 도와주실 이웃님',
      description:
        '무릎 수술 회복 중이라 현관 앞에 배송된 생수와 쌀을 부엌까지 옮기기 어렵습니다. 5분 정도만 손 빌려주시면 감사하겠습니다.',
      locationHint:
        '광주 광산구 쌍암동 첨단라인아파트 103동 (정회원 매칭 후 호수 공개)',
      status: 'OPEN' as const,
    },
    {
      id: 'sos-cheomdan-02',
      authorId: 'demo-tf-leader',
      category: 'REPAIR' as const,
      title: '안방 LED 형광등 깜빡임 교체 도움 요청 (자재 구매 완료)',
      description:
        '자가수리 학교에서 배운 대로 새 LED 모듈을 사두었는데, 사다리 위 작업이 불안해서 아래에서 잡아주시거나 함께 교체해 주실 분 찾습니다.',
      locationHint: '광주 광산구 월계동 첨단부영아파트 인근',
      status: 'MATCHED' as const,
    },
    {
      id: 'sos-cheomdan-03',
      authorId: 'demo-regular',
      category: 'TOOL' as const,
      title: '[스마트 공구도서관] 충전 전동드릴 + 십자비트 세트 1일 대여',
      description:
        '베란다 수납선반 고정용으로 토요일 오후 2~5시 사이 전동드릴 잠시 빌려주실 수 있을까요? 사용 후 깔끔하게 닦아 반납하겠습니다.',
      locationHint: '광주 광산구 산월동 호반리젠시빌 경비실 앞 전달 희망',
      status: 'OPEN' as const,
    },
  ];

  await db.insert(communitySos).values(demoSosList).onConflictDoNothing();
  console.log(`✅ 3단계 생활 품앗이 SOS ${demoSosList.length}건 시드 완료`);

  // 6. 공개 예산 품의 3건 (에듀파인/e호조 엑셀 표준 항목 포함)
  const repairItems: BudgetItem[] = [
    {
      itemName: '미세 방충망 롤(알루미늄)',
      spec: '90cm × 30m',
      quantity: 4,
      unitPrice: 45000,
      amount: 180000,
      basis: '실습 16가구 × 1.5m + 여분',
      purchaseUrl: 'https://www.g2b.go.kr',
      note: '잉여 자재 나눔 은행 귀속',
    },
    {
      itemName: '고효율 LED 방등 교체 키트',
      spec: '50W KS인증 모듈',
      quantity: 10,
      unitPrice: 22000,
      amount: 220000,
      basis: '취약계층 실습 시범 교체 10가구',
      purchaseUrl: 'https://www.g2b.go.kr',
    },
    {
      itemName: '방충망 고무 가스켓 및 롤러 세트',
      spec: '실습 공용 8세트',
      quantity: 8,
      unitPrice: 10000,
      amount: 80000,
      basis: '2인 1조 실습 공구 비치',
      purchaseUrl: 'https://www.g2b.go.kr',
    },
  ];

  const esportsItems: BudgetItem[] = [
    {
      itemName: '동네 PC방 비수기 오전 상생 대관료',
      spec: '20좌석 × 3시간 (평일 09:00~12:00)',
      quantity: 1,
      unitPrice: 250000,
      amount: 250000,
      basis: '광산구 첨단 제휴 PC방 상생 협약 단가',
      purchaseUrl: 'https://www.gwangsan.go.kr',
      note: '신규 렌탈 배제·골목 상권 직접 환원',
    },
    {
      itemName: '세대통합 참가자 보급소 간식 바우처',
      spec: '원정대 보급소 제휴 떡볶이·음료',
      quantity: 20,
      unitPrice: 5000,
      amount: 100000,
      basis: '참가자 20명 × 5,000원',
      purchaseUrl: 'https://www.gwangsan.go.kr',
    },
  ];

  const badukItems: BudgetItem[] = [
    {
      itemName: '접이식 자석 바둑판 및 전략 보드게임 세트',
      spec: '세대교차 공용 키트 6종',
      quantity: 4,
      unitPrice: 40000,
      amount: 160000,
      basis: '첨단도서관 상시 비치용',
      purchaseUrl: 'https://www.s2b.kr',
      note: '에듀파인 학교·마을교육 연계 비품',
    },
    {
      itemName: '명예 배지 스티커 및 닉네임 명찰 제작',
      spec: '친환경 종이 명찰 40매',
      quantity: 40,
      unitPrice: 1500,
      amount: 60000,
      basis: '계급장 없는 가명 닉네임 교류 원칙',
      purchaseUrl: 'https://www.s2b.kr',
    },
  ];

  const demoProposals = [
    {
      id: 'prop-cheomdan-01',
      programId: 'prog-1go-diy-repair',
      proposerId: 'demo-tf-leader',
      title: '[1GO] 은퇴 장인 자가수리 학교 실습 자재 구입 품의',
      itemsJson: repairItems,
      totalAmount: 480000,
      status: 'APPROVED' as const,
      targetSystem: 'EHOJO' as const,
    },
    {
      id: 'prop-cheomdan-02',
      programId: 'prog-2go-esports-pcbang',
      proposerId: 'demo-tf-leader',
      title: '[2GO] 동네 PC방 비수기 상생 대관 세대통합 E-스포츠 품의',
      itemsJson: esportsItems,
      totalAmount: 350000,
      status: 'PENDING' as const,
      targetSystem: 'EHOJO' as const,
    },
    {
      id: 'prop-cheomdan-03',
      programId: 'prog-2go-baduk-board',
      proposerId: 'demo-tf-leader',
      title: '[2GO] 초등·시니어 고스트 바둑왕전 교구 및 명찰 구입 품의',
      itemsJson: badukItems,
      totalAmount: 220000,
      status: 'PENDING' as const,
      targetSystem: 'EDUFINE' as const,
    },
  ];

  await db.insert(budgetProposals).values(demoProposals).onConflictDoNothing();
  console.log(`✅ 공개 예산 품의 ${demoProposals.length}건 시드 완료`);

  // 7. 보조 시연 데이터: 디지털 명예 배지 2건, 동네네컷 완주 로그 1건, TF 안심 톡방 로그 3건
  await db
    .insert(digitalBadges)
    .values([
      {
        id: 'badge-cheomdan-01',
        userId: 'demo-regular',
        badgeCode: 'PHOTOSPOT_FINISHER_CHEOMDAN',
        badgeName: '광주 광산 첨단 동네네컷 원정대 1기 완주자',
      },
      {
        id: 'badge-cheomdan-02',
        userId: 'demo-tf-leader',
        badgeCode: 'TF_SINGLE_TERM_LEADER',
        badgeName: '투명한 단임 마을 TF팀장 명예장',
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(photoQuestLogs)
    .values([
      {
        id: 'quest-cheomdan-01',
        userId: 'demo-regular',
        merchantId: 'merchant-cheomdan-01',
        courseName: REGION_CONFIG.frameAssets.courseTitle,
        stepCount: 4520,
        sharedImageUrl: null,
        couponBarcode: '3GO-CHD01-20261125-0001',
        isCouponUsed: false,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(chatMessages)
    .values([
      {
        id: 'chat-tf-01',
        roomId: 'room-tf-cheomdan-2026',
        roomType: 'TF_WORK' as const,
        senderId: 'demo-tf-leader',
        senderNickname: '쌍암호수 원정대장',
        content:
          '12월 첨단1동 자가수리 학교 자재 품의서 e호조 양식으로 올렸습니다. 방충망과 LED 모듈은 시범 교체 후 남은 자재를 나눔 은행에 보관하기로 했습니다.',
      },
      {
        id: 'chat-tf-02',
        roomId: 'room-tf-cheomdan-2026',
        roomType: 'TF_WORK' as const,
        senderId: 'demo-official',
        senderNickname: '광산 마을지원관',
        content:
          '품의 항목 단가와 G2B 산출기초 확인 완료했습니다! 오늘 중으로 e호조 승인 처리하고, 다음 주 첨단 PC방 상생 대관 안전점검표도 같이 챙기겠습니다.',
      },
      {
        id: 'chat-tf-03',
        roomId: 'room-tf-cheomdan-2026',
        roomType: 'TF_WORK' as const,
        senderId: 'demo-regular',
        senderNickname: '첨단동 맥가이버',
        content:
          '공구도서관 전동드릴 2대 기증 접수되었습니다. 토요일 자가수리 클래스 보조 강사로 참여하겠습니다!',
      },
    ])
    .onConflictDoNothing();

  console.log('🎉 모든 공모전 시연용 멱등성 시드 데이터 적재가 완료되었습니다!');
}

// CLI 직접 실행 시 진입점 (`npm run db:seed`)
const isDirectRun =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'));

if (isDirectRun) {
  runSeed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ 시드 실행 중 오류가 발생했습니다:', err);
      process.exit(1);
    });
}
