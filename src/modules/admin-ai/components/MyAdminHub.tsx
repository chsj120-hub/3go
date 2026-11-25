'use client';

import { useEffect, useState } from 'react';
import { Award, Crown, Sparkles } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChipTabs } from '@/components/ui/chip-tabs';
import { Snackbar } from '@/components/ui/snackbar';
import type { ProposalListItem } from '@/app/api/admin-ai/proposals/route';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { isAdminOrLeader } from '@/modules/onboarding/demo-users';
import { SafeChatHub } from '@/modules/safe-chat/components/SafeChatHub';
import { BudgetProposalPanel } from './BudgetProposalPanel';
import { MerchantBannerAgent } from './MerchantBannerAgent';
import { PrGeneratorPanel } from './PrGeneratorPanel';

type AdminTab = 'PR_BANNER' | 'BUDGET' | 'SAFE_CHAT';

/**
 * `/my` 및 `/admin` 통합 마이·행정 대시보드.
 * - 전 사용자: 내 프로필 & 비화폐성 디지털 명예 배지 보관함
 * - TF팀장·공무원 전용: AI 4-Way 홍보문 · 로컬 상점 배너 에이전트 · 예산 품의/e호조 엑셀 · 인앱 안심 톡방/회의록 PDF
 */
export function MyAdminHub() {
  const { currentUser, setDemoRole, activeRegion } = useAppContext();
  const hasAdminAccess = isAdminOrLeader(currentUser.role);

  const [adminTab, setAdminTab] = useState<AdminTab>('PR_BANNER');
  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/admin-ai/proposals')
      .then((res) => res.json())
      .then((json: { ok?: boolean; proposals?: ProposalListItem[] }) => {
        if (active && json.ok && Array.isArray(json.proposals)) {
          setProposals(json.proposals);
        }
      })
      .catch(() => {
        // 오프라인 시 빈 배열 유지
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <Badge variant="outline">
          <Crown className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
          <span>마이페이지 &amp; 행정 업무 제로화</span>
        </Badge>
        <h1 className="mt-2 text-2xl font-bold text-[#1D1D1D]">
          {currentUser.nickname} ({currentUser.roleLabel})
        </h1>
        <p className="mt-1 text-sm text-[#555555]">
          소속 생활권: {activeRegion.displayName} (코드 {activeRegion.sigunguCode})
        </p>
      </div>

      {/* 비화폐성 디지털 명예 배지 보관함 */}
      <Card className="border-slate-300 bg-white">
        <CardHeader className="pb-3">
          <Badge variant="default" className="w-fit">
            <Award className="h-4 w-4" aria-hidden="true" />
            <span>비화폐성 디지털 명예 배지</span>
          </Badge>
          <CardTitle className="mt-1 text-lg">내 마을 기여 명예장</CardTitle>
          <CardDescription>
            현금성 보상 대신 동네네컷 완주·품앗이·공구 기증 활동이 디지털 명예
            배지로 기록됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-xs font-bold">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[#065F46]">
            🏅 첨단 동네네컷 1기 완주
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-2.5 text-[#1E3A8A]">
            🛡️ 단임 투명 TF 명예장
          </div>
        </CardContent>
      </Card>

      {!hasAdminAccess ? (
        <Card className="border-2 border-dashed border-slate-300 bg-white">
          <CardHeader>
            <CardTitle className="text-base text-[#1D1D1D]">
              행정 자동화 대시보드는 TF팀장 · 공무원 전용입니다
            </CardTitle>
            <CardDescription>
              아래 버튼 또는 우측 상단 [🎭 시연 모드]에서 TF팀장·공무원으로
              전환하면 AI 4-Way 홍보문, e호조 엑셀 변환, 안심 톡방 회의록 PDF를
              바로 체험할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <ActionButton
              tone="stage2"
              leadingIcon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setDemoRole('TF_LEADER')}
            >
              TF팀장 시연
            </ActionButton>
            <ActionButton
              tone="stage3"
              leadingIcon={<Crown className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setDemoRole('OFFICIAL')}
            >
              공무원 시연
            </ActionButton>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <ChipTabs<AdminTab>
            ariaLabel="행정 자동화 대시보드 탭"
            tone="krds"
            value={adminTab}
            onChange={setAdminTab}
            items={[
              { value: 'PR_BANNER', label: 'AI 홍보·배너' },
              {
                value: 'BUDGET',
                label: '예산 품의·엑셀',
                badgeText: String(proposals.length),
              },
              { value: 'SAFE_CHAT', label: '안심 톡방·PDF' },
            ]}
          />

          {adminTab === 'PR_BANNER' && (
            <div className="space-y-4">
              <PrGeneratorPanel onNotify={setToast} />
              <MerchantBannerAgent onNotify={setToast} />
            </div>
          )}

          {adminTab === 'BUDGET' && (
            <BudgetProposalPanel
              proposals={proposals}
              onProposalCreated={(created) =>
                setProposals((prev) => [created, ...prev])
              }
              onProposalApproved={(id) =>
                setProposals((prev) =>
                  prev.map((p) =>
                    p.id === id ? { ...p, status: 'APPROVED' } : p,
                  ),
                )
              }
              onNotify={setToast}
            />
          )}

          {adminTab === 'SAFE_CHAT' && (
            <SafeChatHub proposals={proposals} onNotify={setToast} />
          )}
        </div>
      )}

      <Snackbar message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
