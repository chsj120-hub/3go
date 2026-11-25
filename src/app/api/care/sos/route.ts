import { desc, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getOptionalDb } from '@/db';
import {
  communitySos,
  users,
  type SosCategory,
  type SosStatus,
  type UserRole,
} from '@/db/schema';
import type { SosBoardItem } from '@/modules/care-blind/types';

const ALLOWED_ROLES: UserRole[] = ['REGULAR', 'TF_LEADER', 'OFFICIAL'];

async function resolveRequestRole(request: Request): Promise<UserRole> {
  const headerRole = request.headers.get('x-3go-role') as UserRole | null;
  if (headerRole && ['ASSOCIATE', 'REGULAR', 'TF_LEADER', 'OFFICIAL'].includes(headerRole)) {
    return headerRole;
  }
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get('3go_demo_role')?.value as UserRole | undefined;
  if (cookieRole && ['ASSOCIATE', 'REGULAR', 'TF_LEADER', 'OFFICIAL'].includes(cookieRole)) {
    return cookieRole;
  }
  return 'ASSOCIATE';
}

function forbiddenAssociateResponse() {
  return NextResponse.json(
    {
      ok: false,
      code: 'FORBIDDEN_ASSOCIATE',
      message:
        '접근 차단(403): 준회원(ASSOCIATE)은 3단계 이어지GO API에 접근할 수 없습니다. 정회원 이상만 이용 가능합니다.',
    },
    { status: 403 },
  );
}

const FALLBACK_SOS_ITEMS: SosBoardItem[] = [
  {
    id: 'sos-cheomdan-01',
    authorId: 'demo-regular',
    authorNickname: '첨단동 맥가이버',
    category: 'CARRY',
    title: '생수 2묶음과 쌀 20kg 현관 안쪽 이동 도와주실 이웃님',
    description:
      '무릎 수술 회복 중이라 현관 앞에 배송된 생수와 쌀을 부엌까지 옮기기 어렵습니다. 5분 정도만 손 빌려주시면 감사하겠습니다.',
    locationHint: '광주 광산구 쌍암동 첨단라인아파트 103동',
    status: 'OPEN',
    createdAt: '2026-11-25T08:20:00.000Z',
    requiresBackgroundCheck: false,
  },
  {
    id: 'sos-cheomdan-escort',
    authorId: 'demo-tf-leader',
    authorNickname: '쌍암호수 원정대장',
    category: 'ESCORT',
    title: '[아동·어르신 동행] 초등 2학년 방과후 첨단도서관 안심 동행',
    description:
      '맞벌이 부모님 야근으로 오후 5시 30분 학교 앞에서 첨단도서관까지 도보 10분 함께 걸어주실 정회원 이웃을 찾습니다.',
    locationHint: '광주 광산구 월계동 정암초 ➔ 첨단도서관',
    status: 'OPEN',
    createdAt: '2026-11-25T09:00:00.000Z',
    requiresBackgroundCheck: true,
  },
  {
    id: 'sos-cheomdan-02',
    authorId: 'demo-tf-leader',
    authorNickname: '쌍암호수 원정대장',
    category: 'REPAIR',
    title: '안방 LED 형광등 깜빡임 교체 도움 요청 (자재 구매 완료)',
    description:
      '자가수리 학교에서 배운 대로 새 LED 모듈을 사두었는데, 사다리 위 작업이 불안해서 아래에서 잡아주실 분 찾습니다.',
    locationHint: '광주 광산구 월계동 첨단부영아파트 인근',
    status: 'MATCHED',
    createdAt: '2026-11-25T07:45:00.000Z',
    requiresBackgroundCheck: false,
  },
  {
    id: 'sos-cheomdan-03',
    authorId: 'demo-regular',
    authorNickname: '첨단동 맥가이버',
    category: 'TOOL',
    title: '[무상 대여] 18V 충전 전동드릴 + 십자비트·콘크리트 기리 세트',
    description:
      '베란다 선반·커튼봉 설치용 전동드릴입니다. 사용 후 배터리 충전해 경비실 앞 무인함에 반납해 주세요.',
    locationHint: '광주 광산구 산월동 호반리젠시빌 공유 공구함',
    status: 'OPEN',
    createdAt: '2026-11-25T06:30:00.000Z',
    requiresBackgroundCheck: false,
  },
  {
    id: 'sos-cheomdan-tool-02',
    authorId: 'demo-tf-leader',
    authorNickname: '쌍암호수 원정대장',
    category: 'TOOL',
    title: '[기증 공구] 방충망 교체 롤러 + 실리콘 건 + 수평계 풀세트',
    description:
      '은퇴 장인 자가수리 학교 잉여 자재 나눔 은행에 기증된 공구입니다. 정회원 누구나 최대 3일 무상 대여 가능합니다.',
    locationHint: '광주 광산구 첨단1동 행정복지센터 1층 공유공방',
    status: 'OPEN',
    createdAt: '2026-11-24T15:00:00.000Z',
    requiresBackgroundCheck: false,
  },
];

/**
 * GET /api/care/sos
 * 서버 측 1차 보안: 준회원(ASSOCIATE) 요청 시 HTTP 403 즉시 차단.
 */
