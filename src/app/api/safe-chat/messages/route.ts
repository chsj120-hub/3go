import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getOptionalDb } from '@/db';
import { chatMessages, type ChatRoomType } from '@/db/schema';

export interface SafeChatMessageItem {
  id: string;
  roomId: string;
  roomType: ChatRoomType;
  senderId: string;
  senderNickname: string;
  maskedPhone: string;
  content: string;
  createdAt: string;
}

const FALLBACK_MESSAGES: Record<string, SafeChatMessageItem[]> = {
  'room-tf-cheomdan-2026': [
    {
      id: 'chat-tf-01',
      roomId: 'room-tf-cheomdan-2026',
      roomType: 'TF_WORK',
      senderId: 'demo-tf-leader',
      senderNickname: '쌍암호수 원정대장',
      maskedPhone: '050-4821-1029',
      content:
        '12월 첨단1동 자가수리 학교 자재 품의서 e호조 양식으로 올렸습니다. 방충망과 LED 모듈은 시범 교체 후 남은 자재를 나눔 은행에 보관하기로 했습니다.',
      createdAt: '2026-11-25T09:10:00.000Z',
    },
    {
      id: 'chat-tf-02',
      roomId: 'room-tf-cheomdan-2026',
      roomType: 'TF_WORK',
      senderId: 'demo-official',
      senderNickname: '광산 마을지원관',
      maskedPhone: '050-4821-7701',
      content:
        '품의 항목 단가와 G2B 산출기초 확인 완료했습니다! 오늘 중으로 e호조 승인 처리하고, 다음 주 첨단 PC방 상생 대관 안전점검표도 같이 챙기겠습니다.',
      createdAt: '2026-11-25T09:14:00.000Z',
    },
    {
      id: 'chat-tf-03',
      roomId: 'room-tf-cheomdan-2026',
      roomType: 'TF_WORK',
      senderId: 'demo-regular',
      senderNickname: '첨단동 맥가이버',
      maskedPhone: '050-4821-3345',
      content:
        '공구도서관 전동드릴 2대 기증 접수되었습니다. 토요일 자가수리 클래스 보조 강사로 참여하겠습니다!',
      createdAt: '2026-11-25T09:20:00.000Z',
    },
  ],
  'room-event-cheomdan-2026': [
    {
      id: 'chat-ev-01',
      roomId: 'room-event-cheomdan-2026',
      roomType: 'EVENT_TEMP',
      senderId: 'demo-tf-leader',
      senderNickname: '쌍암호수 원정대장',
      maskedPhone: '050-9012-4410',
      content:
        '토요일 오전 10시 30분 첨단1동 공유공방에서 자가수리 학교가 열립니다! 개인 전화번호 대신 050 안심번호로만 안내되며, 행사 종료 후 이 방은 자동 아카이빙됩니다.',
      createdAt: '2026-11-25T10:00:00.000Z',
    },
    {
      id: 'chat-ev-02',
      roomId: 'room-event-cheomdan-2026',
      roomType: 'EVENT_TEMP',
      senderId: 'demo-regular',
      senderNickname: '첨단동 맥가이버',
      maskedPhone: '050-9012-8821',
      content:
        '방충망 틀 1개 들고 방문 예정입니다. 개인 카톡 방 없이 앱 안에서 바로 안내받으니 훨씬 안전하고 깔끔하네요!',
      createdAt: '2026-11-25T10:05:00.000Z',
    },
  ],
};

function makeMaskedPhone(senderId: string): string {
  let hash = 0;
  for (let i = 0; i < senderId.length; i += 1) {
    hash = (hash * 31 + senderId.charCodeAt(i)) % 9000;
  }
  const mid = String(1000 + (hash % 8999));
  const tail = String(1000 + ((hash * 7) % 8999));
  return `050-${mid}-${tail}`;
}

/** GET /api/safe-chat/messages?roomId=... */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId')?.trim() || 'room-tf-cheomdan-2026';
  const fallback = FALLBACK_MESSAGES[roomId] ?? FALLBACK_MESSAGES['room-tf-cheomdan-2026'];

  const db = getOptionalDb();
  if (!db) {
    return NextResponse.json({
      ok: true,
      mode: 'DEMO_SNAPSHOT',
      messages: fallback,
    });
  }

  try {
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(50);

    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        mode: 'DEMO_SNAPSHOT',
        messages: fallback,
      });
    }

    return NextResponse.json({
      ok: true,
      mode: 'NEON_DB',
      messages: rows.map((row) => ({
        id: row.id,
        roomId: row.roomId,
        roomType: row.roomType,
        senderId: row.senderId,
        senderNickname: row.senderNickname,
        maskedPhone: makeMaskedPhone(row.senderId),
        content: row.content,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.warn('[GET /api/safe-chat/messages] 조회 실패 ➔ 스냅샷 전환:', error);
    return NextResponse.json({
      ok: true,
      mode: 'DEMO_SNAPSHOT',
      messages: fallback,
    });
  }
}

/** POST /api/safe-chat/messages — 인앱 안심 톡방 메시지 전송 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      roomId?: string;
      roomType?: ChatRoomType;
      senderId?: string;
      senderNickname?: string;
      content?: string;
    };

    const roomId = body.roomId?.trim() || 'room-tf-cheomdan-2026';
    const roomType: ChatRoomType =
      body.roomType === 'EVENT_TEMP' ? 'EVENT_TEMP' : 'TF_WORK';
    const senderId = body.senderId?.trim() || 'demo-regular';
    const senderNickname = body.senderNickname?.trim() || '이웃 참여자';
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json(
        { ok: false, message: '메시지 내용을 입력해 주세요.' },
        { status: 400 },
      );
    }

    const id = `chat-${Date.now()}`;
    const createdAt = new Date();
    const expiresAt =
      roomType === 'EVENT_TEMP'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null;

    const db = getOptionalDb();
    if (db) {
      await db.insert(chatMessages).values({
        id,
        roomId,
        roomType,
        senderId,
        senderNickname,
        content,
        expiresAt,
      });
    }

    const item: SafeChatMessageItem = {
      id,
      roomId,
      roomType,
      senderId,
      senderNickname,
      maskedPhone: makeMaskedPhone(senderId),
      content,
      createdAt: createdAt.toISOString(),
    };

    return NextResponse.json({
      ok: true,
      mode: db ? 'NEON_DB' : 'DEMO_SNAPSHOT',
      messageItem: item,
    });
  } catch (error) {
    console.error('[POST /api/safe-chat/messages] 전송 오류:', error);
    return NextResponse.json(
      { ok: false, message: '메시지 전송 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
