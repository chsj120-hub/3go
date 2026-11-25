'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CloudRainWind,
  Database,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { ChipTabs } from '@/components/ui/chip-tabs';
import { useAppContext } from '../context/AppContext';
import type { HomeProgramItem } from '../lib/home-data';
import { cn } from '@/lib/utils';

type StageFilter = 'ALL' | '1GO' | '2GO';

interface RecommendedProgramsSectionProps {
  programs: HomeProgramItem[];
  dataSource: 'NEON_DB' | 'DEMO_SNAPSHOT';
  onNotify: (message: string) => void;
}

function formatKoreanDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '일정 추후 공지';
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * 이달의 추천 1GO(살피GO) / 2GO(인사하GO) 클래스 섹션.
 * - Neon PostgreSQL `programs` 테이블 조회 결과 렌더링 (+ 시연 스냅샷 자동 Fallback)
 * - 악천후 시뮬레이션 활성화 시 실내 클래스에 자동 전환 추천 배지 강조
 */
export function RecommendedProgramsSection({
  programs,
  dataSource,
  onNotify,
}: RecommendedProgramsSectionProps) {
  const { simulators } = useAppContext();
  const [filter, setFilter] = useState<StageFilter>('ALL');
  const [reservedIds, setReservedIds] = useState<Record<string, boolean>>({});

  const filtered = programs.filter(
    (item) => filter === 'ALL' || item.stage === filter,
  );

  // 악천후 시 실내 프로그램을 상단으로 우선 정렬
  const ordered = simulators.badWeatherAlert
    ? [...filtered].sort((a, b) => Number(b.isIndoor) - Number(a.isIndoor))
    : filtered;

  const handleToggleReserve = (program: HomeProgramItem) => {
    const next = !reservedIds[program.id];
    setReservedIds((prev) => ({ ...prev, [program.id]: next }));
    onNotify(
      next
        ? `'${program.title}' 참여 예약이 완료되었습니다.`
        : `'${program.title}' 참여 예약을 취소했습니다.`,
    );
  };

  return (
    <section aria-labelledby="recommended-programs-heading" className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#555555]">
              <Database className="h-3 w-3 text-[#246BEB]" aria-hidden="true" />
              <span>
                {dataSource === 'NEON_DB' ? 'Neon DB 실시간' : '시연 스냅샷 모드'}
              </span>
            </span>
          </div>
          <h2
            id="recommended-programs-heading"
            className="mt-1 text-lg font-bold text-[#1D1D1D]"
          >
            이달의 추천 1GO · 2GO 클래스
          </h2>
        </div>

        <Link
          href="/community"
          className="inline-flex min-h-12 items-center gap-1 rounded-xl px-2 text-sm font-bold text-[#246BEB] hover:bg-blue-50"
        >
          <span>전체 보기</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* SEED + KRDS ChipTabs 필터 */}
      <ChipTabs<StageFilter>
        ariaLabel="클래스 단계 필터"
        tone="krds"
        value={filter}
        onChange={setFilter}
        items={[
          { value: 'ALL', label: '전체', badgeText: String(programs.length) },
          {
            value: '1GO',
            label: '1GO 살피GO',
            badgeText: String(programs.filter((p) => p.stage === '1GO').length),
          },
          {
            value: '2GO',
            label: '2GO 인사하GO',
            badgeText: String(programs.filter((p) => p.stage === '2GO').length),
          },
        ]}
      />

      <div className="space-y-3">
        {ordered.slice(0, 4).map((program) => {
          const isReserved = Boolean(reservedIds[program.id]);
          const applicants = program.currentApplicants + (isReserved ? 1 : 0);
          const ratio = Math.min(
            100,
            Math.round((applicants / program.maxCapacity) * 100),
          );
          const is1Go = program.stage === '1GO';

          return (
            <article
              key={program.id}
              className={cn(
                'space-y-3 rounded-2xl border bg-white p-4 shadow-sm',
                simulators.badWeatherAlert && program.isIndoor
                  ? 'border-[#246BEB] ring-1 ring-blue-100'
                  : 'border-slate-300',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={is1Go ? 'default' : 'orange'}>
                    {is1Go ? (
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {program.stage} · {program.category}
                    </span>
                  </Badge>

                  {simulators.badWeatherAlert && program.isIndoor && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A]">
                      <CloudRainWind className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
                      <span>악천후 실내 추천</span>
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold text-[#555555]">
                  {applicants} / {program.maxCapacity}명
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold leading-snug text-[#1D1D1D]">
                  {program.title}
                </h3>
                <p className="mt-1 text-xs font-bold text-[#246BEB]">
                  연계 기관: {program.agencyName}
                </p>
              </div>

              <div className="space-y-1 text-xs text-[#555555]">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-[#555555]" aria-hidden="true" />
                  <span>{formatKoreanDate(program.eventDateIso)}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#555555]" aria-hidden="true" />
                  <span className="truncate">{program.location}</span>
                </p>
              </div>

              {/* 신청 현황 진행 바 */}
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={ratio}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${program.title} 신청률 ${ratio}%`}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    is1Go ? 'bg-[#047857]' : 'bg-[#C2410C]',
                  )}
                  style={{ width: `${ratio}%` }}
                />
              </div>

              <ActionButton
                tone={isReserved ? 'outline' : is1Go ? 'stage1' : 'stage2'}
                fullWidth
                leadingIcon={
                  isReserved ? (
                    <CheckCircle2 className="h-5 w-5 text-[#047857]" aria-hidden="true" />
                  ) : undefined
                }
                onClick={() => handleToggleReserve(program)}
              >
                {isReserved ? '예약 완료 (누르면 취소)' : '무료 참여 예약하기'}
              </ActionButton>
            </article>
          );
        })}
      </div>
    </section>
  );
}
