import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { REGION_CONFIG } from '@/config/region.config';
import { getOptionalDb } from '@/db';
import { programs, type ProgramStage } from '@/db/schema';

interface ApplyPayload {
  programId?: string;
}

interface CreateClassPayload {
  stage?: ProgramStage;
  title?: string;
  category?: string;
  proposerNickname?: string;
  location?: string;
  description?: string;
  maxCapacity?: number;
  safetyAgreed?: boolean;
  liabilityWaiverAgreed?: boolean;
}

/**
 * PATCH /api/community/programs
 * 클래스 참가 신청 시 Neon DB `programs.current_applicants`를 1 증가시킵니다.
 */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as ApplyPayload;
    const programId = body.programId?.trim();

    if (!programId) {
      return NextResponse.json(
        { ok: false, message: '신청할 프로그램 ID가 누락되었습니다.' },
        { status: 400 },
      );
    }

    const db = getOptionalDb();
    if (!db) {
      return NextResponse.json({
        ok: true,
        mode: 'DEMO_SNAPSHOT',
        programId,
        message: '참가 신청이 완료되었습니다! (시연 스냅샷 모드)',
      });
    }

    const updated = await db
      .update(programs)
      .set({
        currentApplicants: sql`LEAST(${programs.maxCapacity}, ${programs.currentApplicants} + 1)`,
      })
      .where(eq(programs.id, programId))
      .returning({
        id: programs.id,
        currentApplicants: programs.currentApplicants,
        maxCapacity: programs.maxCapacity,
      });

    if (updated.length === 0) {
      return NextResponse.json({
        ok: true,
        mode: 'DEMO_SNAPSHOT',
        programId,
        message: '참가 신청이 완료되었습니다! (고정 커리큘럼 신청 반영)',
      });
    }

    return NextResponse.json({
      ok: true,
      mode: 'NEON_DB',
      programId: updated[0].id,
      currentApplicants: updated[0].currentApplicants,
      maxCapacity: updated[0].maxCapacity,
      message: `참가 신청이 Neon DB에 반영되었습니다! (${updated[0].currentApplicants}/${updated[0].maxCapacity}명)`,
    });
  } catch (error) {
    console.error('[PATCH /api/community/programs] 신청 오류:', error);
    return NextResponse.json(
      { ok: false, message: '신청 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/community/programs
 * 주민 누구나 제안하는 [클래스 개설·강사 지원]을 처리합니다.
 * 시설 안전 수칙 및 배상책임 면책 체크 동의를 서버에서 필수 검증합니다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateClassPayload;

    if (!body.safetyAgreed || !body.liabilityWaiverAgreed) {
      return NextResponse.json(
        {
          ok: false,
          message:
            '시설 안전 수칙 준수 및 배상책임 면책 동의 체크가 모두 필요합니다.',
        },
        { status: 400 },
      );
    }

    const title = body.title?.trim();
    const location = body.location?.trim();
    const description = body.description?.trim();
    if (!title || !location || !description) {
      return NextResponse.json(
        { ok: false, message: '클래스명, 희망 장소, 상세 소개를 모두 입력해 주세요.' },
        { status: 400 },
      );
    }

    const id = `prog-resident-${Date.now()}`;
    const stage: ProgramStage = body.stage === '2GO' ? '2GO' : '1GO';
    const category = body.category?.trim() || '주민재능기부';
    const agencyName = `주민 재능기부 (${body.proposerNickname?.trim() || '이웃 강사'})`;
    const maxCapacity = Math.min(50, Math.max(4, Number(body.maxCapacity) || 12));
    const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const db = getOptionalDb();
    if (db) {
      await db.insert(programs).values({
        id,
        stage,
        title,
        category,
        agencyName,
        location,
        description,
        maxCapacity,
        currentApplicants: 1,
        eventDate,
        regionCode: REGION_CONFIG.regionCode,
      });
    }

    return NextResponse.json({
      ok: true,
      mode: db ? 'NEON_DB' : 'DEMO_SNAPSHOT',
      created: {
        id,
        stage,
        title,
        category,
        agencyName,
        location,
        description,
        maxCapacity,
        currentApplicants: 1,
        eventDateLabel: '일정 협의 (개설 제안 등록)',
        isZeroFee: true,
        isResidentProposed: true,
      },
      message: db
        ? '주민 제안 클래스가 Neon DB에 개설되었습니다!'
        : '주민 제안 클래스가 등록되었습니다! (시연 스냅샷 모드)',
    });
  } catch (error) {
    console.error('[POST /api/community/programs] 개설 오류:', error);
    return NextResponse.json(
      { ok: false, message: '클래스 개설 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
