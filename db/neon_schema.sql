-- =============================================================================
-- 우리동네 3GO × 동네네컷 원정대 — Neon Serverless PostgreSQL 9대 핵심 테이블 DDL
-- 본 SQL은 src/db/schema.ts (Drizzle ORM 스키마)와 1:1로 일치합니다.
-- =============================================================================

-- 1. users: 사용자, 역할(준회원/정회원/TF팀장/공무원), GPS 인증 및 성범죄 경력조회 승인
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  nickname VARCHAR(64) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'ASSOCIATE'
    CHECK (role IN ('ASSOCIATE', 'REGULAR', 'TF_LEADER', 'OFFICIAL')),
  gps_verified_at TIMESTAMPTZ,
  region_code VARCHAR(20) NOT NULL DEFAULT '29200',
  is_criminal_check_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. programs: 1단계(살피GO) 생활밀착 안전·특강 & 2단계(인사하GO) 세대교차 프로그램
CREATE TABLE IF NOT EXISTS programs (
  id VARCHAR(64) PRIMARY KEY,
  stage VARCHAR(10) NOT NULL
    CHECK (stage IN ('1GO', '2GO')),
  title VARCHAR(160) NOT NULL,
  category VARCHAR(40) NOT NULL,
  agency_name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 20,
  current_applicants INTEGER NOT NULL DEFAULT 0,
  event_date TIMESTAMPTZ NOT NULL,
  region_code VARCHAR(20) NOT NULL DEFAULT '29200',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. budget_proposals: 주민 공개 예산 품의 ➔ 에듀파인/e호조 엑셀 자동 변환 대상
CREATE TABLE IF NOT EXISTS budget_proposals (
  id VARCHAR(64) PRIMARY KEY,
  program_id VARCHAR(64) REFERENCES programs(id) ON DELETE SET NULL,
  proposer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  items_json JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  target_system VARCHAR(20) NOT NULL DEFAULT 'EHOJO'
    CHECK (target_system IN ('EDUFINE', 'EHOJO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. community_sos: 3단계(이어지GO) 정회원 전용 생활 품앗이 SOS 및 스마트 공구대여
CREATE TABLE IF NOT EXISTS community_sos (
  id VARCHAR(64) PRIMARY KEY,
  author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL
    CHECK (category IN ('CARRY', 'REPAIR', 'ESCORT', 'TOOL')),
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  location_hint VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'MATCHED', 'DONE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. digital_badges: 비화폐성 디지털 명예 배지 (현금성 보상 대체)
CREATE TABLE IF NOT EXISTS digital_badges (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_code VARCHAR(64) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_digital_badges_user_code UNIQUE (user_id, badge_code)
);

-- 6. photo_spots: 동네네컷 원정대 QR 스팟 및 온디바이스 AI 2인 협동 포즈 미션
CREATE TABLE IF NOT EXISTS photo_spots (
  id VARCHAR(64) PRIMARY KEY,
  course_name VARCHAR(120) NOT NULL,
  spot_order INTEGER NOT NULL,
  spot_name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  qr_code_key VARCHAR(100) NOT NULL UNIQUE,
  pose_mission_type VARCHAR(30) NOT NULL
    CHECK (pose_mission_type IN ('STRETCH', 'BIG_HEART', 'MASCOT_POSE', 'HIGH_FIVE')),
  frame_asset_url VARCHAR(255) NOT NULL,
  region_code VARCHAR(20) NOT NULL DEFAULT '29200'
);

-- 7. local_merchants: 산책 코스 인근 골목 상권 '원정대 보급소' 가맹 상점
CREATE TABLE IF NOT EXISTS local_merchants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(40) NOT NULL,
  address VARCHAR(200) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  coupon_title VARCHAR(120) NOT NULL,
  discount_text VARCHAR(80) NOT NULL,
  barcode_prefix VARCHAR(24) NOT NULL UNIQUE,
  region_code VARCHAR(20) NOT NULL DEFAULT '29200',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. photo_quest_logs: 동네네컷 완주 기록 및 원정대 보급소 할인 바코드 발급
CREATE TABLE IF NOT EXISTS photo_quest_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id VARCHAR(64) REFERENCES local_merchants(id) ON DELETE SET NULL,
  course_name VARCHAR(120) NOT NULL,
  step_count INTEGER NOT NULL DEFAULT 0,
  shared_image_url TEXT,
  coupon_barcode VARCHAR(80) NOT NULL UNIQUE,
  is_coupon_used BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. chat_messages: 개인 연락처 비노출 인앱 안심 톡방 및 AI 회의록 원천 로그
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  room_id VARCHAR(64) NOT NULL,
  room_type VARCHAR(20) NOT NULL
    CHECK (room_type IN ('TF_WORK', 'EVENT_TEMP')),
  sender_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_nickname VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 주요 조회 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_programs_stage_date ON programs (stage, event_date);
CREATE INDEX IF NOT EXISTS idx_budget_proposals_status ON budget_proposals (status);
CREATE INDEX IF NOT EXISTS idx_community_sos_status ON community_sos (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_spots_course_order ON photo_spots (course_name, spot_order);
CREATE INDEX IF NOT EXISTS idx_local_merchants_region ON local_merchants (region_code, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages (room_id, created_at);
