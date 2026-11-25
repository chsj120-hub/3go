'use client';

import {
  Calendar,
  CheckCircle2,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import type { CommunityClassItem } from '../types';

interface Stage1ClassesViewProps {
  classes: CommunityClassItem[];
  appliedIds: Record<string, boolean>;
  applyingId: string | null;
  onApply: (item: CommunityClassItem) => void;
  onOpenProposalModal: () => void;
}

/**
 * 1GO 살피GO 배움 탭 뷰.
 * - 공공기관 출장 8대 고정 클래스(강사료 0원 배지) 목록 + Neon DB 신청 인원 증가
 * - 주민 누구나 제안할 수 있는 [클래스 개설·강사 지원] 버튼
 */
export function Stage1ClassesView({
  classes,
  appliedIds,
  applyingId,
  onApply,
  onOpenProposalModal,
}: Stage1ClassesViewProps) {
  return (
    <div className="space-y-4">
      {/* 주민 재능기부 개설 CTA 카드 */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="default">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>공공기관 출장 8대 고정 · 강사료 0원</span>
          </Badge>
        </div>
        <p className="mt-2 text-sm font-bold text-[#1D1D1D]">
          소방서·보건소·노인일자리·도서관·대학 봉사단이 우리 동네로 무료
          출장합니다.
        </p>
        <div className="mt-3">
          <ActionButton
            tone="stage1"
            fullWidth
            leadingIcon={<PlusCircle className="h-5 w-5" aria-hidden="true" />}
            onClick={onOpenProposalModal}
          >
            주민 누구나 [클래스 개설 · 강사 지원]
          </ActionButton>
        </div>
      </div>

      {/* 8대 고정 클래스 (+ 주민 신규 제안 클래스) 목록 */}
      <div className="space-y-3">
        {classes.map((item) => {
          const isApplied = Boolean(appliedIds[item.id]);
          const isFull = item.currentApplicants >= item.maxCapacity;
          const ratio = Math.min(
            100,
            Math.round((item.currentApplicants / item.maxCapacity) * 100),
          );

          return (
            <article
              key={item.id}
              className="space-y-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="default">
                    <span>{item.category}</span>
                  </Badge>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#047857] px-2.5 py-0.5 text-xs font-bold text-white">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    <span>강사료 0원</span>
                  </span>
                  {item.isResidentProposed && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A]">
                      주민 개설
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold text-[#555555]">
                  {item.currentApplicants} / {item.maxCapacity}명
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold leading-snug text-[#1D1D1D]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs font-bold text-[#047857]">
                  출장·연계: {item.agencyName}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#555555]">
                  {item.description}
                </p>
              </div>

              <div className="space-y-1 text-xs text-[#555555]">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{item.eventDateLabel}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.location}</span>
                </p>
              </div>

              <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={ratio}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.title} 신청률 ${ratio}%`}
              >
                <div
                  className="h-full rounded-full bg-[#047857] transition-all"
                  style={{ width: `${ratio}%` }}
                />
              </div>

              <ActionButton
                tone={isApplied ? 'outline' : 'stage1'}
                fullWidth
                disabled={isApplied || isFull}
                loading={applyingId === item.id}
                leadingIcon={
                  isApplied ? (
                    <CheckCircle2 className="h-5 w-5 text-[#047857]" aria-hidden="true" />
                  ) : undefined
                }
                onClick={() => onApply(item)}
              >
                {isApplied
                  ? '참여 신청 완료 (DB 반영됨)'
                  : isFull
                    ? '정원 마감'
                    : '무료 클래스 신청하기'}
              </ActionButton>
            </article>
          );
        })}
      </div>
    </div>
  );
}
