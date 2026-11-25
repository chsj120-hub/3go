# Antigravity Agent Skills Package: 3GO × 동네네컷
> **사용 방법:** 아래 4개의 스킬 블록을 각각 `.agent/skills/<폴더명>/SKILL.md` 파일로 나누어 저장하세요. Antigravity 에이전트가 해당 작업 요청 시 자동으로 스킬을 로드해 정확한 규격대로 코드를 생성합니다.

---

## Skill 1: `.agent/skills/3go-ui-design-system/SKILL.md`

```yaml
---
name: 3go-ui-design-system
description: 우리동네 3GO 프로젝트의 세대 포용형(초등학생~시니어) 유니버설 모바일 PWA UI 컴포넌트, 큰 글씨 모드, 하단 5대 탭 및 데모 스위처를 설계하고 구현할 때 사용합니다.
---
```

### 지침 (Instructions)
1. **모바일 컨테이너 & 레이아웃**
   - 최상위 레이아웃은 `max-w-[430px] mx-auto min-h-dvh bg-[#F8FAFC] shadow-xl relative pb-24` 구조를 사용한다.
   - 상단 헤더에는 로고(`우리동네 3GO`), 현재 동네 GPS 인증 배지(예: `광주 서구 인증됨`), 그리고 **[가+ 큰 글씨]** 토글 버튼을 배치한다.
2. **큰 글씨 모드 (Senior Accessibility)**
   - `LargeTextContext`를 통해 `isLargeText` 상태를 전역 관리한다.
   - 활성화 시 `document.documentElement`에 `text-[125%]` 또는 CSS 변수 스케일업을 적용해 버튼과 본문이 깨지지 않고 자연스럽게 확대되게 한다.
3. **단계별 시맨틱 컬러**
   - 1GO(살피GO): `bg-emerald-500 text-white` / 연한 카드 `bg-emerald-50 border-emerald-200`
   - 2GO(인사하GO): `bg-orange-500 text-white` / 연한 카드 `bg-orange-50 border-orange-200`
   - 3GO(이어지GO): `bg-blue-900 text-white` / 연한 카드 `bg-blue-50 border-blue-200`
4. **하단 내비게이션 & 블라인드 규칙**
   - 5개 탭: `홈`, `살피·인사`, `동네네컷(중앙 돌출 원형 버튼)`, `이어지GO`, `마이·행정`.
   - `currentUser.role === 'ASSOCIATE'`(준회원)일 때는 `이어지GO` 탭을 렌더링하지 않거나 잠금 배지로 완전 격리해 3단계 블라인드 보안을 시각적으로 시연할 수 있어야 한다.
5. **플로팅 데모 스위처 (`DemoSwitcher.tsx`)**
   - 우측 상단(헤더 아래)에 반투명 플로팅 버튼을 두고 클릭 시 바텀시트를 연다.
   - 바텀시트에서 4개 역할(`준회원`, `정회원`, `TF팀장`, `공무원`) 즉시 전환과 3개 센서 시뮬레이션(`가상 GPS 도착`, `Safety Lock 발동`, `악천후 알림`)을 원클릭으로 제어할 수 있어야 한다.

---

## Skill 2: `.agent/skills/3go-neon-db-schema/SKILL.md`

```yaml
---
name: 3go-neon-db-schema
description: Neon Serverless PostgreSQL과 Drizzle ORM을 사용해 우리동네 3GO의 8대 핵심 테이블 스키마, 시드 데이터, 서버 액션을 작성할 때 사용합니다.
---
```

### 지침 (Instructions)
1. **Neon 연결 설정 (`src/db/index.ts`)**
   - `@neondatabase/serverless`의 `neon(process.env.DATABASE_URL!)`과 `drizzle-orm/neon-http`를 사용한다.
   - 로컬 개발 및 공모전 시연 시 `DATABASE_URL`이 비어 있더라도 앱이 크래시되지 않도록 메모리 Fallback 어댑터를 옵션으로 제공한다.
2. **8대 필수 테이블 (`src/db/schema.ts`)**
   - `users`: `id`, `nickname`(가명), `role`(`ASSOCIATE` | `REGULAR` | `TF_LEADER` | `OFFICIAL`), `gpsVerifiedAt`, `regionCode`, `isCriminalCheckApproved`(성범죄 경력 조회 승인 여부)
   - `programs`: `id`, `stage`(`1GO` | `2GO`), `title`, `category`(소방/수리/보건/PC방/바둑 등), `agencyName`, `location`, `maxCapacity`, `eventDate`
   - `budgetProposals`: `id`, `programId`, `proposerId`, `title`, `itemsJson`(품목·단가·수량·구매처 링크), `totalAmount`, `status`(`PENDING` | `APPROVED`), `targetSystem`(`EDUFINE` | `EHOJO`)
   - `communitySos`: `id`, `authorId`, `category`(`CARRY` | `REPAIR` | `ESCORT` | `TOOL`), `title`, `description`, `status`(`OPEN` | `MATCHED` | `DONE`), `createdAt`
   - `digitalBadges`: `id`, `userId`, `badgeCode`, `badgeName`, `awardedAt`
   - `photoSpots`: `id`, `courseName`, `spotOrder`, `spotName`, `lat`, `lng`, `qrCodeKey`, `poseMissionType`(`STRETCH` | `BIG_HEART` | `MASCOT_POSE` | `HIGH_FIVE`), `frameAssetUrl`
   - `photoQuestLogs`: `id`, `userId`, `courseName`, `stepCount`, `sharedImageUrl`, `couponBarcode`, `isCouponUsed`, `completedAt`
   - `chatMessages`: `id`, `roomId`, `roomType`(`TF_WORK` | `EVENT_TEMP`), `senderId`, `senderNickname`, `content`, `expiresAt`, `createdAt`
