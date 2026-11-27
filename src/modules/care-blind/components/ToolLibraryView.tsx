'use client';

import { useState } from 'react';
import { CheckCircle2, MapPin, PlusCircle, Sparkles, Wrench } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import type { SosBoardItem } from '../types';

const TOOL_TEMPLATES = [
  {
    label: '🔩 18V 충전 전동드릴',
    title: '18V 충전 전동드릴 + 십자·콘크리트 비트 풀세트',
    locationHint: '광주 광산구 첨단1동 행정복지센터 1층 공유 공구함',
    description:
      '선반·커튼봉 설치에 유용한 충전 드릴입니다. 사용 후 배터리를 충전해 데스크에 반납해 주세요. (최대 3일 무상 대여)',
  },
  {
    label: '🪟 방충망 롤러·실리콘 건',
    title: '방충망 교체 롤러 + 실리콘 건 + 수평계 세트',
    locationHint: '광주 광산구 첨단종합사회복지관 공구 데스크',
    description:
      '자가수리 학교 실습용으로 기증된 공구 세트입니다. 남은 방충망 가스켓과 함께 무상 대여 가능합니다.',
  },
  {
    label: '♻️ 리페어 카페 부품 은행',
    title: '[부품 은행] 선풍기 모터·전원 코드·나사 50종 모음',
    locationHint: '광주 광산구 첨단1동 공유공방 부품 보관함',
    description:
      '팝업 폐가전 분해·수리 교실에서 적출한 정상 부품입니다. 소형 가전 수리가 필요한 정회원 이웃 누구나 무상 수령 가능합니다.',
  },
];

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
 * 3단계 이어지GO 탭 2: [스마트 공구·부품 은행 (대여·기증)].
 * - 3단계 절차 가이드 + 원클릭 기증 예시 템플릿 3종 제공
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
        title: title.trim().startsWith('[')
          ? title.trim()
          : `[기증 공구] ${title.trim()}`,
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
              스마트 공구·부품 은행 (무상 대여 · 기증)
            </p>
            <p className="text-xs text-[#555555]">
              공구·정상 부품을 기증하면 정회원 승급 및 디지털 명예 배지가
              지급됩니다.
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
          className="space-y-3 rounded-2xl border-2 border-[#1E3A8A] bg-white p-4"
        >
          <ol className="grid grid-cols-3 gap-1 rounded-xl bg-blue-50 p-2 text-center text-[11px] font-bold text-[#1E3A8A]">
            <li className="rounded-lg bg-white py-1">① 예시 선택</li>
            <li className="rounded-lg bg-white py-1">② 보관장소 확인</li>
            <li className="rounded-lg bg-white py-1">③ 기증 등록</li>
          </ol>

          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-1 text-xs font-bold text-[#246BEB]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>예시를 누르면 공구 기증 양식이 바로 채워져요</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TOOL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => {
                    setTitle(tpl.title);
                    setLocationHint(tpl.locationHint);
                    setDescription(tpl.description);
                  }}
                  className="min-h-10 rounded-full border border-blue-300 bg-blue-50/70 px-3 py-1 text-xs font-bold text-[#1E3A8A] hover:bg-blue-100"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="기증할 공구·부품명 (예: 레이저 수평계, 임팩트 드라이버)"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
          />
          <input
            type="text"
            required
            value={locationHint}
            onChange={(e) => setLocationHint(e.target.value)}
            placeholder="보관·전달 장소 (예: 첨단1동 행정복지센터 데스크)"
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
            공구·부품 기증 등록하기
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
