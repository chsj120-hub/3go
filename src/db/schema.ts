import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

/** 사용자 역할 등급 (준회원 / 정회원 / 단임 TF팀장 / 공무원 멘토) */
export type UserRole = 'ASSOCIATE' | 'REGULAR' | 'TF_LEADER' | 'OFFICIAL';

/** 프로그램 단계 (1GO 살피GO / 2GO 인사하GO) */
export type ProgramStage = '1GO' | '2GO';

/** 예산 품의 상태 */
export type BudgetProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** 공공 회계 연동 대상 시스템 (에듀파인 / e호조) */
export type TargetAccountingSystem = 'EDUFINE' | 'EHOJO';

/** 3단계 이어지GO 생활 품앗이 카테고리 */
export type SosCategory = 'CARRY' | 'REPAIR' | 'ESCORT' | 'TOOL';

/** 품앗이 SOS 진행 상태 */
export type SosStatus = 'OPEN' | 'MATCHED' | 'DONE';

/** 동네네컷 온디바이스 AI 2인 협동 포즈 미션 타입 */
export type PoseMissionType =
  | 'STRETCH'
  | 'BIG_HEART'
  | 'MASCOT_POSE'
  | 'HIGH_FIVE';

/** 인앱 안심 톡방 유형 (TF 실무방 / 시한부 행사방) */
export type ChatRoomType = 'TF_WORK' | 'EVENT_TEMP';

/** 예산 품의 상세 품목 JSON 구조 (에듀파인/e호조 엑셀 변환 표준 컬럼) */
export interface BudgetItem {
  itemName: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  basis: string;
  purchaseUrl: string;
  note?: string;
}

/**
 * 1. users: 사용자, 역할, 생활권 GPS 인증 및 성범죄 경력조회 승인 정보
 * (db/neon_schema.sql 의 users 테이블과 1:1 일치)
 */
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique(),
  nickname: varchar('nickname', { length: 64 }).notNull(),
  role: varchar('role', { length: 20 })
    .$type<UserRole>()
    .notNull()
    .default('ASSOCIATE'),
  gpsVerifiedAt: timestamp('gps_verified_at', { withTimezone: true }),
  regionCode: varchar('region_code', { length: 20 }).notNull().default('29200'),
  isCriminalCheckApproved: boolean('is_criminal_check_approved')
    .notNull()
    .default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * 2. programs: 1단계(살피GO) & 2단계(인사하GO) 대표 마을 프로그램
 */
export const programs = pgTable(
  'programs',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    stage: varchar('stage', { length: 10 }).$type<ProgramStage>().notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    category: varchar('category', { length: 40 }).notNull(),
    agencyName: varchar('agency_name', { length: 100 }).notNull(),
    location: varchar('location', { length: 200 }).notNull(),
    description: text('description').notNull(),
    maxCapacity: integer('max_capacity').notNull().default(20),
    currentApplicants: integer('current_applicants').notNull().default(0),
    eventDate: timestamp('event_date', { withTimezone: true }).notNull(),
    regionCode: varchar('region_code', { length: 20 })
      .notNull()
      .default('29200'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_programs_stage_date').on(table.stage, table.eventDate),
  ],
);

/**
 * 3. budget_proposals: 공개 예산 품의 폼 (에듀파인/e호조 엑셀 변환 원천)
 */
