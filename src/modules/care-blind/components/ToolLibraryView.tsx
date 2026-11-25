'use client';

import { useState } from 'react';
import { CheckCircle2, MapPin, PlusCircle, Wrench } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import type { SosBoardItem } from '../types';

interface ToolLibraryViewProps {
  tools: SosBoardItem[];
  matchingId: string | null;
  onBorrowTool: (item: SosBoardItem) => void;
  onDonateTool: (payload: {
    title: string;
    description: string;
    locationHint: string;
  }) => Promise<void>;
}

/**
 * 3단계 이어지GO 탭 2: [스마트 공구도서관 (대여·기증)].
 * 유휴 전동드릴·방충망 롤러 등 공구를 정회원 간 무상 대여·기증합니다.
 */
export function ToolLibraryView({
  tools,
  matchingId,
  onBorrowTool,
  onDonateTool,
}: ToolLibraryViewProps) {
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationHint.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      await onDonateTool({
        title: `[기증 공구] ${title.trim()}`,
        locationHint,
        description,
      });
      setTitle('');
      setLocationHint('');
      setDescription('');
      setShowDonateForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-[#1E3A8A]">
              스마트 공구도서관 (무상 대여 · 기증)
            </p>
            <p className="text-xs text-[#555555]">
              공구를 기증하면 정회원 승급 및 디지털 명예 배지가 지급됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDonateForm((v) => !v)}
            className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-xl bg-[#1E3A8A] px-3 text-xs font-bold text-white"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>{showDonateForm ? '닫기' : '공구 기증'}</span>
          </button>
        </div>
      </div>

      {showDonateForm && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-2.5 rounded-2xl border-2 border-[#1E3A8A] bg-white p-4"
        >
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="기증할 공구명 (예: 레이저 수평계, 임팩트 드라이버)"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
          />
          <input
            type="text"
            required
            value={locationHint}
            onChange={(e) => setLocationHint(e.target.value)}
            placeholder="보관·전달 장소 (예: 첨단1동 공유공방)"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
          />
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="구성품 및 사용 시 주의사항을 입력해 주세요"
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm text-[#1D1D1D]"
          />
          <ActionButton
            type="submit"
            tone="stage3"
            fullWidth
            loading={isSubmitting}
          >
            공구 기증 등록하기
          </ActionButton>
        </form>
      )}

      <div className="space-y-3">
        {tools.map((tool) => {
          const isBorrowed = tool.status !== 'OPEN';
          return (
            <article
              key={tool.id}
              className="space-y-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="navy">
                  <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>무상 공구 대여</span>
                </Badge>
                <span
                  className={
                    isBorrowed
                      ? 'rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-[#555555]'
                      : 'rounded-full bg-[#047857] px-2.5 py-0.5 text-xs font-bold text-white'
                  }
                >
                  {isBorrowed ? '대여 중' : '대여 가능'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1D1D1D]">
                  {tool.title}
                </h3>
                <p className="mt-1 text-sm text-[#555555]">{tool.description}</p>
              </div>

              <p className="flex items-center gap-1.5 text-xs font-bold text-[#555555]">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{tool.locationHint}</span>
              </p>

              <ActionButton
                tone={isBorrowed ? 'outline' : 'stage1'}
                fullWidth
                disabled={isBorrowed}
                loading={matchingId === tool.id}
                leadingIcon={
                  isBorrowed ? (
                    <CheckCircle2 className="h-5 w-5 text-[#047857]" aria-hidden="true" />
                  ) : (
                    <Wrench className="h-5 w-5" aria-hidden="true" />
                  )
                }
                onClick={() => onBorrowTool(tool)}
              >
                {isBorrowed ? '대여 예약 완료' : '무상 공구 대여 신청하기'}
              </ActionButton>
            </article>
          );
        })}
      </div>
    </div>
  );
}
