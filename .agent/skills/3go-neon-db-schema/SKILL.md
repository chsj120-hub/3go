---
name: 3go-neon-db-schema
description: Neon Serverless PostgreSQL과 Drizzle ORM을 사용해 우리동네 3GO의 9대 핵심 테이블 스키마, 시드 데이터, 서버 액션을 작성할 때 사용합니다.
---

# 우리동네 3GO Neon DB & Drizzle ORM 스킬

## 지침 (Instructions)

1. **Neon 연결 설정 (`src/db/index.ts`)**
   - `@neondatabase/serverless`의 `neon(process.env.DATABASE_URL!)`과 `drizzle-orm/neon-http`를 사용한다.
   - Supabase 관련 패키지나 클라이언트는 절대 사용하지 않는다.
   - 로컬 개발 및 공모전 시연 시 `DATABASE_URL`이 비어 있더라도 앱이 크래시되지 않도록 안전한 연결 헬퍼 및 Fallback 전략을 제공한다.

2. **9대 필수 테이블 (`src/db/schema.ts` ↔ `db/neon_schema.sql` 1:1 일치)**
   - `users`: `id`, `nickname`(가명), `role`(`ASSOCIATE` | `REGULAR` | `TF_LEADER` | `OFFICIAL`), `gpsVerifiedAt`, `regionCode`, `isCriminalCheckApproved`(성범죄 경력 조회 승인 여부), `createdAt`
   - `programs`: `id`, `stage`(`1GO` | `2GO`), `title`, `category`(소방/수리/보건/PC방/바둑 등), `agencyName`, `location`, `maxCapacity`, `eventDate`, `description`, `createdAt`
   - `budget_proposals`: `id`, `programId`, `proposerId`, `title`, `itemsJson`(품목·단가·수량·구매처 링크), `totalAmount`, `status`(`PENDING` | `APPROVED` | `REJECTED`), `targetSystem`(`EDUFINE` | `EHOJO`), `createdAt`
   - `community_sos`: `id`, `authorId`, `category`(`CARRY` | `REPAIR` | `ESCORT` | `TOOL`), `title`, `description`, `status`(`OPEN` | `MATCHED` | `DONE`), `createdAt`
   - `digital_badges`: `id`, `userId`, `badgeCode`, `badgeName`, `awardedAt`
   - `photo_spots`: `id`, `courseName`, `spotOrder`, `spotName`, `lat`, `lng`, `qrCodeKey`, `poseMissionType`(`STRETCH` | `BIG_HEART` | `MASCOT_POSE` | `HIGH_FIVE`), `frameAssetUrl`
   - `local_merchants`: `id`, `name`, `category`, `address`, `lat`, `lng`, `couponTitle`, `discountText`, `barcodePrefix`, `regionCode`, `isActive`, `createdAt` (원정대 보급소 제휴 상점)
   - `photo_quest_logs`: `id`, `userId`, `courseName`, `merchantId`, `stepCount`, `sharedImageUrl`, `couponBarcode`, `isCouponUsed`, `completedAt`
   - `chat_messages`: `id`, `roomId`, `roomType`(`TF_WORK` | `EVENT_TEMP`), `senderId`, `senderNickname`, `content`, `expiresAt`, `createdAt`

3. **멱등성 시딩 전략 (`src/db/seed.ts`)**
   - 여러 번 실행해도 중복 오류가 나지 않도록 `onConflictDoNothing()` 또는 고정 키 기반 업서트로 멱등성(idempotency)을 보장한다.
   - 데모 계정 4종(`ASSOCIATE`, `REGULAR`, `TF_LEADER`, `OFFICIAL`), 1~2단계 대표 프로그램 6종, 동네네컷 3스팟, 원정대 보급소 4곳, 품앗이 SOS 3건, 예산 품의 3건을 기본 시드한다.
   - DB 스키마 변경 시 반드시 `npx drizzle-kit push`로 Neon 브랜치에 반영 가능하도록 Drizzle 문법을 엄격히 지킨다.
