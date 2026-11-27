'use client';

import { Copy, FileText, Printer, X } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import type { ProposalListItem } from '@/app/api/admin-ai/proposals/route';
import type { SafeChatMessageItem } from '@/app/api/safe-chat/messages/route';
import { useAppContext } from '@/modules/onboarding/context/AppContext';

interface MeetingMinutesModalProps {
  open: boolean;
  messages: SafeChatMessageItem[];
  proposals: ProposalListItem[];
  onClose: () => void;
  onNotify: (message: string) => void;
}

/**
 * TF 실무방 대화 로그 + 연계 예산 품의 내역을 공식 공공 회의록 양식으로 요약·렌더링하고
 * 브라우저 PDF 저장/인쇄(window.print + @media print A4)를 지원합니다.
 */
export function MeetingMinutesModal({
  open,
  messages,
  proposals,
  onClose,
  onNotify,
}: MeetingMinutesModalProps) {
  const { activeRegion } = useAppContext();

  if (!open) return null;

  const todayLabel = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date());

  const attendees = Array.from(
    new Set(messages.map((m) => `${m.senderNickname} (${m.maskedPhone})`)),
  );
  const totalBudget = proposals.reduce((sum, p) => sum + p.totalAmount, 0);

  const plainTextSummary = `[${activeRegion.displayName} 우리동네 3GO 공식 TF 회의록]
1. 일시: ${todayLabel}
2. 참석자: ${attendees.join(', ')}
3. 주요 안건: 1GO 자가수리 학교 자재 품의, 2GO 동네 PC방 상생 대관 안전점검, 공구도서관 기증 운영
4. 주요 결정사항:
${messages.map((m, i) => `   (${i + 1}) ${m.senderNickname}: ${m.content}`).join('\n')}
5. 연계 예산 품의 내역 (총 ${totalBudget.toLocaleString()}원):
${proposals.map((p) => `   - [${p.targetSystem}] ${p.title}: ${p.totalAmount.toLocaleString()}원 (${p.status})`).join('\n')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-minutes-title"
      className="fixed inset-0 z-50 mx-auto flex max-w-[430px] items-end justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:items-center print:static print:max-w-none print:bg-white print:p-0"
      onClick={onClose}
    >
      <div
        className="printable-minutes animate-slide-up max-h-[90dvh] w-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl print:max-h-none print:rounded-none print:border-0 print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b-2 border-[#1E3A8A] pb-3 print:border-black">
          <div>
            <p className="text-xs font-bold text-[#246BEB]">
              AI 공식 회의록 자동 변환 (개인번호 비노출)
            </p>
            <h2
              id="meeting-minutes-title"
              className="text-lg font-bold text-[#1D1D1D]"
            >
              {activeRegion.displayName} 3GO TF 회의록
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-[#1D1D1D] print:hidden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>닫기</span>
          </button>
        </div>

        {/* 공식 회의록 양식 본문 */}
        <div className="space-y-3 text-xs leading-relaxed text-[#1D1D1D]">
          <div className="grid grid-cols-1 gap-1.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3">
            <p>
              <strong>1. 회의 일시:</strong> {todayLabel}
            </p>
            <p>
              <strong>2. 관할 거점:</strong> {activeRegion.displayName} (
              {activeRegion.publicApi.districtOfficeName} 리빙랩)
            </p>
            <p>
              <strong>3. 참석자 ({attendees.length}명):</strong>{' '}
              {attendees.join(', ')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="font-bold text-[#1E3A8A]">4. 주요 안건 및 결정사항</p>
            <ul className="mt-1.5 space-y-1.5">
              {messages.map((msg, idx) => (
                <li key={msg.id} className="border-b border-slate-100 pb-1.5 last:border-0">
                  <span className="font-bold">
                    {idx + 1}) {msg.senderNickname}:
                  </span>{' '}
                  <span>{msg.content}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#047857]">5. 연계 예산 품의 내역</p>
              <p className="font-bold text-[#1D1D1D]">
                합계 {totalBudget.toLocaleString()}원
              </p>
            </div>
            <ul className="mt-1.5 space-y-1">
              {proposals.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    · [{p.targetSystem === 'EDUFINE' ? '에듀파인' : 'e호조'}]{' '}
                    {p.title}
                  </span>
                  <span className="shrink-0 font-bold">
                    {p.totalAmount.toLocaleString()}원
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* PDF 인쇄/저장 & 복사 버튼 */}
        <div className="mt-4 space-y-2 print:hidden">
          <ActionButton
            tone="stage3"
            fullWidth
            leadingIcon={<Printer className="h-5 w-5" aria-hidden="true" />}
            onClick={() => {
              onNotify('인쇄 대화상자에서 [PDF로 저장]을 선택해 공식 회의록을 저장하세요.');
              window.print();
            }}
          >
            공식 회의록 PDF 저장 / 인쇄
          </ActionButton>

          <ActionButton
            tone="outline"
            fullWidth
            leadingIcon={<Copy className="h-4 w-4" aria-hidden="true" />}
            onClick={() => {
              void navigator.clipboard?.writeText(plainTextSummary);
              onNotify('공식 회의록 요약 텍스트가 복사되었습니다.');
            }}
          >
            회의록 전문 텍스트 복사
          </ActionButton>
        </div>

        <p className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#555555]">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          <span>우리동네 3GO 인앱 안심 톡방 자동 생성 공식 증빙 문서</span>
        </p>
      </div>
    </div>
  );
}
