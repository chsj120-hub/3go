'use client';

import { useState } from 'react';
import { Database, ShieldCheck, Users } from 'lucide-react';
import { Snackbar } from '@/components/ui/snackbar';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import type { CommunityClassItem, CommunityPageData } from '../types';
import { ClassProposalModal } from './ClassProposalModal';
import { Stage1ClassesView } from './Stage1ClassesView';
import { Stage2CalendarView } from './Stage2CalendarView';
import { Stage2MeetupModal } from './Stage2MeetupModal';
import { cn } from '@/lib/utils';

type CommunityStageTab = '1GO' | '2GO';

interface CommunityHubProps {
  initialData: CommunityPageData;
}

/**
 * `/community` 살피·인사 메인 허브.
 * - 상단 세그먼트 탭: [1GO 살피GO 배움](에메랄드 #047857) / [2GO 인사하GO 놀이](오렌지 #C2410C)
 * - 신청 시 PATCH /api/community/programs로 Neon DB 신청 인원 증가
 * - 주민 [클래스 개설·강사 지원] 모달 연동
 */
export function CommunityHub({ initialData }: CommunityHubProps) {
  const { activeRegion } = useAppContext();
  const [activeTab, setActiveTab] = useState<CommunityStageTab>('1GO');
  const [stage1List, setStage1List] = useState<CommunityClassItem[]>(
    initialData.stage1Classes,
  );
  const [stage2List, setStage2List] = useState<CommunityClassItem[]>(
    initialData.stage2Calendar,
  );
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeetupModalOpen, setIsMeetupModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleApply = async (item: CommunityClassItem) => {
    if (appliedIds[item.id] || applyingId) return;
    setApplyingId(item.id);
    try {
      const response = await fetch('/api/community/programs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: item.id }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        currentApplicants?: number;
        message?: string;
      };

      if (json.ok) {
        setAppliedIds((prev) => ({ ...prev, [item.id]: true }));
        const updateList = (list: CommunityClassItem[]) =>
          list.map((row) =>
            row.id === item.id
              ? {
                  ...row,
                  currentApplicants:
                    json.currentApplicants ??
                    Math.min(row.maxCapacity, row.currentApplicants + 1),
                }
              : row,
          );
        if (item.stage === '1GO') {
          setStage1List(updateList);
        } else {
          setStage2List(updateList);
        }
        setToast(json.message ?? `'${item.title}' 참가 신청이 완료되었습니다!`);
      } else {
        setToast(json.message ?? '신청 중 오류가 발생했습니다.');
      }
    } catch {
      setToast('네트워크 연결을 확인해 주세요.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#555555]">
          <Database className="h-3 w-3 text-[#246BEB]" aria-hidden="true" />
          <span>
            {initialData.dataSource === 'NEON_DB'
              ? 'programs Neon DB 실시간'
              : 'programs 시연 스냅샷'}
          </span>
        </span>
        <h1 className="mt-1.5 text-2xl font-bold text-[#1D1D1D]">
          {activeRegion.shortName} 살피·인사
        </h1>
        <p className="mt-1 text-sm text-[#555555]">
          공공기관 0원 출장 배움(1GO)과 3~11월 세대 교차 놀이(2GO)에 참여하세요.
        </p>
      </div>

      {/* 상단 세그먼트 탭: [1GO 살피GO 배움] (에메랄드) / [2GO 인사하GO 놀이] (오렌지) */}
      <div
        role="tablist"
        aria-label="1GO 살피GO 배움 및 2GO 인사하GO 놀이 탭"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-slate-300 bg-slate-100 p-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === '1GO'}
          onClick={() => setActiveTab('1GO')}
          className={cn(
            'flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-bold transition-all',
            activeTab === '1GO'
              ? 'bg-[#047857] text-white shadow-sm'
              : 'bg-transparent text-[#1D1D1D] hover:bg-white/70',
          )}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>1GO 살피GO 배움</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === '2GO'}
          onClick={() => setActiveTab('2GO')}
          className={cn(
            'flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-bold transition-all',
            activeTab === '2GO'
              ? 'bg-[#C2410C] text-white shadow-sm'
              : 'bg-transparent text-[#1D1D1D] hover:bg-white/70',
          )}
        >
          <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>2GO 인사하GO 놀이</span>
        </button>
      </div>

      {activeTab === '1GO' ? (
        <Stage1ClassesView
          classes={stage1List}
          appliedIds={appliedIds}
          applyingId={applyingId}
          onApply={(item) => void handleApply(item)}
          onOpenProposalModal={() => setIsModalOpen(true)}
        />
      ) : (
        <Stage2CalendarView
          calendarItems={stage2List}
          appliedIds={appliedIds}
          applyingId={applyingId}
          onApply={(item) => void handleApply(item)}
          onOpenMeetupModal={() => setIsMeetupModalOpen(true)}
        />
      )}

      <ClassProposalModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(created) => {
          setStage1List((prev) => [created, ...prev]);
          setActiveTab('1GO');
        }}
        onNotify={setToast}
      />

      <Stage2MeetupModal
        open={isMeetupModalOpen}
        onClose={() => setIsMeetupModalOpen(false)}
        onCreated={(created) => {
          setStage2List((prev) => [created, ...prev]);
          setActiveTab('2GO');
        }}
        onNotify={setToast}
      />

      <Snackbar message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
