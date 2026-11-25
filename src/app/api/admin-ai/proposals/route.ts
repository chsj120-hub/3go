import { desc, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getOptionalDb } from '@/db';
import {
  budgetProposals,
  type BudgetItem,
  type BudgetProposalStatus,
  type TargetAccountingSystem,
  type UserRole,
} from '@/db/schema';

export interface ProposalListItem {
  id: string;
  programId: string | null;
  proposerId: string;
  title: string;
  itemsJson: BudgetItem[];
  totalAmount: number;
  status: BudgetProposalStatus;
  targetSystem: TargetAccountingSystem;
  createdAt: string;
}

const FALLBACK_PROPOSALS: ProposalListItem[] = [
  {
    id: 'prop-cheomdan-01',
    programId: 'prog-1go-diy-repair',
    proposerId: 'demo-tf-leader',
    title: '[1GO] 은퇴 장인 자가수리 학교 실습 자재 구입 품의',
    itemsJson: [
      {
        itemName: '미세 방충망 롤(알루미늄)',
        spec: '90cm × 30m',
        quantity: 4,
        unitPrice: 45000,
        amount: 180000,
        basis: '실습 16가구 × 1.5m + 여분',
        purchaseUrl: 'https://www.g2b.go.kr',
        note: '잉여 자재 나눔 은행 귀속',
      },
      {
        itemName: '고효율 LED 방등 교체 키트',
        spec: '50W KS인증 모듈',
        quantity: 10,
        unitPrice: 22000,
        amount: 220000,
        basis: '취약계층 실습 시범 교체 10가구',
        purchaseUrl: 'https://www.g2b.go.kr',
      },
      {
        itemName: '방충망 고무 가스켓 및 롤러 세트',
        spec: '실습 공용 8세트',
        quantity: 8,
        unitPrice: 10000,
        amount: 80000,
        basis: '2인 1조 실습 공구 비치',
        purchaseUrl: 'https://www.g2b.go.kr',
      },
    ],
    totalAmount: 480000,
    status: 'APPROVED',
    targetSystem: 'EHOJO',
    createdAt: '2026-11-24T10:00:00.000Z',
  },
  {
    id: 'prop-cheomdan-02',
    programId: 'prog-2go-esports-pcbang',
    proposerId: 'demo-tf-leader',
    title: '[2GO] 동네 PC방 비수기 상생 대관 세대통합 E-스포츠 품의',
    itemsJson: [
      {
        itemName: '동네 PC방 비수기 오전 상생 대관료',
        spec: '20좌석 × 3시간 (평일 09:00~12:00)',
        quantity: 1,
        unitPrice: 250000,
        amount: 250000,
        basis: '광산구 첨단 제휴 PC방 상생 협약 단가',
        purchaseUrl: 'https://www.gwangsan.go.kr',
        note: '신규 렌탈 배제·골목 상권 직접 환원',
      },
      {
        itemName: '세대통합 참가자 보급소 간식 바우처',
        spec: '원정대 보급소 제휴 떡볶이·음료',
        quantity: 20,
        unitPrice: 5000,
        amount: 100000,
        basis: '참가자 20명 × 5,000원',
        purchaseUrl: 'https://www.gwangsan.go.kr',
      },
    ],
    totalAmount: 350000,
    status: 'PENDING',
    targetSystem: 'EHOJO',
    createdAt: '2026-11-25T08:00:00.000Z',
  },
  {
    id: 'prop-cheomdan-03',
    programId: 'prog-2go-baduk-board',
    proposerId: 'demo-tf-leader',
    title: '[2GO] 초등·시니어 고스트 바둑왕전 교구 및 명찰 구입 품의',
    itemsJson: [
      {
        itemName: '접이식 자석 바둑판 및 전략 보드게임 세트',
        spec: '세대교차 공용 키트 6종',
        quantity: 4,
        unitPrice: 40000,
        amount: 160000,
        basis: '첨단도서관 상시 비치용',
        purchaseUrl: 'https://www.s2b.kr',
        note: '에듀파인 학교·마을교육 연계 비품',
      },
      {
        itemName: '명예 배지 스티커 및 닉네임 명찰 제작',
        spec: '친환경 종이 명찰 40매',
        quantity: 40,
        unitPrice: 1500,
        amount: 60000,
        basis: '계급장 없는 가명 닉네임 교류 원칙',
        purchaseUrl: 'https://www.s2b.kr',
      },
    ],
    totalAmount: 220000,
    status: 'PENDING',
    targetSystem: 'EDUFINE',
    createdAt: '2026-11-25T09:10:00.000Z',
  },
];

async function resolveRole(request: Request): Promise<UserRole> {
  const headerRole = request.headers.get('x-3go-role') as UserRole | null;
  if (headerRole && ['ASSOCIATE', 'REGULAR', 'TF_LEADER', 'OFFICIAL'].includes(headerRole)) {
    return headerRole;
  }
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get('3go_demo_role')?.value as UserRole | undefined;
  return cookieRole ?? 'REGULAR';
}

