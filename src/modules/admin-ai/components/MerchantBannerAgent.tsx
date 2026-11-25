'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  MessageSquareWarning,
  Sparkles,
  Store,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useAppContext } from '@/modules/onboarding/context/AppContext';

interface BannerDraft {
  id: string;
  merchantName: string;
  reviewQuote: string;
  headline: string;
  discountBadge: string;
  status: 'DRAFT' | 'APPROVED' | 'REVISION_REQUESTED';
}

interface MerchantBannerAgentProps {
  onNotify: (message: string) => void;
}

/**
 * 로컬 상점 리뷰 배너 에이전트.
 * - 주민 리뷰 입력 시 상점 상생 배너 초안 자동 생성
 * - 공무원(OFFICIAL) 역할에서만 [승인 및 홈 게시] / [수정 요청] 버튼 활성화 및 홈 배너 실시간 반영
 */
export function MerchantBannerAgent({ onNotify }: MerchantBannerAgentProps) {
  const { currentUser, publishMerchantBanner } = useAppContext();
  const isOfficial = currentUser.role === 'OFFICIAL';

  const [merchantName, setMerchantName] = useState('쌍암 호수로스터스');
  const [reviewText, setReviewText] = useState(
    '동네네컷 찍고 들렀는데 사장님이 어르신께 따뜻한 대추차도 챙겨주시고 정말 친절해요!',
  );
  const [draft, setDraft] = useState<BannerDraft | null>(null);

  const handleGenerateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const discountMap: Record<string, string> = {
      '쌍암 호수로스터스': '동네네컷 완주 시 전 음료 1,000원 할인',
      '월계 수제식빵공방': '5,000원 이상 구매 시 단팥빵 1개 증정',
      '첨단 추억의 떡볶이': '세대 동반 세트 메뉴 15% 할인',
      '비수기 상생 첨단 E-존 PC방': '평일 오전 세대 동반 2시간 무료',
    };

    setDraft({
      id: `banner-${Date.now()}`,
      merchantName,
      reviewQuote: reviewText.trim(),
      headline: `이웃이 직접 추천한 ${merchantName} · 따뜻한 골목 보급소!`,
      discountBadge:
        discountMap[merchantName] ?? '동네네컷 완주자 상생 할인 혜택',
      status: 'DRAFT',
    });
    onNotify('주민 리뷰 기반 상점 상생 배너 초안이 자동 생성되었습니다!');
  };

  const handleApproveAndPublish = () => {
    if (!draft || !isOfficial) return;
    setDraft({ ...draft, status: 'APPROVED' });
    publishMerchantBanner({
      id: draft.id,
      merchantName: draft.merchantName,
      headline: draft.headline,
      reviewQuote: draft.reviewQuote,
      discountBadge: draft.discountBadge,
      approvedAt: new Date().toISOString(),
    });
    onNotify(
      `공무원 승인 완료! '${draft.merchantName}' 상생 배너가 홈 화면(/)에 실시간 게시되었습니다.`,
    );
  };

  const handleRequestRevision = () => {
    if (!draft || !isOfficial) return;
    setDraft({ ...draft, status: 'REVISION_REQUESTED' });
    onNotify('상점 배너 초안에 [수정 요청] 상태를 기록했습니다.');
  };

  return (
    <section className="space-y-3.5 rounded-3xl border-2 border-slate-300 bg-white p-4 shadow-sm">
      <div>
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-[#9A3412]">
          <Store className="h-3.5 w-3.5 text-[#C2410C]" aria-hidden="true" />
          <span>로컬 상점 리뷰 배너 에이전트</span>
        </span>
        <h2 className="mt-1 text-lg font-bold text-[#1D1D1D]">
          주민 리뷰 ➔ 상생 배너 초안 &amp; 공무원 승인 게시
        </h2>
      </div>

      <form onSubmit={handleGenerateDraft} className="space-y-2.5">
        <select
          aria-label="제휴 상점 선택"
          value={merchantName}
          onChange={(e) => setMerchantName(e.target.value)}
          className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-[#1D1D1D]"
        >
          <option value="쌍암 호수로스터스">쌍암 호수로스터스 (카페)</option>
          <option value="월계 수제식빵공방">월계 수제식빵공방 (베이커리)</option>
          <option value="첨단 추억의 떡볶이">첨단 추억의 떡볶이 (분식)</option>
          <option value="비수기 상생 첨단 E-존 PC방">
            비수기 상생 첨단 E-존 PC방 (동네PC방)
          </option>
        </select>

        <textarea
          rows={2}
          required
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="주민이 남긴 영수증·방문 리뷰를 입력해 주세요"
          className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm text-[#1D1D1D]"
        />

        <ActionButton
          type="submit"
          tone="stage2"
          fullWidth
          leadingIcon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
        >
          상점 상생 배너 초안 자동 생성
        </ActionButton>
      </form>

      {draft && (
        <div className="space-y-3 rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-3.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#1E3A8A]">{draft.merchantName} 초안</span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[#1D1D1D]">
              {draft.status === 'APPROVED'
                ? '승인 · 홈 게시 완료'
                : draft.status === 'REVISION_REQUESTED'
                  ? '수정 요청됨'
                  : '공무원 승인 대기'}
            </span>
          </div>

          <p className="text-base font-bold text-[#1D1D1D]">{draft.headline}</p>
          <p className="text-xs text-[#555555]">
            &ldquo;{draft.reviewQuote}&rdquo; ·{' '}
            <strong className="text-[#C2410C]">{draft.discountBadge}</strong>
          </p>

          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              tone="stage1"
              disabled={!isOfficial || draft.status === 'APPROVED'}
              leadingIcon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              onClick={handleApproveAndPublish}
            >
              승인 및 홈 게시
            </ActionButton>
            <ActionButton
              tone="outline"
              disabled={!isOfficial}
              leadingIcon={
                <MessageSquareWarning className="h-4 w-4" aria-hidden="true" />
              }
              onClick={handleRequestRevision}
            >
              수정 요청
            </ActionButton>
          </div>

          {!isOfficial && (
            <p className="text-xs font-bold text-[#9A3412]">
              ※ [승인 및 홈 게시] / [수정 요청]은 공무원(OFFICIAL) 역할에서만
              활성화됩니다. [🎭 시연 모드]에서 공무원으로 전환해 보세요.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
