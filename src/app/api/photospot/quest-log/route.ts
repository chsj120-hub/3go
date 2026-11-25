import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getOptionalDb } from '@/db';
import { localMerchants, photoQuestLogs } from '@/db/schema';

interface QuestLogPostPayload {
  userId?: string;
  merchantId?: string;
  courseName?: string;
  stepCount?: number;
  couponBarcode?: string;
  shareConsent?: boolean;
}

interface QuestLogPatchPayload {
  id?: string;
  couponBarcode?: string;
  isCouponUsed?: boolean;
}

export interface CouponWalletItem {
  id: string;
  courseName: string;
  merchantName: string;
  discountText: string;
  couponBarcode: string;
  isCouponUsed: boolean;
  isSharedToGallery: boolean;
  completedAt: string;
}

const FALLBACK_COUPONS: CouponWalletItem[] = [
  {
    id: 'quest-cheomdan-01',
    courseName: '광주 광산 첨단 쌍암·응암·영산강 안심 산책 코스',
    merchantName: '쌍암 호수로스터스',
    discountText: '전 음료 1,000원 즉시 할인',
    couponBarcode: '3GO-CHD01-20261125-0001',
    isCouponUsed: false,
    isSharedToGallery: false,
    completedAt: '2026-11-25T09:30:00.000Z',
  },
];

/**
 * GET /api/photospot/quest-log
 * 내 쿠폰함 목록을 Neon DB `photo_quest_logs` (+ `local_merchants`)에서 조회합니다.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId')?.trim() || 'demo-regular';

  const db = getOptionalDb();
  if (!db) {
    return NextResponse.json({
      ok: true,
      mode: 'DEMO_SNAPSHOT',
      coupons: FALLBACK_COUPONS,
    });
  }

  try {
    const rows = await db
      .select({
        id: photoQuestLogs.id,
        courseName: photoQuestLogs.courseName,
        couponBarcode: photoQuestLogs.couponBarcode,
        isCouponUsed: photoQuestLogs.isCouponUsed,
        sharedImageUrl: photoQuestLogs.sharedImageUrl,
        completedAt: photoQuestLogs.completedAt,
        merchantName: localMerchants.name,
        discountText: localMerchants.discountText,
      })
      .from(photoQuestLogs)
      .leftJoin(localMerchants, eq(photoQuestLogs.merchantId, localMerchants.id))
      .where(eq(photoQuestLogs.userId, userId))
      .orderBy(desc(photoQuestLogs.completedAt))
      .limit(20);

    const coupons: CouponWalletItem[] = rows.map((row) => ({
      id: row.id,
      courseName: row.courseName,
      merchantName: row.merchantName ?? '원정대 보급소 제휴 상점',
      discountText: row.discountText ?? '동네네컷 완주자 상생 할인',
      couponBarcode: row.couponBarcode,
      isCouponUsed: row.isCouponUsed,
      isSharedToGallery: Boolean(row.sharedImageUrl),
      completedAt: row.completedAt.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      mode: 'NEON_DB',
      coupons: coupons.length > 0 ? coupons : FALLBACK_COUPONS,
    });
  } catch (error) {
    console.warn('[GET /api/photospot/quest-log] 조회 실패 ➔ 스냅샷 전환:', error);
    return NextResponse.json({
      ok: true,
      mode: 'DEMO_SNAPSHOT',
      coupons: FALLBACK_COUPONS,
    });
  }
}

/**
 * POST /api/photospot/quest-log
 * 완주 기록과 발급된 보급소 쿠폰 바코드를 `photo_quest_logs`에 저장합니다.
 * `shareConsent === true`일 때만 동네 자랑하기 공유 상태를 기록합니다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuestLogPostPayload;

    const userId = body.userId?.trim() || 'demo-regular';
    const courseName = body.courseName?.trim() || '광주 광산 첨단 안심 산책 코스';
    const couponBarcode =
      body.couponBarcode?.trim() || `3GO-CHD01-${Date.now()}`;
    const stepCount = Number.isFinite(body.stepCount)
      ? Math.max(0, Math.round(body.stepCount ?? 0))
      : 3850;
    const sharedImageUrl = body.shareConsent ? 'SHARED_TO_VILLAGE_GALLERY' : null;
    const id = `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const db = getOptionalDb();
    if (!db) {
      return NextResponse.json({
        ok: true,
        persisted: false,
        mode: 'DEMO_SNAPSHOT',
        id,
        couponBarcode,
        isSharedToGallery: Boolean(sharedImageUrl),
        message: body.shareConsent
          ? '완주 쿠폰 발급 및 동네 자랑하기 공유 기록이 저장되었습니다! (시연 모드)'
          : '완주 기록과 원정대 보급소 쿠폰이 내 쿠폰함에 저장되었습니다! (시연 모드)',
      });
    }

    await db
      .insert(photoQuestLogs)
      .values({
        id,
        userId,
        merchantId: body.merchantId ?? null,
        courseName,
        stepCount,
        sharedImageUrl,
        couponBarcode,
        isCouponUsed: false,
      })
      .onConflictDoNothing();

    return NextResponse.json({
      ok: true,
      persisted: true,
      mode: 'NEON_DB',
      id,
      couponBarcode,
      isSharedToGallery: Boolean(sharedImageUrl),
      message: body.shareConsent
        ? 'Neon DB 완주 기록 + 보급소 쿠폰 발급 + 동네 자랑하기가 완료되었습니다!'
        : 'Neon DB 완주 기록과 원정대 보급소 쿠폰이 내 쿠폰함에 저장되었습니다!',
    });
  } catch (error) {
    console.error('[POST /api/photospot/quest-log] 저장 오류:', error);
    return NextResponse.json(
      { ok: false, message: '완주 기록 저장 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/photospot/quest-log
 * 내 쿠폰함에서 바코드 제시 후 [사용 완료 처리] 상태를 Neon DB에 반영합니다.
 */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as QuestLogPatchPayload;
    const targetId = body.id?.trim();
    const targetBarcode = body.couponBarcode?.trim();
    const isCouponUsed = body.isCouponUsed ?? true;

    if (!targetId && !targetBarcode) {
      return NextResponse.json(
        { ok: false, message: '쿠폰 식별자가 누락되었습니다.' },
        { status: 400 },
      );
    }

    const db = getOptionalDb();
    if (!db) {
      return NextResponse.json({
        ok: true,
        persisted: false,
        mode: 'DEMO_SNAPSHOT',
        isCouponUsed,
        message: '보급소 쿠폰이 [사용 완료] 처리되었습니다. (시연 모드)',
      });
    }

    if (targetId) {
      await db
        .update(photoQuestLogs)
        .set({ isCouponUsed })
        .where(eq(photoQuestLogs.id, targetId));
    } else if (targetBarcode) {
      await db
        .update(photoQuestLogs)
        .set({ isCouponUsed })
        .where(eq(photoQuestLogs.couponBarcode, targetBarcode));
    }

    return NextResponse.json({
      ok: true,
      persisted: true,
      mode: 'NEON_DB',
      isCouponUsed,
      message: '원정대 보급소 쿠폰이 Neon DB에 [사용 완료] 처리되었습니다!',
    });
  } catch (error) {
    console.error('[PATCH /api/photospot/quest-log] 갱신 오류:', error);
    return NextResponse.json(
      { ok: false, message: '쿠폰 사용 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
