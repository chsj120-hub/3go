'use client';

import { useState } from 'react';
import { Calendar, CheckCircle2, MapPin, PlusCircle, Sparkles, Users } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { ChipTabs } from '@/components/ui/chip-tabs';
import type { CommunityClassItem } from '../types';

interface Stage2CalendarViewProps {
  calendarItems: CommunityClassItem[];
  appliedIds: Record<string, boolean>;
  applyingId: string | null;
  onApply: (item: CommunityClassItem) => void;
  onOpenMeetupModal: () => void;
}

const MONTH_FILTERS = [
  { value: 'ALL', label: '전체 캘린더' },
  { value: '3월', label: '3월 바둑' },
  { value: '4월', label: '4월 마니또·씨앗' },
  { value: '5월', label: '5월 PC방' },
  { value: '6월', label: '6월 한솥밥' },
  { value: '7~8월', label: '7~8월 체육' },
  { value: '9~10월', label: '9~10월 축제' },
  { value: '분기·방학', label: '팝업 리페어' },
  { value: '11월', label: '11월 헌액식' },
];

/**
 * 2GO 인사하GO 놀이 탭 뷰.
 * - 3~11월 세대 교차 멘토링 캘린더 + 씨앗·모종 도서관 + 팝업 폐가전 리페어 카페
 * - 주민 누구나 7대 크루 예시 템플릿으로 새 모임을 개설할 수 있는 버튼 제공
 */
export function Stage2CalendarView({
  calendarItems,
  appliedIds,
  applyingId,
  onApply,
  onOpenMeetupModal,
}: Stage2CalendarViewProps) {
  const [monthFilter, setMonthFilter] = useState('ALL');

  const visibleItems = calendarItems.filter(
    (item) => monthFilter === 'ALL' || item.monthTag === monthFilter,
  );

  return (
    <div className="space-y-4">
      {/* 세대 교차 운영 원칙 & 새 모임 개설 CTA 카드 */}
      <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/70 p-4">
        <Badge variant="orange">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span>가명 닉네임 · 4~8주 시즌제 · 텃세 차단</span>
        </Badge>
        <p className="mt-2 text-sm font-bold text-[#1D1D1D]">
          직함과 나이를 내려놓고 초등학생·청년·어르신이 함께 어울리는 3~11월
          골목 교류 캘린더입니다.
        </p>
        <div className="mt-3">
          <ActionButton
            tone="stage2"
            fullWidth
            leadingIcon={<PlusCircle className="h-5 w-5" aria-hidden="true" />}
            onClick={onOpenMeetupModal}
          >
            예시 템플릿으로 [새 모임 · 크루 개설하기]
          </ActionButton>
        </div>
      </div>

      {/* 월별 가로 스크롤 SEED ChipTabs */}
      <ChipTabs
        ariaLabel="월별 세대 교차 캘린더 필터"
        tone="stage2"
        value={monthFilter}
        onChange={setMonthFilter}
        items={MONTH_FILTERS}
      />

      {/* 월별 캘린더 카드뷰 */}
      <div className="space-y-3">
        {visibleItems.map((item) => {
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
                  {item.monthTag && (
                    <span className="rounded-lg bg-[#C2410C] px-2.5 py-0.5 text-xs font-bold text-white">
                      {item.monthTag}
                    </span>
                  )}
                  <Badge variant="orange">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    <span>{item.category}</span>
                  </Badge>
                </div>

                <span className="text-xs font-bold text-[#555555]">
                  {item.currentApplicants} / {item.maxCapacity}명
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold leading-snug text-[#1D1D1D]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs font-bold text-[#C2410C]">
                  협력 거점: {item.agencyName}
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
                aria-label={`${item.title} 참가율 ${ratio}%`}
              >
                <div
                  className="h-full rounded-full bg-[#C2410C] transition-all"
                  style={{ width: `${ratio}%` }}
                />
              </div>

              <ActionButton
                tone={isApplied ? 'outline' : 'stage2'}
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
                  ? '참가 신청 완료 (DB 반영됨)'
                  : isFull
                    ? '정원 마감'
                    : '세대 버디 참가 신청하기'}
              </ActionButton>
            </article>
          );
        })}
      </div>
    </div>
  );
}
