'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import {
  OnboardingStepAuth,
  type SocialProvider,
} from './OnboardingStepAuth';
import { OnboardingStepGps } from './OnboardingStepGps';
import { OnboardingStepLadder } from './OnboardingStepLadder';
import { cn } from '@/lib/utils';

type OnboardingStep = 1 | 2 | 3;

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  KAKAO: '카카오 로그인',
  NAVER: '네이버 로그인',
  GOOGLE: '구글 로그인',
  DEMO: '데모 즉시 진입',
};

interface OnboardingModalProps {
  onFinished?: (message: string) => void;
}

/**
 * 최초 진입용 3단계 온보딩 모달.
 * 1) 카카오·네이버·구글 간편 로그인(데모 즉시 진입)
 * 2) GPS 1.5km 생활권 동네 인증(실제 Geolocation + 가상 GPS)
 * 3) 4단계 신뢰 사다리 안내 카드 3장
 */
export function OnboardingModal({ onFinished }: OnboardingModalProps) {
  const { isOnboardingOpen, closeOnboarding, completeOnboarding, setDemoRole } =
    useAppContext();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [provider, setProvider] = useState<SocialProvider>('DEMO');

  useEffect(() => {
    if (!isOnboardingOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOnboarding();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingOpen, closeOnboarding]);

  if (!isOnboardingOpen) return null;

  const handleSelectProvider = (selected: SocialProvider) => {
    setProvider(selected);
    if (selected === 'DEMO') {
      setDemoRole('REGULAR');
    }
    setStep(2);
  };

  const handleComplete = () => {
    completeOnboarding();
    setStep(1);
    onFinished?.('온보딩이 완료되었습니다! 우리동네 3GO를 자유롭게 둘러보세요.');
  };

  const handleClose = () => {
    closeOnboarding();
    setStep(1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 mx-auto flex max-w-[430px] items-end justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:items-center"
      onClick={handleClose}
    >
      <div
        className="animate-slide-up max-h-[90dvh] w-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-[#246BEB]">
              우리동네 3GO 첫 방문 안내 ({step} / 3단계)
            </p>
            <h2
              id="onboarding-modal-title"
              className="text-lg font-bold text-[#1D1D1D]"
            >
              {step === 1 && '간편 로그인'}
              {step === 2 && '우리동네 GPS 인증'}
              {step === 3 && '4단계 신뢰 사다리'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex min-h-12 items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-[#1D1D1D] hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>닫기</span>
          </button>
        </div>

        {/* 3단계 진행 막대 */}
        <div className="mb-4 grid grid-cols-3 gap-1.5" aria-hidden="true">
          {([1, 2, 3] as const).map((idx) => (
            <div
              key={idx}
              className={cn(
                'h-2 rounded-full transition-colors',
                idx <= step ? 'bg-[#246BEB]' : 'bg-slate-200',
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <OnboardingStepAuth onSelectProvider={handleSelectProvider} />
        )}

        {step === 2 && (
          <OnboardingStepGps
            selectedProviderLabel={PROVIDER_LABELS[provider]}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <OnboardingStepLadder
            onBack={() => setStep(2)}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
