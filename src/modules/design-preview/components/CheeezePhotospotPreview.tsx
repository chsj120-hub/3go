'use client';

import { useState } from 'react';
import { Camera, Clock, Heart, QrCode, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { cn } from '@/lib/utils';
import type { DesignProposalId } from '../design-proposals';

interface CheeezePhotospotPreviewProps {
  proposal: DesignProposalId;
  onAction: (message: string) => void;
}

const PREVIEW_SPOTS = [
  {
    order: 1,
    name: '쌍암공원 호수 산책로',
    mission: '2인 스트레칭 포즈',
    dipCount: 24,
  },
  {
    order: 2,
    name: '응암공원 숲길 쉼터',
    mission: '머리 위 큰 하트',
    dipCount: 31,
  },
  {
    order: 3,
    name: '첨단생활체육공원 강변길',
    mission: '이웃과 하이파이브',
    dipCount: 19,
  },
];

/**
 * 치이이즈(UI Bowl) 레퍼런스 분석을 반영한 모바일·동네네컷 프리뷰.
 * - QR 원터치 진입, D-7 쿠폰 타이머, 카드 스와이프 전환, 공동 참여 '띱!' 인터랙션
 * - KRDS 48px+ 터치 영역 및 4.5:1+ 고대비 기준 우선 적용
 */
export function CheeezePhotospotPreview({
  proposal,
  onAction,
}: CheeezePhotospotPreviewProps) {
  const { activeRegion } = useAppContext();
  const [spotIdx, setSpotIdx] = useState(0);
  const [dipped, setDipped] = useState<Record<number, boolean>>({});

  const spot = PREVIEW_SPOTS[spotIdx];
  const isWhiteStudio = proposal === 'C';
  const isDipped = Boolean(dipped[spot.order]);

  const handleToggleDip = () => {
    setDipped((prev) => ({ ...prev, [spot.order]: !prev[spot.order] }));
    onAction(
      isDipped
        ? `'${spot.name}' 띱 선택을 취소했습니다.`
        : `'${spot.name}' 베스트 컷으로 띱! (함께 동네네컷 반영)`,
    );
  };

  return (
    <div
      className={cn(
        'space-y-4 p-4 transition-colors',
        proposal === 'A' && 'rounded-xl border border-slate-300 bg-white',
        proposal === 'B' &&
          'rounded-[20px] border-2 border-orange-200 bg-[#FFFDF9] shadow-sm',
        isWhiteStudio &&
          'rounded-3xl border-2 border-blue-200 bg-white text-[#1D1D1D] shadow-sm',
      )}
    >
      {/* 치이이즈 7일 타이머 착안 ➔ 원정대 보급소 쿠폰 유효 카운트다운 */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold',
            isWhiteStudio
              ? 'border border-orange-300 bg-orange-50 text-[#9A3412]'
              : 'bg-orange-100 text-[#9A3412]',
          )}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>보급소 쿠폰 D-7 · 선명한 추억</span>
        </span>
        <span className="text-xs font-bold text-[#555555]">
          {isWhiteStudio ? '화이트 스튜디오 · 네컷' : '치이이즈 스타일 · 네컷'}
        </span>
      </div>

      {/* 한 손 스와이프형 스팟 카드 뷰어 */}
      <div
        className={cn(
          'rounded-2xl border p-4',
          isWhiteStudio
            ? 'border-blue-200 bg-[#F8FAFC]'
            : 'border-slate-200 bg-slate-50',
        )}
      >
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={isWhiteStudio ? 'text-[#246BEB]' : 'text-[#047857]'}>
            스팟 {spot.order} / 3 · {activeRegion.shortName}
          </span>
          <span className="text-[#555555]">온디바이스 AI 판정</span>
        </div>

        <p className="mt-1.5 text-lg font-bold text-[#1D1D1D]">{spot.name}</p>
        <p className="text-sm text-[#555555]">
          협동 포즈 미션: <strong className="text-[#1D1D1D]">{spot.mission}</strong>
        </p>

        {/* 이전/다음 스와이프 + 치이이즈 '띱!' 공동참여 버튼 (모두 48px+ 한글 라벨 병기) */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setSpotIdx((i) => (i === 0 ? PREVIEW_SPOTS.length - 1 : i - 1))
              }
              className="inline-flex min-h-12 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-[#1D1D1D]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>이전</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setSpotIdx((i) => (i + 1) % PREVIEW_SPOTS.length)
              }
              className="inline-flex min-h-12 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-[#1D1D1D]"
            >
              <span>다음</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleDip}
            aria-pressed={isDipped}
            className={cn(
              'inline-flex min-h-12 items-center gap-1.5 rounded-xl border-2 px-3.5 text-sm font-bold transition active:scale-95',
              isDipped
                ? 'border-[#C2410C] bg-[#C2410C] text-white'
                : 'border-[#C2410C] bg-white text-[#C2410C]',
            )}
          >
            <Heart
              className={cn('h-4 w-4', isDipped && 'fill-current')}
              aria-hidden="true"
            />
            <span>띱! {spot.dipCount + (isDipped ? 1 : 0)}</span>
          </button>
        </div>
      </div>

      {/* 무설치 QR 초대 & 촬영 진입 액션 */}
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          tone={proposal === 'B' ? 'stage2' : 'krds'}
          leadingIcon={<Camera className="h-5 w-5" aria-hidden="true" />}
          onClick={() =>
            onAction(`시안 ${proposal} · '${spot.name}' AI 촬영 준비 완료!`)
          }
        >
          네컷 촬영
        </ActionButton>
        <ActionButton
          tone="outline"
          leadingIcon={<QrCode className="h-5 w-5" aria-hidden="true" />}
          onClick={() =>
            onAction('설치 없이 바로 참여하는 QR 링크가 복사되었습니다.')
          }
        >
          QR 초대
        </ActionButton>
      </div>
    </div>
  );
}
