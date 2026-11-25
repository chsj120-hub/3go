'use client';

import { Sparkles, Users, Wrench } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { cn } from '@/lib/utils';
import type { DesignProposalId } from '../design-proposals';

interface MogakjakWebPreviewProps {
  proposal: DesignProposalId;
  onAction: (message: string) => void;
}

/**
 * 모각작(UI Bowl) 레퍼런스 분석을 반영한 웹·홈 대시보드 프리뷰.
 * - 낮은 인지 부하(1클릭 진입), 느슨한 연대 현황, 신규 마스코트 성장 슬롯(추후 교체)
 */
export function MogakjakWebPreview({
  proposal,
  onAction,
}: MogakjakWebPreviewProps) {
  const { activeRegion } = useAppContext();

  const cardSurface =
    proposal === 'A'
      ? 'rounded-xl border border-slate-300 bg-white'
      : proposal === 'B'
        ? 'rounded-[20px] border-2 border-emerald-200 bg-[#FFFDF9] shadow-sm'
        : 'rounded-2xl border border-blue-200 bg-white shadow-sm';

  const mascotBg =
    proposal === 'A'
      ? 'bg-blue-50 border-[#246BEB] text-[#1E3A8A]'
      : proposal === 'B'
        ? 'bg-emerald-50 border-[#047857] text-[#065F46]'
        : 'bg-slate-900 border-slate-700 text-white';

  const ctaTone = proposal === 'A' ? 'krds' : proposal === 'B' ? 'stage1' : 'stage3';

  return (
    <div className={cn('space-y-4 p-4', cardSurface)}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#065F46]">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span>지금 {activeRegion.shortName} 이웃 18명 참여 중</span>
        </span>
        <span className="text-xs font-bold text-[#555555]">모각작 스타일 · 웹/홈</span>
      </div>

      {/* 신규 자체 마스코트 배치 슬롯 + 게이미피케이션 성장 바 */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
        <div
          className={cn(
            'flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center',
            mascotBg,
          )}
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="mt-0.5 text-[10px] font-bold leading-tight">
            신규 마스코트
            <br />
            슬롯
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-bold text-[#1D1D1D]">
            Lv.2 우리동네 안심 탐험대 (배지 2/5)
          </p>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={40}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="마을 안심 탐험대 진행률 40%"
          >
            <div
              className={cn(
                'h-full w-2/5 rounded-full',
                proposal === 'A' ? 'bg-[#246BEB]' : 'bg-[#047857]',
              )}
            />
          </div>
          <p className="text-xs text-[#555555]">
            자가수리 학교 1회만 더 참여하면 정회원 승급!
          </p>
        </div>
      </div>

      {/* 느슨한 연대 — 1클릭 참여 카드 */}
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#047857]">1GO 살피GO · 무료 출장</span>
          <span className="text-xs font-bold text-[#555555]">잔여 4자리</span>
        </div>
        <p className="text-base font-bold text-[#1D1D1D]">
          은퇴 장인의 자가수리 학교 (방충망·LED)
        </p>
        <p className="text-xs text-[#555555]">
          {activeRegion.shortName} 행정복지센터 공유공방 · 토요일 오전 10:30
        </p>
      </div>

      <ActionButton
        tone={ctaTone}
        fullWidth
        leadingIcon={<Wrench className="h-5 w-5" aria-hidden="true" />}
        onClick={() =>
          onAction(`시안 ${proposal} · 1클릭 클래스 예약 흐름을 확인했습니다.`)
        }
      >
        부담 없이 1클릭 참여 신청하기
      </ActionButton>
    </div>
  );
}