/** GET /api/admin-ai/proposals — 주민에게 투명 공개되는 예산 품의 목록 조회 */
export async function GET() {
  const db = getOptionalDb();
  if (!db) {
    return NextResponse.json({
      ok: true,
      mode: 'DEMO_SNAPSHOT',
      proposals: FALLBACK_PROPOSALS,
    });
  }

  try {
    const rows = await db
      .select()
      .from(budgetProposals)
      .orderBy(desc(budgetProposals.createdAt))
      .limit(20);

    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        mode: 'DEMO_SNAPSHOT',
        proposals: FALLBACK_PROPOSALS,
      });
    }

    return NextResponse.json({
      ok: true,
      mode: 'NEON_DB',
      proposals: rows.map((row) => ({
        id: row.id,
        programId: row.programId,
        proposerId: row.proposerId,
        title: row.title,
        itemsJson: row.itemsJson,
        totalAmount: row.totalAmount,
        status: row.status,
        targetSystem: row.targetSystem,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.warn('[GET /api/admin-ai/proposals] 조회 실패 ➔ 스냅샷 전환:', error);
    return NextResponse.json({
      ok: true,
      mode: 'DEMO_SNAPSHOT',
      proposals: FALLBACK_PROPOSALS,
    });
  }
}

/** POST /api/admin-ai/proposals — TF팀장·공무원 예산 품의 등록 (자동 합계 계산) */
export async function POST(request: Request) {
  const role = await resolveRole(request);
  if (role !== 'TF_LEADER' && role !== 'OFFICIAL') {
    return NextResponse.json(
      { ok: false, message: 'TF팀장 또는 공무원만 예산 품의를 등록할 수 있습니다.' },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      proposerId?: string;
      targetSystem?: TargetAccountingSystem;
      items?: Array<{
        itemName: string;
        spec: string;
        quantity: number;
        unitPrice: number;
        basis?: string;
        purchaseUrl?: string;
        note?: string;
      }>;
    };

    const title = body.title?.trim();
    const rawItems = body.items ?? [];
    if (!title || rawItems.length === 0) {
      return NextResponse.json(
        { ok: false, message: '품의 제목과 최소 1개 이상의 품목을 입력해 주세요.' },
        { status: 400 },
      );
    }

    const itemsJson: BudgetItem[] = rawItems.map((item) => {
      const quantity = Math.max(1, Math.round(Number(item.quantity) || 1));
      const unitPrice = Math.max(0, Math.round(Number(item.unitPrice) || 0));
      return {
        itemName: item.itemName.trim(),
        spec: item.spec.trim() || '표준 규격',
        quantity,
        unitPrice,
        amount: quantity * unitPrice,
        basis: item.basis?.trim() || `${quantity}개 × ${unitPrice.toLocaleString()}원`,
        purchaseUrl: item.purchaseUrl?.trim() || 'https://www.g2b.go.kr',
        note: item.note?.trim(),
      };
    });

    const totalAmount = itemsJson.reduce((sum, cur) => sum + cur.amount, 0);
    const id = `prop-${Date.now()}`;
    const proposerId = body.proposerId?.trim() || 'demo-tf-leader';
    const targetSystem: TargetAccountingSystem =
      body.targetSystem === 'EDUFINE' ? 'EDUFINE' : 'EHOJO';

    const db = getOptionalDb();
    if (db) {
      await db.insert(budgetProposals).values({
        id,
        programId: null,
        proposerId,
        title,
        itemsJson,
        totalAmount,
        status: 'PENDING',
        targetSystem,
      });
    }

    const created: ProposalListItem = {
      id,
      programId: null,
      proposerId,
      title,
      itemsJson,
      totalAmount,
      status: 'PENDING',
      targetSystem,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      ok: true,
      mode: db ? 'NEON_DB' : 'DEMO_SNAPSHOT',
      proposal: created,
      message: `예산 품의서(총 ${totalAmount.toLocaleString()}원)가 등록되었습니다!`,
    });
  } catch (error) {
    console.error('[POST /api/admin-ai/proposals] 등록 오류:', error);
    return NextResponse.json(
      { ok: false, message: '품의 등록 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/** PATCH /api/admin-ai/proposals — 공무원(OFFICIAL) 전용 승인 처리 */
export async function PATCH(request: Request) {
  const role = await resolveRole(request);
  if (role !== 'OFFICIAL') {
    return NextResponse.json(
      { ok: false, message: '공무원(OFFICIAL) 역할에서만 예산 품의를 승인할 수 있습니다.' },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      status?: BudgetProposalStatus;
    };
    if (!body.id) {
      return NextResponse.json(
        { ok: false, message: '승인할 품의 ID가 누락되었습니다.' },
        { status: 400 },
      );
    }

    const nextStatus: BudgetProposalStatus = body.status ?? 'APPROVED';
    const db = getOptionalDb();
    if (db) {
      await db
        .update(budgetProposals)
        .set({ status: nextStatus })
        .where(eq(budgetProposals.id, body.id));
    }

    return NextResponse.json({
      ok: true,
      mode: db ? 'NEON_DB' : 'DEMO_SNAPSHOT',
      id: body.id,
      status: nextStatus,
      message: '공무원 승인이 완료되었습니다! 이제 e호조/에듀파인 엑셀을 다운로드할 수 있습니다.',
    });
  } catch (error) {
    console.error('[PATCH /api/admin-ai/proposals] 승인 오류:', error);
    return NextResponse.json(
      { ok: false, message: '승인 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
