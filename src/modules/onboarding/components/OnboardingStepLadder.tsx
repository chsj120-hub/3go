'use client';

import { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Handshake,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { cn } from '@/lib/utils';

interface OnboardingStepLadderProps {
  onComplete: () => void;
  onBack: () => void;
}

const TRUST_LADDER_CARDS = [
  {
    stepBadge: '카드 1/3 · 0단계 유입 ➔ 1GO 살피GO',
    title: '가볍게 사진 찍고, 무료 생활안전 특강으로 첫인사',
    subtitle: '동네네컷 원정대 & 공공기관 0원 출장 클래스',
    description:
      '쌍암공원·응암공원 3스팟에서 온디바이스 AI 2인 포즈로 동네네컷을 찍고 골목 보급소 할인 쿠폰을 받아요. 소방서 승강기 탈출, 보건소 활력 닥터, 은퇴 장인 자가수리 학교로 부담 없이 이웃과 안면을 틉니다.',
    badgeClass: 'bg-emerald-50 text-[#047857] border-emerald-300',
    icon: Camera,
  },
  {
    stepBadge: '카드 2/3 · 2GO 인사하GO (세대 교차)',
    title: '직함·나이 계급장 없이, 4~8주 시즌제로 텃세 차단',
    subtitle: '가명 닉네임 · 청년 매개자 · 골목 상권 상생',
    description:
      '기존 경로당 서열화 대신 가명 닉네임과 4~8주 시즌제를 운영합니다. 어르신 훈수 고스트 바둑왕전, 비수기 동네 PC방 상생 E-스포츠, 혼밥 탈출 한솥밥으로 초등학생·청년·시니어가 자연스럽게 친해집니다.',
    badgeClass: 'bg-orange-50 text-[#C2410C] border-orange-300',
    icon: Users,
  },
  {
    stepBadge: '카드 3/3 · 3GO 이어지GO (정회원 블라인드)',
    title: '검증된 정회원에게만 열리는 마을 안심 돌봄망',
    subtitle: '30일 GPS 인증 + 성범죄 경력 조회 승인 필수',
    description:
      '준회원 화면에서는 3단계 메뉴 자체가 완전히 숨겨집니다(Blind). 1~2단계 참여와 본인 검증을 마친 정회원만 생활 품앗이 SOS, 스마트 공구도서관, 야간 안심 순찰망을 안심하고 이용할 수 있습니다.',
    badgeClass: 'bg-blue-50 text-[#1E3A8A] border-blue-300',
    icon: Handshake,
  },
];

/**
 * 온보딩 3단계: 4단계 신뢰 사다리(0단계 동네네컷 ➔ 1GO ➔ 2GO ➔ 3GO 블라인드) 안내 카드 3장.
 */
export function OnboardingStepLadder({
  onComplete,
  onBack,
}: OnboardingStepLadderProps) {
  const [cardIdx, setCardIdx] = useState(0);
  const currentCard = TRUST_LADDER_CARDS[cardIdx];
  const Icon = currentCard.icon;
  const isLast = cardIdx === TRUST_LADDER_CARDS.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#246BEB]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>4단계 신뢰 사다리 안내 (총 3장)</span>
        </span>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {TRUST_LADDER_CARDS.map((card, index) => (
            <span
              key={card.stepBadge}
              className={cn(
                'h-2 rounded-full transition-all',
                index === cardIdx ? 'w-6 bg-[#246BEB]' : 'w-2 bg-slate-300',
              )}
            />
          ))}
        </div>
      </div>

      {/* 신뢰 사다리 안내 카드 */}
      <article className="min-h-[240px] space-y-3 rounded-2xl border-2 border-slate-200 bg-[#F8FAFC] p-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold',
              currentCard.badgeClass,
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{currentCard.stepBadge}</span>
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold leading-snug text-[#1D1D1D]">
            {currentCard.title}
          </h3>
          <p className="mt-1 text-xs font-bold text-[#246BEB]">
            {currentCard.subtitle}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-[#555555]">
          {currentCard.description}
        </p>
      </article>

      {/* 카드 이동 & 완료 컨트롤 (모두 48px+ 한글 라벨 병기) */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => (cardIdx === 0 ? onBack() : setCardIdx((i) => i - 1))}
          className="inline-flex min-h-12 items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm font-bold text-[#1D1D1D] hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>{cardIdx === 0 ? 'GPS 단계' : '이전 카드'}</span>
        </button>

        {isLast ? (
          <ActionButton
            tone="krds"
            leadingIcon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
            onClick={onComplete}
          >
            우리동네 3GO 시작하기
          </ActionButton>
        ) : (
          <ActionButton
            tone="krds"
            onClick={() => setCardIdx((i) => i + 1)}
          >
            <span>다음 카드 ({cardIdx + 2}/3)</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </ActionButton>
        )}
      </div>
    </div>
  );
}