export async function GET(request: Request) {
  const role = await resolveRequestRole(request);
  if (!ALLOWED_ROLES.includes(role)) {
    return forbiddenAssociateResponse();
  }

  const db = getOptionalDb();
  if (!db) {
    return NextResponse.json({
      ok: true,
      mode: 'DEMO_SNAPSHOT',
      items: FALLBACK_SOS_ITEMS,
    });
  }

  try {
    const rows = await db
      .select({
        id: communitySos.id,
        authorId: communitySos.authorId,
        authorNickname: users.nickname,
        category: communitySos.category,
        title: communitySos.title,
        description: communitySos.description,
        locationHint: communitySos.locationHint,
        status: communitySos.status,
        createdAt: communitySos.createdAt,
      })
      .from(communitySos)
      .leftJoin(users, eq(communitySos.authorId, users.id))
      .orderBy(desc(communitySos.createdAt))
      .limit(30);

    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        mode: 'DEMO_SNAPSHOT',
        items: FALLBACK_SOS_ITEMS,
      });
    }

    const mapped: SosBoardItem[] = rows.map((row) => ({
      id: row.id,
      authorId: row.authorId,
      authorNickname: row.authorNickname ?? '인증 정회원',
      category: row.category,
      title: row.title,
      description: row.description,
      locationHint: row.locationHint,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      requiresBackgroundCheck: row.category === 'ESCORT',
    }));

    // 아동 동행 시연 항목이 DB에 아직 없으면 상단에 보강
    const hasEscort = mapped.some((item) => item.category === 'ESCORT');
    const items = hasEscort ? mapped : [FALLBACK_SOS_ITEMS[1], ...mapped];

    return NextResponse.json({
      ok: true,
      mode: 'NEON_DB',
      items,
    });
  } catch (error) {
    console.warn('[GET /api/care/sos] 조회 실패 ➔ 스냅샷 전환:', error);
    return NextResponse.json({
      ok: true,
      mode: 'DEMO_SNAPSHOT',
      items: FALLBACK_SOS_ITEMS,
    });
  }
}

/**
 * POST /api/care/sos
 * 정회원 전용: 신규 생활 품앗이 SOS 요청 또는 공구 기증 등록.
 */
export async function POST(request: Request) {
  const role = await resolveRequestRole(request);
  if (!ALLOWED_ROLES.includes(role)) {
    return forbiddenAssociateResponse();
  }

  try {
    const body = (await request.json()) as {
      authorId?: string;
      authorNickname?: string;
      category?: SosCategory;
      title?: string;
      description?: string;
      locationHint?: string;
    };

    const title = body.title?.trim();
    const description = body.description?.trim();
    const locationHint = body.locationHint?.trim();
    const category: SosCategory = body.category ?? 'CARRY';

    if (!title || !description || !locationHint) {
      return NextResponse.json(
        { ok: false, message: '제목, 상세 내용, 위치 안내를 모두 입력해 주세요.' },
        { status: 400 },
      );
    }

    const id = `sos-${Date.now()}`;
    const authorId = body.authorId?.trim() || 'demo-regular';
    const createdAt = new Date();

    const db = getOptionalDb();
    if (db) {
      await db.insert(communitySos).values({
        id,
        authorId,
        category,
        title,
        description,
        locationHint,
        status: 'OPEN',
      });
    }

    const created: SosBoardItem = {
      id,
      authorId,
      authorNickname: body.authorNickname?.trim() || '인증 정회원',
      category,
      title,
      description,
      locationHint,
      status: 'OPEN',
      createdAt: createdAt.toISOString(),
      requiresBackgroundCheck: category === 'ESCORT',
    };

    return NextResponse.json({
      ok: true,
      mode: db ? 'NEON_DB' : 'DEMO_SNAPSHOT',
      item: created,
      message:
        category === 'TOOL'
          ? '스마트 공구도서관 기증 등록이 완료되었습니다!'
          : '생활 품앗이 SOS 요청이 등록되었습니다!',
    });
  } catch (error) {
    console.error('[POST /api/care/sos] 등록 오류:', error);
    return NextResponse.json(
      { ok: false, message: '등록 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/care/sos
 * 정회원 전용: 품앗이 SOS 매칭 수락 / 공구 대여 신청.
 * 아동·어르신 동행(ESCORT) 매칭 시 backgroundCheckStatus === 'approved'를 서버에서 추가 검증합니다.
 */
export async function PATCH(request: Request) {
  const role = await resolveRequestRole(request);
  if (!ALLOWED_ROLES.includes(role)) {
    return forbiddenAssociateResponse();
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      status?: SosStatus;
      requiresBackgroundCheck?: boolean;
      backgroundCheckStatus?: 'approved' | 'unverified';
    };

    if (!body.id) {
      return NextResponse.json(
        { ok: false, message: '대상 게시글 ID가 필요합니다.' },
        { status: 400 },
      );
    }

    if (
      body.requiresBackgroundCheck &&
      body.backgroundCheckStatus !== 'approved'
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: 'BACKGROUND_CHECK_REQUIRED',
          message:
            '아동 동행·야간 순찰 매칭은 성범죄 경력 조회 승인(approved) 후 가능합니다.',
        },
        { status: 403 },
      );
    }

    const nextStatus: SosStatus = body.status ?? 'MATCHED';
    const db = getOptionalDb();
    if (db) {
      await db
        .update(communitySos)
        .set({ status: nextStatus })
        .where(eq(communitySos.id, body.id));
    }

    return NextResponse.json({
      ok: true,
      mode: db ? 'NEON_DB' : 'DEMO_SNAPSHOT',
      id: body.id,
      status: nextStatus,
      message: '이웃 매칭이 완료되었습니다! 비화폐성 봉사 배지 1점이 적립됩니다.',
    });
  } catch (error) {
    console.error('[PATCH /api/care/sos] 매칭 오류:', error);
    return NextResponse.json(
      { ok: false, message: '매칭 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
