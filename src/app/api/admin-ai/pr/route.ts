import { NextResponse } from 'next/server';
import { generateFourWayPr, type PrGenerateInput } from '@/lib/ai-agent';

/**
 * POST /api/admin-ai/pr
 * 행사 개요 입력 시 Gemini API(미설정/오류 시 공공 표준 템플릿 폴백)로
 * ① 가정통신문 ② 엘리베이터 공고문 ③ 보도자료 ④ 1080×1080 카드뉴스 문구를 동시 반환합니다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PrGenerateInput>;
    const eventName = body.eventName?.trim();
    const eventDate = body.eventDate?.trim();
    const location = body.location?.trim();
    const targetAudience = body.targetAudience?.trim() || '관내 전 세대 주민';
    const details = body.details?.trim();

    if (!eventName || !eventDate || !location || !details) {
      return NextResponse.json(
        {
          ok: false,
          message: '행사명, 일시, 장소, 핵심 내용을 모두 입력해 주세요.',
        },
        { status: 400 },
      );
    }

    const result = await generateFourWayPr({
      eventName,
      eventDate,
      location,
      targetAudience,
      details,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error('[POST /api/admin-ai/pr] 오류:', error);
    return NextResponse.json(
      { ok: false, message: 'AI 홍보문 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