export const budgetProposals = pgTable(
  'budget_proposals',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    programId: varchar('program_id', { length: 64 }).references(
      () => programs.id,
      { onDelete: 'set null' },
    ),
    proposerId: varchar('proposer_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    itemsJson: jsonb('items_json').$type<BudgetItem[]>().notNull(),
    totalAmount: integer('total_amount').notNull(),
    status: varchar('status', { length: 20 })
      .$type<BudgetProposalStatus>()
      .notNull()
      .default('PENDING'),
    targetSystem: varchar('target_system', { length: 20 })
      .$type<TargetAccountingSystem>()
      .notNull()
      .default('EHOJO'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_budget_proposals_status').on(table.status)],
);

/**
 * 4. community_sos: 3단계(이어지GO) 정회원 전용 생활 품앗이 SOS 및 공구 대여
 */
export const communitySos = pgTable(
  'community_sos',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    authorId: varchar('author_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category: varchar('category', { length: 20 }).$type<SosCategory>().notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    description: text('description').notNull(),
    locationHint: varchar('location_hint', { length: 120 }).notNull(),
    status: varchar('status', { length: 20 })
      .$type<SosStatus>()
      .notNull()
      .default('OPEN'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_community_sos_status').on(table.status, table.createdAt),
  ],
);

/**
 * 5. digital_badges: 비화폐성 디지털 명예 배지
 */
export const digitalBadges = pgTable(
  'digital_badges',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    badgeCode: varchar('badge_code', { length: 64 }).notNull(),
    badgeName: varchar('badge_name', { length: 100 }).notNull(),
    awardedAt: timestamp('awarded_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_digital_badges_user_code').on(
      table.userId,
      table.badgeCode,
    ),
  ],
);

/**
 * 6. photo_spots: 동네네컷 원정대 QR 스팟 및 온디바이스 AI 포즈 미션
 */
export const photoSpots = pgTable(
  'photo_spots',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    courseName: varchar('course_name', { length: 120 }).notNull(),
    spotOrder: integer('spot_order').notNull(),
    spotName: varchar('spot_name', { length: 120 }).notNull(),
    description: text('description').notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    qrCodeKey: varchar('qr_code_key', { length: 100 }).notNull().unique(),
    poseMissionType: varchar('pose_mission_type', { length: 30 })
      .$type<PoseMissionType>()
      .notNull(),
    frameAssetUrl: varchar('frame_asset_url', { length: 255 }).notNull(),
    regionCode: varchar('region_code', { length: 20 })
      .notNull()
      .default('29200'),
  },
  (table) => [
    index('idx_photo_spots_course_order').on(
      table.courseName,
      table.spotOrder,
    ),
  ],
);

/**
 * 7. local_merchants: 산책 코스 인근 골목 상권 '원정대 보급소' 가맹 상점
 */
export const localMerchants = pgTable(
  'local_merchants',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    category: varchar('category', { length: 40 }).notNull(),
    address: varchar('address', { length: 200 }).notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    couponTitle: varchar('coupon_title', { length: 120 }).notNull(),
    discountText: varchar('discount_text', { length: 80 }).notNull(),
    barcodePrefix: varchar('barcode_prefix', { length: 24 }).notNull().unique(),
    regionCode: varchar('region_code', { length: 20 })
      .notNull()
      .default('29200'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_local_merchants_region').on(table.regionCode, table.isActive),
  ],
);

/**
 * 8. photo_quest_logs: 동네네컷 원정대 완주 기록 및 보급소 할인 바코드 발급
 */
export const photoQuestLogs = pgTable('photo_quest_logs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  merchantId: varchar('merchant_id', { length: 64 }).references(
    () => localMerchants.id,
    { onDelete: 'set null' },
  ),
  courseName: varchar('course_name', { length: 120 }).notNull(),
  stepCount: integer('step_count').notNull().default(0),
  sharedImageUrl: text('shared_image_url'),
  couponBarcode: varchar('coupon_barcode', { length: 80 }).notNull().unique(),
  isCouponUsed: boolean('is_coupon_used').notNull().default(false),
  completedAt: timestamp('completed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * 9. chat_messages: 인앱 안심 톡방 및 AI 회의록 PDF 생성 원천 로그
 */
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    roomId: varchar('room_id', { length: 64 }).notNull(),
    roomType: varchar('room_type', { length: 20 })
      .$type<ChatRoomType>()
      .notNull(),
    senderId: varchar('sender_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    senderNickname: varchar('sender_nickname', { length: 64 }).notNull(),
    content: text('content').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_chat_messages_room_created').on(table.roomId, table.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
export type BudgetProposal = typeof budgetProposals.$inferSelect;
export type NewBudgetProposal = typeof budgetProposals.$inferInsert;
export type CommunitySosItem = typeof communitySos.$inferSelect;
export type NewCommunitySosItem = typeof communitySos.$inferInsert;
export type DigitalBadge = typeof digitalBadges.$inferSelect;
export type PhotoSpot = typeof photoSpots.$inferSelect;
export type LocalMerchant = typeof localMerchants.$inferSelect;
export type PhotoQuestLog = typeof photoQuestLogs.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
