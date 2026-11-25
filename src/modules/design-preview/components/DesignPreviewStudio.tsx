'use client';

import { useState } from 'react';
import { CheckCircle2, Palette, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChipTabs } from '@/components/ui/chip-tabs';
import { Snackbar } from '@/components/ui/snackbar';
import {
  DESIGN_PROPOSALS,
  KRDS_CONFLICT_RULES,
  type DesignProposalId,
} from '../design-proposals';
import { CheeezePhotospotPreview } from './CheeezePhotospotPreview';
import { MogakjakWebPreview } from './MogakjakWebPreview';

type PreviewSectionTab = 'ALL' | 'WEB' | 'PHOTOSPOT' | 'CONFLICTS';

export function DesignPreviewStudio() {
  const [proposal, setProposal] = useState<DesignProposalId>('C');
  const [sectionTab, setSectionTab] = useState<PreviewSectionTab>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const spec = DESIGN_PROPOSALS[proposal];

  const handleSelectProposal = (next: DesignProposalId) => {
    setProposal(next);
    setToast(`${DESIGN_PROPOSALS[next].shortLabel} 미리보기로 전환했습니다.`);
  };

  return (
    <div className="space-y-4">
      <div>
        <Badge variant="navy">
          <Palette className="h-4 w-4" aria-hidden="true" />
          <span>KRDS 우선 · 모각작 · 치이이즈 · SEED 통합 시안</span>
        </Badge>
        <h1 className="mt-2 text-2xl font-bold text-[#1D1D1D]">
          디자인 예시안 3종 비교
        </h1>
        <p className="mt-1 text-sm text-[#555555]">
          시안 A/B/C를 눌러 웹(모각작), 동네네컷(치이이즈), SEED 컴포넌트가
          KRDS 지침 안에서 어떻게 보이는지 바로 비교해 보세요.
        </p>
      </div>

      {/* 시안 3종 선택 SEED ChipTabs */}
      <ChipTabs<DesignProposalId>
        ariaLabel="디자인 시안 선택"
        tone={proposal === 'A' ? 'krds' : proposal === 'B' ? 'stage1' : 'stage3'}
        value={proposal}
        onChange={handleSelectProposal}
        items={[
          { value: 'A', label: '시안 A · KRDS 표준' },
          { value: 'B', label: '시안 B · SEED 친근' },
          { value: 'C', label: '시안 C · 화이트 스튜디오', badgeText: '확정' },
        ]}
      />

      {/* 선택 시안 요약 카드 */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#1D1D1D]">{spec.title}</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1E3A8A]">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{spec.krdsComplianceScore}</span>
          </span>
        </div>
        <p className="mt-1 text-sm text-[#555555]">{spec.tagline}</p>
        <p className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs font-bold text-[#1D1D1D]">
          추천 상황: {spec.bestFor}
        </p>
      </div>

      {/* 영역 필터 ChipTabs */}
      <ChipTabs<PreviewSectionTab>
        ariaLabel="미리보기 영역 선택"
        tone="dark"
        value={sectionTab}
        onChange={setSectionTab}
        items={[
          { value: 'ALL', label: '전체 보기' },
          { value: 'WEB', label: '웹·홈(모각작)' },
          { value: 'PHOTOSPOT', label: '네컷(치이이즈)' },
          { value: 'CONFLICTS', label: 'KRDS 충돌해결' },
        ]}
      />

      {(sectionTab === 'ALL' || sectionTab === 'WEB') && (
        <MogakjakWebPreview proposal={proposal} onAction={setToast} />
      )}

      {(sectionTab === 'ALL' || sectionTab === 'PHOTOSPOT') && (
        <CheeezePhotospotPreview proposal={proposal} onAction={setToast} />
      )}

      {(sectionTab === 'ALL' || sectionTab === 'CONFLICTS') && (
        <section className="space-y-2.5 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#1E3A8A]">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <span>정부 지침(KRDS) 우선 충돌 해결 원칙</span>
          </div>
          <ul className="space-y-2">
            {KRDS_CONFLICT_RULES.map((item) => (
              <li
                key={item.conflict}
                className="rounded-xl border border-blue-100 bg-white p-3 text-xs leading-relaxed"
              >
                <p className="font-bold text-[#1D1D1D]">충돌: {item.conflict}</p>
                <p className="mt-1 text-[#047857] font-bold">
                  해결: {item.resolution}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Snackbar message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
