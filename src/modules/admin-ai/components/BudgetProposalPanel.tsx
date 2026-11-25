'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import type { TargetAccountingSystem } from '@/db/schema';
import type { ProposalListItem } from '@/app/api/admin-ai/proposals/route';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { downloadAccountingExcel } from '../lib/excel-export';

interface DraftBudgetRow {
  itemName: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  purchaseUrl: string;
}

interface BudgetProposalPanelProps {
  proposals: ProposalListItem[];
  onProposalCreated: (proposal: ProposalListItem) => void;
  onProposalApproved: (id: string) => void;
  onNotify: (message: string) => void;
}

/**
 * 공개 예산 품의 관리 & SheetJS(xlsx) e호조·에듀파인 표준 엑셀 다운로드.
 * - TF팀장·공무원: 품목·규격·수량·단가·구매URL 입력 시 자동 합계 계산 후 Neon DB 등록
 * - 공무원(OFFICIAL): [승인] 처리 및 [e호조 / 에듀파인 표준 엑셀 다운로드(.xlsx)] 즉시 실행
 */
export function BudgetProposalPanel({
  proposals,
  onProposalCreated,
  onProposalApproved,
  onNotify,
}: BudgetProposalPanelProps) {
  const { currentUser } = useAppContext();
  const isOfficial = currentUser.role === 'OFFICIAL';
  const canCreate =
    currentUser.role === 'TF_LEADER' || currentUser.role === 'OFFICIAL';

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetSystem, setTargetSystem] =
    useState<TargetAccountingSystem>('EHOJO');
  const [rows, setRows] = useState<DraftBudgetRow[]>([
    {
      itemName: '방충망 교체 실습 자재 세트',
      spec: '90cm × 15m',
      quantity: 2,
      unitPrice: 35000,
      purchaseUrl: 'https://www.g2b.go.kr',
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const autoTotal = rows.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || rows.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin-ai/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-3go-role': currentUser.role,
        },
        body: JSON.stringify({
          title,
          proposerId: currentUser.id,
          targetSystem,
          items: rows,
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        proposal?: ProposalListItem;
        message?: string;
      };
      if (json.ok && json.proposal) {
        onProposalCreated(json.proposal);
        onNotify(json.message ?? '예산 품의가 등록되었습니다!');
        setTitle('');
        setShowForm(false);
      } else {
        onNotify(json.message ?? '품의 등록 중 오류가 발생했습니다.');
      }
    } catch {
      onNotify('네트워크 연결을 확인해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (proposal: ProposalListItem) => {
    if (!isOfficial || approvingId) return;
    setApprovingId(proposal.id);
    try {
      const response = await fetch('/api/admin-ai/proposals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-3go-role': currentUser.role,
        },
        body: JSON.stringify({ id: proposal.id, status: 'APPROVED' }),
      });
      const json = (await response.json()) as { ok?: boolean; message?: string };
      if (json.ok) {
        onProposalApproved(proposal.id);
        onNotify(json.message ?? '공무원 승인이 완료되었습니다!');
      } else {
        onNotify(json.message ?? '승인 처리 중 오류가 발생했습니다.');
      }
    } catch {
      onNotify('네트워크 연결을 확인해 주세요.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section className="space-y-3.5 rounded-3xl border-2 border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#047857]">
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            <span>투명 공개 품의 ➔ e호조 · 에듀파인 (.xlsx)</span>
          </span>
          <h2 className="mt-1 text-lg font-bold text-[#1D1D1D]">
            예산 품의 관리 ({proposals.length}건)
          </h2>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex min-h-12 items-center gap-1 rounded-xl bg-[#246BEB] px-3 text-xs font-bold text-white"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>{showForm ? '닫기' : '신규 품의'}</span>
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-3 rounded-2xl border-2 border-[#246BEB] bg-[#F8FAFC] p-3.5"
        >
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="품의 건명 (예: [1GO] 12월 자가수리 실습 자재 구입)"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-[#1D1D1D]"
          />

          <div className="grid grid-cols-2 gap-2">
            {(['EHOJO', 'EDUFINE'] as const).map((sys) => (
              <button
                key={sys}
                type="button"
                onClick={() => setTargetSystem(sys)}
                className={
                  targetSystem === sys
                    ? 'min-h-12 rounded-xl bg-[#1E3A8A] text-xs font-bold text-white'
                    : 'min-h-12 rounded-xl border border-slate-300 bg-white text-xs font-bold text-[#1D1D1D]'
                }
              >
                {sys === 'EHOJO' ? 'e호조 (지자체)' : '에듀파인 (학교·교육)'}
              </button>
            ))}
          </div>

          {rows.map((row, idx) => (
            <div
              key={idx}
              className="space-y-2 rounded-xl border border-slate-300 bg-white p-3"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>품목 #{idx + 1}</span>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setRows((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="inline-flex items-center gap-1 text-[#B91C1C]"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>삭제</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={row.itemName}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((r, i) =>
                      i === idx ? { ...r, itemName: e.target.value } : r,
                    ),
                  )
                }
                placeholder="품목명"
                className="min-h-11 w-full rounded-lg border border-slate-300 px-2.5 text-xs"
              />
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  value={row.spec}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, spec: e.target.value } : r,
                      ),
                    )
                  }
                  placeholder="규격"
                  className="min-h-11 rounded-lg border border-slate-300 px-2 text-xs"
                />
                <input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r, i) =>
                        i === idx
                          ? { ...r, quantity: Number(e.target.value) }
                          : r,
                      ),
                    )
                  }
                  placeholder="수량"
                  className="min-h-11 rounded-lg border border-slate-300 px-2 text-xs"
                />
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={row.unitPrice}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r, i) =>
                        i === idx
                          ? { ...r, unitPrice: Number(e.target.value) }
                          : r,
                      ),
                    )
                  }
                  placeholder="단가(원)"
                  className="min-h-11 rounded-lg border border-slate-300 px-2 text-xs"
                />
              </div>
              <input
                type="url"
                value={row.purchaseUrl}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((r, i) =>
                      i === idx ? { ...r, purchaseUrl: e.target.value } : r,
                    ),
                  )
                }
                placeholder="구매처 URL (예: https://www.g2b.go.kr)"
                className="min-h-11 w-full rounded-lg border border-slate-300 px-2.5 text-xs"
              />
            </div>
          ))}

          <div className="flex items-center justify-between text-sm font-bold">
            <button
              type="button"
              onClick={() =>
                setRows((prev) => [
                  ...prev,
                  {
                    itemName: '',
                    spec: '',
                    quantity: 1,
                    unitPrice: 10000,
                    purchaseUrl: 'https://www.g2b.go.kr',
                  },
                ])
              }
              className="text-xs font-bold text-[#246BEB] underline"
            >
              + 품목 행 추가
            </button>
            <span className="text-[#1E3A8A]">
              자동 합계: {autoTotal.toLocaleString()}원
            </span>
          </div>

          <ActionButton type="submit" tone="krds" fullWidth loading={isSaving}>
            공개 품의서 등록하기
          </ActionButton>
        </form>
      )}

      {/* 품의 목록 카드 */}
      <div className="space-y-3">
        {proposals.map((proposal) => {
          const isApproved = proposal.status === 'APPROVED';
          const sysLabel =
            proposal.targetSystem === 'EDUFINE' ? '에듀파인' : 'e호조';

          return (
            <article
              key={proposal.id}
              className="space-y-2.5 rounded-2xl border border-slate-300 bg-[#F8FAFC] p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-[#1E3A8A] px-2 py-0.5 text-[11px] font-bold text-white">
                    {sysLabel}
                  </span>
                  <span
                    className={
                      isApproved
                        ? 'rounded-full bg-[#047857] px-2.5 py-0.5 text-[11px] font-bold text-white'
                        : 'rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-950'
                    }
                  >
                    {isApproved ? '공무원 승인 완료' : '승인 대기'}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#1D1D1D]">
                  {proposal.totalAmount.toLocaleString()}원
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#1D1D1D]">
                {proposal.title}
              </h3>

              <ul className="space-y-1 text-xs text-[#555555]">
                {proposal.itemsJson.map((item, i) => (
                  <li key={`${proposal.id}-${i}`} className="flex justify-between gap-2">
                    <span className="truncate">
                      · {item.itemName} ({item.quantity}개)
                    </span>
                    <span className="shrink-0 font-bold text-[#1D1D1D]">
                      {item.amount.toLocaleString()}원
                    </span>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {!isApproved && (
                  <ActionButton
                    tone="stage3"
                    fullWidth
                    disabled={!isOfficial}
                    loading={approvingId === proposal.id}
                    leadingIcon={
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    }
                    onClick={() => void handleApprove(proposal)}
                  >
                    {isOfficial
                      ? '공무원 최종 승인 처리'
                      : '공무원(OFFICIAL) 역할에서만 승인 가능'}
                  </ActionButton>
                )}

                <ActionButton
                  tone="stage1"
                  fullWidth
                  leadingIcon={
                    <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                  }
                  onClick={() => {
                    const file = downloadAccountingExcel(proposal);
                    onNotify(`${file} 파일이 즉시 다운로드되었습니다!`);
                  }}
                >
                  {sysLabel} 표준 엑셀 다운로드 (.xlsx)
                </ActionButton>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
