# 개발 지침 및 아키텍처 규칙: 우리동네 3GO × 동네네컷 원정대

> 본 문서는 루트 `GEMINI.md` 핵심 규칙을 개발팀·해커톤·지자체 복제(Fork) 담당자가 참고하기 쉽게 정리한 개발 지침서입니다.

## 1. 핵심 개발 철학
1. **운영비·서버비 0원:** Vercel + Neon Serverless PostgreSQL 무료 티어 + 온디바이스 AI 연산(브라우저 내 처리).
2. **개인정보 유출 제로:** 카메라 영상 및 MediaPipe 포즈 좌표는 서버 전송 금지(클라이언트 메모리 내 처리).
3. **지자체 10분 복제(Fork):** 모든 지역 종속 설정(지역명, 중심 좌표, 반경, 시군구 코드, 공공 API 코드, 프레임 경로)은 반드시 `src/config/region.config.ts` 한 곳에서만 관리하고 컴포넌트 내 하드코딩을 금지한다.

## 2. 필수 기술 스택
- **Framework:** Next.js 14+ (App Router, TypeScript strict mode)
- **Styling & UI:** Tailwind CSS + `shadcn/ui` + `lucide-react`
- **Database:** **Neon Serverless PostgreSQL** (`@neondatabase/serverless` + **Drizzle ORM** + `drizzle-kit`)
  - *금지:* Supabase 관련 패키지·클라이언트 절대 사용 금지. 모든 DB 접근은 `src/db/index.ts`를 통한다.
- **Auth & Session:** Auth.js (NextAuth v5) + 심사위원용 원클릭 데모 스위처
- **On-device AI & Media:** `@mediapipe/tasks-vision`, `html5-qrcode`, HTML5 Canvas
- **Admin Export:** `xlsx`, `jspdf`, `html2canvas`

## 3. 도메인 모듈 아키텍처
```text
db/
└── neon_schema.sql            # PostgreSQL 9대 핵심 테이블 DDL (Drizzle 스키마와 1:1 일치)
src/
├── config/
│   └── region.config.ts       # 지자체 커스텀 설정 (광주 광산구 첨단 기본값 + 복수 지역 지원)
├── db/
│   ├── index.ts               # Neon serverless + Drizzle 연결
│   ├── schema.ts              # 9대 핵심 테이블 스키마
│   └── seed.ts                # 공모전 시연용 멱등성 시드 스크립트
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

## 4. UI/UX & 세대 포용 접근성 규칙
- **모바일 9:16 최적화:** 데스크톱 접속 시 중앙 `max-w-[430px]` 모바일 프레임으로 렌더링.
- **컬러 토큰:**
  - `1GO (살피GO)`: `#10B981` (안심 에메랄드)
  - `2GO (인사하GO)`: `#F97316` (활력 오렌지)
  - `3GO (이어지GO)`: `#1E3A8A` (신뢰 네이비)
  - `Background`: `#F8FAFC` (웜 화이트)
- **접근성 필수 기준:**
  - 본문 최소 `16px`, 버튼·제목 `18~24px`, 주요 터치 버튼 높이 최소 `48px` 이상.
  - 상단 헤더 **[가+ 큰 글씨 모드]** 토글 상시 배치(전역 폰트 `1.25배` 확대).
  - 아이콘 단독 사용 금지(반드시 한글 텍스트 라벨 병기).
- **하단 5대 탭:** `🏠 홈`, `🛠️ 살피·인사`, `📸 동네네컷`(중앙 돌출), `🤝 이어지GO`(준회원 비노출/Blind), `👑 마이·행정`.

## 5. 공모전 시연 안전장치 & 보안
1. **원클릭 데모 스위처(`[🎭 시연]`):** 역할 4종(`준회원`, `정회원`, `TF팀장`, `공무원`) 즉시 전환 및 센서 시뮬레이터 3종(`가상 GPS`, `Safety Lock`, `악천후 알림`) 제공.
2. **공공데이터 API Fallback:** 3초 타임아웃 또는 API 키 누락 시 `src/data/fallback-public-data.json`으로 무중단 전환.
3. **등급별 이중 보안 검증:** `care-blind` 영역은 서버(Route Handler/Server Component)와 클라이언트 양쪽에서 `REGULAR` 이상 등급 여부를 검증한다.

## 6. 코드 작성 및 DB 운용 규칙
- 모든 주석, UI 텍스트, 에러 메시지는 자연스러운 한국어로 작성한다.
- 단일 컴포넌트는 200줄을 넘기지 않도록 모듈화한다.
- 스키마 변경 후 `npm run db:push`로 Neon DB에 반영하고, `npm run db:seed`로 멱등성 시드를 실행한다.
