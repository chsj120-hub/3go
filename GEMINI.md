# Antigravity Project Rules: 우리동네 3GO × 동네네컷 원정대
> **적용 경로:** 프로젝트 루트 `GEMINI.md` 또는 `.agent/rules/3go-core-rules.md`에 저장하여 사용하세요.

## 1. 프로젝트 정체성 및 목표
- **서비스명:** 우리동네 3GO × 동네네컷 원정대 (살피GO · 인사하GO · 이어지GO)
- **개발 목적:** 1인 개발로 제작하는 공모전 시연용(지자체 주민참여예산·리빙랩 / 광주광역시 공공데이터·AI 창업경진대회) 0원 무설치 모바일 PWA 웹앱.
- **핵심 철학:**
  1. **운영비·서버비 0원:** 무료 티어 인프라 + 온디바이스 AI 연산(브라우저 내 처리).
  2. **개인정보 유출 제로:** 카메라 영상 및 포즈 좌표는 서버 전송 금지(클라이언트 메모리 내 처리).
  3. **지자체 10분 복제(Fork):** 모든 지역 종속 설정(지역명, 중심 좌표, 공공 API 코드, 프레임 경로)은 반드시 `src/config/region.config.ts` 한 곳에서만 관리하고 컴포넌트 내 하드코딩을 금지한다.

## 2. 필수 기술 스택 (Tech Stack)
- **Framework:** Next.js 14+ (App Router, TypeScript strict mode)
- **Styling & UI:** Tailwind CSS + `shadcn/ui` + `lucide-react`
- **Database:** **Neon Serverless PostgreSQL** (`@neondatabase/serverless` + **Drizzle ORM**)
  - *주의:* Supabase 관련 패키지나 클라이언트는 절대 사용하지 않는다. 모든 DB 접근은 `src/db/index.ts`의 Neon + Drizzle 인스턴스를 통해서만 수행한다.
- **Auth & Session:** Auth.js (NextAuth v5) 기반 소셜 로그인 + **심사위원용 데모 역할 스위처(Cookie/Client State 기반 즉시 전환)**
- **On-device AI & Media:** `@mediapipe/tasks-vision` (2인 포즈 판정), `html5-qrcode` (QR 스캔), HTML5 Canvas (네컷+프레임+바코드 합성)
- **Admin Export:** `xlsx` (에듀파인/e호조 엑셀 생성), `jspdf` + `html2canvas` (회의록 PDF 및 1080×1080 카드뉴스 생성)

## 3. 아키텍처 및 디렉터리 규칙
모든 기능은 대학생 해커톤 및 타 지자체 유지보수가 쉽도록 도메인 모듈 단위로 격리한다.
```text
src/
├── config/
│   └── region.config.ts       # 지자체 커스텀 설정 (광주 기본값)
├── db/
│   ├── index.ts               # Neon serverless + Drizzle 연결
│   ├── schema.ts              # 8대 핵심 테이블 스키마
│   └── seed.ts                # 공모전 시연용 초기 목업 데이터 시딩
├── app/                       # Next.js App Router (얇은 라우팅 껍데기 유지)
├── modules/
│   ├── onboarding/            # 소셜 로그인, GPS 인증, 데모 스위처
│   ├── photospot/             # 동네네컷 (Safety Lock, QR, MediaPipe, Canvas, 쿠폰)
│   ├── community/             # 1~2단계 클래스 예약, 세대 버디 매칭, 민원 맵
│   ├── care-blind/            # 3단계 이어지GO (정회원 전용 블라인드 해제, SOS, 공구)
│   ├── safe-chat/             # 인앱 안심 톡방 + AI 회의록 PDF 변환
│   └── admin-ai/              # 4-Way 홍보문 생성, e호조/에듀파인 엑셀 변환
└── lib/
    ├── public-data.ts         # 공공데이터포털 6대 API + 자동 Fallback JSON
    └── ai-agent.ts            # 무료 Gemini API 프롬프트 템플릿
```

## 4. UI/UX 및 세대 포용 디자인 원칙 (필수 준수)
- **모바일 9:16 최적화:** 데스크톱 접속 시 중앙 `max-w-[430px]` 모바일 프레임으로 렌더링하고 배경을 깔끔하게 처리한다.
- **컬러 토큰:**
  - `1GO (살피GO)`: `#10B981` (안심 에메랄드)
  - `2GO (인사하GO)`: `#F97316` (활력 오렌지)
  - `3GO (이어지GO)`: `#1E3A8A` (신뢰 네이비)
  - `Background`: `#F8FAFC` (웜 화이트)
- **유니버설 접근성:**
  - 본문 최소 `16px`, 버튼·제목 `18~24px`, 주요 터치 버튼 높이 최소 `48px` 이상.
  - 상단 헤더에 **[가+ 큰 글씨 모드]** 토글을 상시 배치(활성화 시 전역 폰트 `1.25배` 확대).
  - 아이콘 단독 사용 금지(반드시 한글 텍스트 라벨 병기).
- **하단 5대 내비게이션 탭:**
  1. `🏠 홈`
  2. `🛠️ 살피·인사`
  3. `📸 동네네컷` (중앙 강조 돌출 버튼)
  4. `🤝 이어지GO` (**준회원일 경우 UI에서 완전 비노출/Blind 처리**)
  5. `👑 마이·행정`

## 5. 공모전 시연 안전장치 (Demo Mode & Fallback)
1. **원클릭 데모 스위처:** 화면 우측 상단에 반투명 플로팅 버튼(`[🎭 시연]`)을 상시 노출한다.
   - 역할 즉시 전환: `준회원(3단계 블라인드 확인)` ⇄ `정회원(3단계 활성화)` ⇄ `TF팀장(품의·회의록)` ⇄ `공무원(승인·e호조)`
   - 센서 시뮬레이터: `[가상 GPS: 광주 근린공원]`, `[보행 감지(Safety Lock) 테스트]`, `[악천후 실내 전환 알림]` 토글 제공.
2. **공공데이터 API Fallback:** `data.go.kr` API 호출이 타임아웃(3초)되거나 키가 누락된 경우, 에러 화면을 띄우지 말고 즉시 `src/data/fallback-public-data.json`의 광주광역시 실제 스키마 기반 데이터로 자동 전환한다.
3. **등급별 보안 통제:** `care-blind` API 및 페이지 진입 시 서버(Route Handler/Server Component)와 클라이언트 양쪽에서 `user.grade === 'REGULAR'` 이상인지 검증한다.

## 6. 코드 작성 스타일
- 모든 주석과 UI 텍스트, 에러 메시지는 자연스러운 한국어로 작성한다.
- 컴포넌트는 200줄을 넘지 않도록 기능별로 작게 쪼개고, 복잡한 상태 관리는 React Context 또는 Zustand로 단순화한다.
- DB 스키마 변경 시 반드시 `npx drizzle-kit push`로 Neon 개발 브랜치에 반영 가능하도록 Drizzle 문법을 엄격히 지킨다.