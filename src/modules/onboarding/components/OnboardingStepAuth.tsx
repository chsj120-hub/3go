'use client';

import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useAppContext } from '../context/AppContext';

export type SocialProvider = 'KAKAO' | 'NAVER' | 'GOOGLE' | 'DEMO';

interface OnboardingStepAuthProps {
  onSelectProvider: (provider: SocialProvider) => void;
}

/**
 * 온보딩 1단계: 카카오·네이버·구글 간편 로그인 및 공모전 시연용 데모 즉시 진입.
 */
export function OnboardingStepAuth({
  onSelectProvider,
}: OnboardingStepAuthProps) {
  const { activeRegion } = useAppContext();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
        <div className="h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-300 bg-[#FFFDF8] shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/3go-squirrel.jpg"
            alt="인사하는 우리동네 3GO 다람쥐 마스코트"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
            <span>설치 0원 · 개인정보 최소 수집</span>
          </span>
          <h3 className="mt-1.5 text-lg font-bold leading-snug text-[#1D1D1D]">
            {activeRegion.displayName} 이웃으로
            <br />
            3초 만에 시작해 보세요
          </h3>
          <p className="mt-1 text-xs text-[#555555]">
            직함·나이 계급장 없는 가명 닉네임으로 안전하게 활동합니다.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* 카카오 간편 로그인 (명도 대비 15.8:1) */}
        <button
          type="button"
          onClick={() => onSelectProvider('KAKAO')}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-yellow-400 bg-[#FEE500] px-4 py-3 text-base font-bold text-[#191919] shadow-sm transition hover:brightness-95 active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5 shrink-0 fill-current" aria-hidden="true" />
          <span>카카오로 3초 시작하기</span>
        </button>

        {/* 네이버 간편 로그인 (KRDS AA 4.5:1+ 보정 그린 #028A3F) */}
        <button
          type="button"
          onClick={() => onSelectProvider('NAVER')}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#028A3F] px-4 py-3 text-base font-bold text-white shadow-sm transition hover:bg-[#027334] active:scale-[0.98]"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 items-center justify-center rounded bg-white text-xs font-black text-[#028A3F]"
          >
            N
          </span>
          <span>네이버로 간편 시작하기</span>
        </button>

        {/* 구글 간편 로그인 */}
        <button
          type="button"
          onClick={() => onSelectProvider('GOOGLE')}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-bold text-[#1D1D1D] shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-black text-[#246BEB]"
          >
            G
          </span>
          <span>Google 계정으로 시작하기</span>
        </button>
      </div>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-slate-200" />
        <span className="px-3 text-xs font-bold text-[#555555]">
          또는 공모전 시연 체험
        </span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      <ActionButton
        tone="krds"
        fullWidth
        leadingIcon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
        onClick={() => onSelectProvider('DEMO')}
      >
        <span>데모 계정으로 즉시 진입하기</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </ActionButton>
    </div>
  );
}
