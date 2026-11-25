# Antigravity 에이전트 스킬 구성 가이드

본 프로젝트의 `.agent/skills/` 디렉터리에 4대 도메인 전문 스킬이 배치되어 있습니다. 각 영역의 기능을 구현·수정할 때 에이전트가 해당 스킬의 규격을 자동으로 로드합니다.

| 순번 | 스킬 이름 | 배치 경로 | 핵심 담당 영역 |
| :---: | :--- | :--- | :--- |
| 1 | `3go-ui-design-system` | `.agent/skills/3go-ui-design-system/SKILL.md` | 9:16 모바일 PWA 레이아웃, 큰 글씨 모드(1.25배), 시맨틱 컬러, 하단 5대 탭 블라인드 규칙, 플로팅 데모 스위처 |
| 2 | `3go-neon-db-schema` | `.agent/skills/3go-neon-db-schema/SKILL.md` | Neon Serverless PostgreSQL + Drizzle ORM 연결, 9대 핵심 테이블 스키마, 멱등성 시드 전략 |
| 3 | `3go-photospot-ai` | `.agent/skills/3go-photospot-ai/SKILL.md` | 보행 안전 잠금(Safety Lock), QR 스팟 인증, 온디바이스 MediaPipe 2인 협동 포즈 판정, HTML5 Canvas 네컷·쿠폰 합성 |
| 4 | `3go-admin-automation` | `.agent/skills/3go-admin-automation/SKILL.md` | AI 4-Way 홍보문 생성, 에듀파인/e호조 `.xlsx` 엑셀 변환, 인앱 톡방 AI 회의록 PDF 출력, 공공데이터 6대 API 어댑터 |