3. **시딩 전략 (`src/db/seed.ts`)**
   - 광주광역시 근린공원 기반 `photoSpots` 4개, 1GO/2GO 프로그램 6개, 시연용 `communitySos` 3건, 데모 유저 4명을 기본 시드 데이터로 삽입한다.

---

## Skill 3: `.agent/skills/3go-photospot-ai/SKILL.md`

```yaml
---
name: 3go-photospot-ai
description: 동네네컷 원정대의 Safety Lock(보행 잠금), QR 스팟 스캐너, 온디바이스 MediaPipe 2인 협동 포즈 판정, HTML5 Canvas 네컷·쿠폰 합성을 구현할 때 사용합니다.
---
```

### 지침 (Instructions)
1. **Safety Lock (보행 중 화면 잠금)**
   - `window.addEventListener('devicemotion', ...)`으로 가속도 변화량을 감지한다.
   - 임계치 초과 시 화면 전체에 반투명 블러 오버레이(`backdrop-blur-md bg-black/75`)와 큰 경고 문구("안전하게 멈춘 뒤 촬영해 주세요")를 띄운다.
   - 데모 스위처의 `simulateWalking` 상태와 연동해 PC/발표장에서도 즉시 시연 가능하게 만든다.
2. **온디바이스 2인 협동 포즈 판정**
   - `@mediapipe/tasks-vision`의 `PoseLandmarker`를 브라우저에서 로드한다 (`numPoses: 2`).
   - 포즈 미션 예시:
     - `BIG_HEART`: 2인의 양손목 랜드마크가 머리 위에서 근접할 때 성공 판정.
     - `HIGH_FIVE`: 2인의 손목 랜드마크 간 유클리드 거리가 임계치 이하일 때 성공 판정.
   - 카메라 권한이 없거나 발표장 조명이 어두울 때를 대비해 **[데모용 즉시 촬영(3초 카운트다운)]** 보조 버튼을 하단에 작게 제공한다.
3. **HTML5 Canvas 네컷 + 로컬 상권 쿠폰 합성**
   - 4컷 촬영 완료 시 오프스크린 `<canvas>`(1080×1920)에 4장의 사진, `region.config.ts`의 지역 특화 프레임, 촬영 날짜, 스팟명, 그리고 하단에 **원정대 보급소(골목 상점) 할인 바코드**를 렌더링한다.
   - `canvas.toDataURL('image/png')`로 즉시 기기 다운로드 버튼을 제공하며, 사용자가 명시적으로 **[마을 갤러리에 자랑하기]**를 누를 때만 DB에 저장한다.

---

## Skill 4: `.agent/skills/3go-admin-automation/SKILL.md`

```yaml
---
name: 3go-admin-automation
description: 공무원·TF팀장의 업무를 제로화하는 AI 4-Way 홍보문 생성, 에듀파인/e호조 엑셀 변환, 인앱 톡방 회의록 PDF 출력, 공공데이터 6대 API 연동을 구현할 때 사용합니다.
---
```

### 지침 (Instructions)
1. **AI 4-Way 홍보문 원클릭 생성 (`src/modules/admin-ai/`)**
   - 입력: 행사명, 일시, 장소, 대상, 핵심 내용.
   - 출력 탭 4개: ① 아파트 엘리베이터 공고문, ② 언론 보도자료 초안, ③ 주민 안내 문자/SNS 글, ④ 1080×1080 카드뉴스 프리뷰(Canvas 이미지 저장).
   - Gemini 무료 티어 API(`GEMINI_API_KEY`)를 호출하되, API 키 미설정 시 완성도 높은 사전 템플릿 스트리밍 시뮬레이션으로 동작하게 한다.
2. **공개 품의 폼 ➔ 에듀파인/e호조 엑셀(.xlsx) 자동 변환**
   - `xlsx` (SheetJS) 라이브러리를 사용해 `budgetProposals` 데이터를 공공 회계 표준 컬럼(`품목명`, `규격`, `수량`, `단가`, `금액`, `산출기초`, `구매처링크`, `비고`)으로 시트를 구성해 즉시 `.xlsx` 파일로 다운로드시킨다.
3. **인앱 안심 톡방 회의록 PDF 변환**
   - `chatMessages`의 대화 로그를 AI로 `[회의 개요 / 주요 결정사항 / 예산 및 역할 분담 / 다음 일정]` 4단 구조로 요약하고, `jspdf` 또는 인쇄용 레이아웃으로 공식 회의록 PDF를 출력한다.
4. **공공데이터 6대 API 어댑터 (`src/lib/public-data.ts`)**
   - 대상 6종: ① 광주시 도시공원정보, ② 생활안전지도·보안등·CCTV, ③ 소상공인 상권정보(원정대 보급소), ④ 소방서·옥내소화전, ⑤ 노인일자리·복지시설, ⑥ 기상청 단기예보·미세먼지.
   - 모든 호출 함수는 `try-catch` + 3초 타임아웃을 적용하고, 실패 시 `src/data/fallback-public-data.json`을 반환하며 UI에 `[실시간 API 연동]` 또는 `[시연용 스냅샷 모드]` 배지를 작게 표시한다.