'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Handshake,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
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
import type { SosCategory } from '@/db/schema';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { isRegularOrAbove } from '@/modules/onboarding/demo-users';
import type {
  BackgroundCheckStatus,
  PatrolCrewItem,
  SosBoardItem,
} from '../types';
import { BackgroundCheckModal } from './BackgroundCheckModal';
import { PatrolCrewView } from './PatrolCrewView';
import { SosListView } from './SosListView';
import { ToolLibraryView } from './ToolLibraryView';

type CareTab = 'SOS' | 'TOOL' | 'PATROL';

type PendingSensitiveAction =
  | { type: 'SOS'; item: SosBoardItem }
  | { type: 'PATROL'; crew: PatrolCrewItem };

/**
 * 3단계 이어지GO (/care) 메인 허브.
 * - 클라이언트 2중 블라인드 보안: 준회원(ASSOCIATE) 접근 시 즉시 차단 안내 표시
 * - 내부 3개 탭: [생활 품앗이 SOS] / [스마트 공구도서관] / [야간 안심 순찰 크루]
 * - 아동 동행·야간 순찰 매칭 시 background_check_status === 'approved' 확인 ➔ 미승인 시 전자서명 모달 연결
 */
export function CareBlindHub() {
  const { currentUser, setDemoRole, activeRegion } = useAppContext();
  const isAllowed = isRegularOrAbove(currentUser.role);

  const [activeTab, setActiveTab] = useState<CareTab>('SOS');
  const [items, setItems] = useState<SosBoardItem[]>([]);
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [joinedCrewIds, setJoinedCrewIds] = useState<Record<string, boolean>>(
    {},
  );
  // 심사위원이 미승인자 전자서명 흐름을 바로 시연할 수 있도록 상태 전환 토글 지원
  const [bgStatusOverride, setBgStatusOverride] =
    useState<BackgroundCheckStatus | null>(null);
  const [pendingAction, setPendingAction] =
    useState<PendingSensitiveAction | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const backgroundCheckStatus: BackgroundCheckStatus =
    bgStatusOverride ??
    (currentUser.isCriminalCheckApproved ? 'approved' : 'unverified');

  // 정회원 이상일 때만 서버 API(/api/care/sos) 호출 (준회원은 서버에서도 403 차단)
  useEffect(() => {
    if (!isAllowed) return;
    let active = true;
    fetch('/api/care/sos', {
      headers: { 'x-3go-role': currentUser.role },
    })
      .then((res) => res.json())
      .then((json: { ok?: boolean; items?: SosBoardItem[] }) => {
        if (active && json.ok && Array.isArray(json.items)) {
          setItems(json.items);
        }
      })
      .catch(() => {
        // 오프라인 시 빈 목록 유지
      });
    return () => {
      active = false;
    };
  }, [currentUser.role, isAllowed]);

  const executeSosMatch = useCallback(
    async (item: SosBoardItem, approvedOverride?: BackgroundCheckStatus) => {
      const effectiveBg = approvedOverride ?? backgroundCheckStatus;
      setMatchingId(item.id);
      try {
        const res = await fetch('/api/care/sos', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-3go-role': currentUser.role,
          },
          body: JSON.stringify({
            id: item.id,
            status: 'MATCHED',
            requiresBackgroundCheck: item.requiresBackgroundCheck,
            backgroundCheckStatus: effectiveBg,
          }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          code?: string;
          message?: string;
        };
        if (json.ok) {
          setItems((prev) =>
            prev.map((row) =>
              row.id === item.id ? { ...row, status: 'MATCHED' } : row,
            ),
          );
          setToast(json.message ?? '이웃 매칭이 완료되었습니다!');
        } else if (json.code === 'BACKGROUND_CHECK_REQUIRED') {
          setPendingAction({ type: 'SOS', item });
        } else {
          setToast(json.message ?? '매칭 중 오류가 발생했습니다.');
        }
      } catch {
        setToast('네트워크 연결을 확인해 주세요.');
      } finally {
        setMatchingId(null);
      }
    },
    [backgroundCheckStatus, currentUser.role],
  );

  const handleRequestSosMatch = (item: SosBoardItem) => {
    if (item.requiresBackgroundCheck && backgroundCheckStatus !== 'approved') {
      setPendingAction({ type: 'SOS', item });
      return;
    }
    void executeSosMatch(item);
  };

  const handleJoinPatrolCrew = (crew: PatrolCrewItem) => {
    if (backgroundCheckStatus !== 'approved') {
      setPendingAction({ type: 'PATROL', crew });
      return;
    }
    setJoinedCrewIds((prev) => ({ ...prev, [crew.id]: true }));
    setToast(`'${crew.title}' 야간 안심 순찰 크루에 합류했습니다!`);
  };

  const handleCreatePost = async (payload: {
    category: SosCategory;
    title: string;
    description: string;
    locationHint: string;
  }) => {
    const res = await fetch('/api/care/sos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-3go-role': currentUser.role,
      },
      body: JSON.stringify({
        authorId: currentUser.id,
        authorNickname: currentUser.nickname,
        ...payload,
      }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      item?: SosBoardItem;
      message?: string;
    };
    if (json.ok && json.item) {
      setItems((prev) => [json.item!, ...prev]);
      setToast(json.message ?? '등록이 완료되었습니다!');
    } else {
      setToast(json.message ?? '등록 중 오류가 발생했습니다.');
    }
  };

  // 클라이언트 2중 블라인드 보안 차단 화면
  if (!isAllowed) {
    return (
      <Card className="border-2 border-slate-300 bg-white">
        <CardHeader>
          <Badge variant="outline" className="w-fit text-[#1D1D1D]">
            <Lock className="h-4 w-4 text-[#C2410C]" aria-hidden="true" />
            <span>403 접근 차단 · 정회원 전용 블라인드 구역</span>
          </Badge>
          <CardTitle className="mt-2 text-xl text-[#1D1D1D]">
            준회원은 3단계 이어지GO에 접근할 수 없습니다
          </CardTitle>
          <CardDescription>
            서버 API(HTTP 403)와 화면 양쪽에서 이중 차단됩니다. 1~2단계 참여 및
            동네네컷 완주 후 GPS 인증을 마친 정회원만 입장할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionButton
            tone="stage3"
            fullWidth
            leadingIcon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            onClick={() => setDemoRole('REGULAR')}
          >
            시연용 정회원으로 즉시 전환해 입장하기
          </ActionButton>
        </CardContent>
      </Card>
    );
  }

  const sosOnlyItems = items.filter((item) => item.category !== 'TOOL');
  const toolOnlyItems = items.filter((item) => item.category === 'TOOL');

  return (
    <div className="space-y-4">
      <div>
        <Badge variant="navy">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          <span>3GO 이어지GO · 정회원 이중 보안 통과</span>
        </Badge>
        <h1 className="mt-2 text-2xl font-bold text-[#1E3A8A]">
          {activeRegion.shortName} 상시 안심 돌봄망
        </h1>
        <p className="mt-1 text-sm text-[#555555]">
          {currentUser.nickname}님({currentUser.roleLabel})의 생활 품앗이·공구
          나눔·야간 순찰 허브입니다.
        </p>
      </div>

      {/* 성범죄 경력 조회 승인 상태 바 + 미승인자 서명 플로우 시연 토글 */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-300 bg-white p-3 text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold">
          {backgroundCheckStatus === 'approved' ? (
            <>
              <ShieldCheck className="h-4 w-4 text-[#047857]" aria-hidden="true" />
              <span className="text-[#047857]">
                성범죄 경력 조회: 승인됨 (approved)
              </span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4 text-[#C2410C]" aria-hidden="true" />
              <span className="text-[#C2410C]">
                성범죄 경력 조회: 미승인 (전자서명 필요)
              </span>
            </>
          )}
        </span>

        <button
          type="button"
          onClick={() =>
            setBgStatusOverride(
              backgroundCheckStatus === 'approved' ? 'unverified' : 'approved',
            )
          }
          className="min-h-10 rounded-lg border border-slate-300 bg-[#F8FAFC] px-2.5 text-[11px] font-bold text-[#1D1D1D] hover:bg-slate-100"
        >
          {backgroundCheckStatus === 'approved'
            ? '시연: 미승인자로 전환'
            : '시연: 승인 상태로 전환'}
        </button>
      </div>

      {/* 내부 3개 탭 */}
      <ChipTabs<CareTab>
        ariaLabel="3단계 이어지GO 내부 메뉴"
        tone="stage3"
        value={activeTab}
        onChange={setActiveTab}
        items={[
          {
            value: 'SOS',
            label: '생활 품앗이 SOS',
            badgeText: String(sosOnlyItems.length),
          },
          {
            value: 'TOOL',
            label: '스마트 공구도서관',
            badgeText: String(toolOnlyItems.length),
          },
          { value: 'PATROL', label: '야간 안심 순찰 크루' },
        ]}
      />

      {activeTab === 'SOS' && (
        <SosListView
          items={sosOnlyItems}
          matchingId={matchingId}
          onMatchSos={handleRequestSosMatch}
          onCreateSos={(payload) => handleCreatePost(payload)}
        />
      )}

      {activeTab === 'TOOL' && (
        <ToolLibraryView
          tools={toolOnlyItems}
          matchingId={matchingId}
          onBorrowTool={handleRequestSosMatch}
          onDonateTool={(payload) =>
            handleCreatePost({ category: 'TOOL', ...payload })
          }
        />
      )}

      {activeTab === 'PATROL' && (
        <PatrolCrewView
          joinedCrewIds={joinedCrewIds}
          onJoinCrew={handleJoinPatrolCrew}
        />
      )}

      {/* 성범죄 경력 조회 동의서 전자서명(UI Mock) 모달 */}
      <BackgroundCheckModal
        open={pendingAction !== null}
        targetActionLabel={
          pendingAction?.type === 'SOS'
            ? pendingAction.item.title
            : pendingAction?.crew.title ?? ''
        }
        onClose={() => setPendingAction(null)}
        onApproved={() => {
          setBgStatusOverride('approved');
          if (pendingAction?.type === 'SOS') {
            void executeSosMatch(pendingAction.item, 'approved');
          } else if (pendingAction?.type === 'PATROL') {
            setJoinedCrewIds((prev) => ({
              ...prev,
              [pendingAction.crew.id]: true,
            }));
            setToast(
              `전자서명 승인 완료! '${pendingAction.crew.title}' 크루에 합류했습니다.`,
            );
          }
          setPendingAction(null);
        }}
      />

      <Snackbar message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
