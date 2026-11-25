'use client';

import { useEffect, useState } from 'react';
import {
  Archive,
  FileText,
  Lock,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { ChipTabs } from '@/components/ui/chip-tabs';
import type { ProposalListItem } from '@/app/api/admin-ai/proposals/route';
import type { SafeChatMessageItem } from '@/app/api/safe-chat/messages/route';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { isAdminOrLeader } from '@/modules/onboarding/demo-users';
import { MeetingMinutesModal } from './MeetingMinutesModal';
import { cn } from '@/lib/utils';

type ChatRoomKey = 'TF_WORK' | 'EVENT_TEMP';

const ROOM_CONFIG = {
  TF_WORK: {
    roomId: 'room-tf-cheomdan-2026',
    title: 'TF 실무방 (단임 실행팀)',
    subtitle: '예산 품의·공식 회의록 PDF 자동 연동',
  },
  EVENT_TEMP: {
    roomId: 'room-event-cheomdan-2026',
    title: '시한부 행사방 (D-7 자동 종료)',
    subtitle: '050 안심번호 마스킹 · 행사 종료 시 아카이빙',
  },
} as const;

interface SafeChatHubProps {
  proposals: ProposalListItem[];
  onNotify: (message: string) => void;
}

/**
 * 인앱 안심 톡방 2종 (TF 실무방 / 시한부 행사방).
 * - 5초 실시간 폴링으로 메시지 동기화
 * - 참여자 연락처 050-XXXX-XXXX 마스킹 표시
 * - 팀장·공무원 전용 [톡방 종료 및 아카이빙] 잠금 버튼
 * - TF 실무방 상단 [AI 공식 회의록 PDF 변환] 버튼
 */
export function SafeChatHub({ proposals, onNotify }: SafeChatHubProps) {
  const { currentUser } = useAppContext();
  const canManageRoom = isAdminOrLeader(currentUser.role);

  const [roomKey, setRoomKey] = useState<ChatRoomKey>('TF_WORK');
  const [messages, setMessages] = useState<SafeChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [archivedRooms, setArchivedRooms] = useState<Record<string, boolean>>(
    {},
  );
  const [minutesOpen, setMinutesOpen] = useState(false);

  const activeRoom = ROOM_CONFIG[roomKey];
  const isArchived = Boolean(archivedRooms[activeRoom.roomId]);

  // 방 전환 시 즉시 로드 + 5초 실시간 폴링
  useEffect(() => {
    let active = true;

    const loadRoomMessages = async () => {
      try {
        const res = await fetch(
          `/api/safe-chat/messages?roomId=${encodeURIComponent(activeRoom.roomId)}`,
        );
        const json = (await res.json()) as {
          ok?: boolean;
          messages?: SafeChatMessageItem[];
        };
        if (active && json.ok && Array.isArray(json.messages)) {
          setMessages(json.messages);
        }
      } catch {
        // 폴링 일시 오류 무시
      }
    };

    void loadRoomMessages();
    const timer = setInterval(() => {
      void loadRoomMessages();
    }, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [activeRoom.roomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isArchived || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/safe-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: activeRoom.roomId,
          roomType: roomKey,
          senderId: currentUser.id,
          senderNickname: currentUser.nickname,
          content: inputText.trim(),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        messageItem?: SafeChatMessageItem;
      };
      if (json.ok && json.messageItem) {
        setMessages((prev) => [...prev, json.messageItem!]);
        setInputText('');
      }
    } catch {
      onNotify('메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleArchiveRoom = () => {
    if (!canManageRoom) return;
    setArchivedRooms((prev) => ({ ...prev, [activeRoom.roomId]: true }));
    onNotify(
      `'${activeRoom.title}'이 종료 및 아카이빙(읽기 전용 잠금) 처리되었습니다.`,
    );
  };

  return (
    <section className="space-y-3.5 rounded-3xl border-2 border-slate-300 bg-white p-4 shadow-sm">
      <div>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A]">
          <MessageSquare className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
          <span>개인 카톡·전화번호 비노출 · 인앱 안심 톡방</span>
        </span>
        <h2 className="mt-1 text-lg font-bold text-[#1D1D1D]">
          {activeRoom.title}
        </h2>
        <p className="text-xs text-[#555555]">{activeRoom.subtitle}</p>
      </div>

      {/* 2종 톡방 전환 ChipTabs */}
      <ChipTabs<ChatRoomKey>
        ariaLabel="인앱 안심 톡방 선택"
        tone="stage3"
        value={roomKey}
        onChange={setRoomKey}
        items={[
          { value: 'TF_WORK', label: 'TF 실무방' },
          { value: 'EVENT_TEMP', label: '시한부 행사방 (050)' },
        ]}
      />

      {/* 방 유형별 상단 액션 버튼 */}
      {roomKey === 'TF_WORK' ? (
        <ActionButton
          tone="stage3"
          fullWidth
          leadingIcon={<FileText className="h-5 w-5" aria-hidden="true" />}
          onClick={() => setMinutesOpen(true)}
        >
          AI 공식 회의록 PDF 변환 (예산 품의 포함)
        </ActionButton>
      ) : (
        <div className="space-y-2 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs">
          <p className="inline-flex items-center gap-1 font-bold text-amber-950">
            <ShieldCheck className="h-4 w-4 text-[#C2410C]" aria-hidden="true" />
            <span>참여자 연락처 050-XXXX-XXXX 안심번호 자동 마스킹 적용 중</span>
          </p>
          <ActionButton
            tone={isArchived ? 'outline' : 'stage2'}
            fullWidth
            disabled={!canManageRoom || isArchived}
            leadingIcon={
              isArchived ? (
                <Lock className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Archive className="h-4 w-4" aria-hidden="true" />
              )
            }
            onClick={handleArchiveRoom}
          >
            {isArchived
              ? '톡방 종료 및 아카이빙 잠금 완료'
              : canManageRoom
                ? '톡방 종료 및 아카이빙 (팀장·공무원 전용)'
                : '팀장·공무원 역할에서만 종료 가능'}
          </ActionButton>
        </div>
      )}

      {/* 채팅 메시지 목록 */}
      <div className="max-h-72 space-y-2.5 overflow-y-auto rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col gap-1',
                isMe ? 'items-end' : 'items-start',
              )}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#555555]">
                <span>{msg.senderNickname}</span>
                {roomKey === 'EVENT_TEMP' && (
                  <span className="inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#1E3A8A] border border-slate-200">
                    <Phone className="h-2.5 w-2.5" aria-hidden="true" />
                    <span>{msg.maskedPhone}</span>
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  isMe
                    ? 'bg-[#246BEB] text-white'
                    : 'border border-slate-200 bg-white text-[#1D1D1D]',
                )}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* 메시지 입력 폼 */}
      <form onSubmit={(e) => void handleSend(e)} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          disabled={isArchived}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isArchived
              ? '아카이빙 완료된 톡방입니다 (읽기 전용)'
              : '안심 톡방에 메시지를 입력하세요...'
          }
          className="min-h-12 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm text-[#1D1D1D] disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={isArchived || isSending || !inputText.trim()}
          className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-xl bg-[#246BEB] px-4 text-sm font-bold text-white hover:bg-[#1D56BC] disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          <span>전송</span>
        </button>
      </form>

      <MeetingMinutesModal
        open={minutesOpen}
        messages={messages}
        proposals={proposals}
        onClose={() => setMinutesOpen(false)}
        onNotify={onNotify}
      />
    </section>
  );
}
