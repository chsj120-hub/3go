---
name: 3go-ui-design-system
description: 우리동네 3GO 프로젝트의 세대 포용형(초등학생~시니어) 유니버설 모바일 PWA UI 컴포넌트, 큰 글씨 모드, 하단 5대 탭 및 데모 스위처를 설계하고 구현할 때 사용합니다.
---

# 우리동네 3GO UI 디자인 시스템 스킬 (KRDS 시안 A + 화이트 스튜디오 확정안)

## 확정 디자인 방향
- **전역 기본(웹·PC·생활·행정):** **시안 A (KRDS 대한민국 정부 디지털 디자인 시스템 공공 신뢰형 + 모각작 미니멀)**
  - 글씨(`Pretendard GOV` 17px, 행간 1.5, Regular 400 / Bold 700), 색상(KRDS 블루 `#246BEB` 기본, 본문 `#1D1D1D`, 보조 `#555555`, WCAG AA 4.5:1+ 고대비), 아이콘 및 정돈된 1px 보더 스타일을 전역 기준으로 고정한다.
- **모바일 진입(홈) & 동네네컷(`/photospot`):** **시안 C 화이트 스튜디오 톤**
  - 다크 배경 대신 친근하고 화사한 화이트(`#FFFFFF` / `#F8FAFC`) 포토 스튜디오 톤을 유지하면서, 모각작 마스코트 성장 슬롯·치이이즈 D-7 보급소 쿠폰 타이머·4컷 프레임 프리뷰·'띱!' 베스트 컷 투표·QR 원터치 초대 UX를 결합한다.

## 지침 (Instructions)

1. **모바일 컨테이너 & KRDS 헤더**
   - 최상위 레이아웃은 `max-w-[430px] mx-auto min-h-dvh bg-[#F8FAFC] shadow-2xl relative pb-28` 구조를 사용한다.
   - 헤더 최상단에 KRDS 공공 리빙랩 안내 바를 배치하고, 로고(`우리동네 3GO`), 현재 동네 GPS 인증 배지(`region.config.ts` 연동), **[가+ 큰글씨]** 토글 버튼을 배치한다.

2. **큰 글씨 모드 & KRDS 접근성**
   - `AppContext` (`useSyncExternalStore` 기반 `localStorage` 영속화)로 `isLargeText`를 전역 관리한다.
   - 활성화 시 `document.documentElement`에 `large-text-mode` 클래스(`font-size: 125%`)를 적용한다.
   - 모든 터치 버튼 최소 높이 `48~52px`, 아이콘 단독 사용 금지(반드시 한글 라벨 병기), `:focus-visible` 2px `#246BEB` 포커스 링을 유지한다.

3. **KRDS 4.5:1+ 고대비 시맨틱 컬러**
   - 기본 Primary (KRDS): `#246BEB` (호버 `#1D56BC`)
   - `1GO (살피GO)`: 버튼·텍스트 `#047857`(5.48:1) / 장식 `#10B981`
   - `2GO (인사하GO)`: 버튼·텍스트 `#C2410C`(5.18:1) / 장식 `#F97316`
   - `3GO (이어지GO)`: `#1E3A8A`(10.35:1)
   - `Background`: `#F8FAFC` (웜 화이트)

4. **SEED Design 참고 공통 컴포넌트 (`src/components/ui/`)**
   - `ActionButton`, `BottomSheet`, `ChipTabs`, `Snackbar`를 KRDS 접근성 기준으로 우선 재사용한다.

5. **하단 내비게이션 & 블라인드 규칙**
   - 5개 탭: `홈`, `살피·인사`, `동네네컷`(중앙 돌출 원형 버튼), `이어지GO`, `마이·행정`.
   - `currentUser.role === 'ASSOCIATE'`(준회원)일 때는 `이어지GO` 탭을 UI에서 완전 비노출(Blind) 처리한다.

6. **플로팅 데모 스위처 (`DemoSwitcher.tsx`)**
   - 우측 상단(헤더 아래)에 반투명 플로팅 버튼(`[🎭 시연 모드]`)을 두고 클릭 시 `BottomSheet`를 연다.
   - 4개 역할(`준회원`, `정회원`, `TF팀장`, `공무원`) 즉시 전환, 3개 센서 시뮬레이션(`가상 GPS 도착`, `보행 잠금 강제`, `악천후 시뮬레이션`), 확장 거점 2종 전환을 원클릭으로 제어한다.
