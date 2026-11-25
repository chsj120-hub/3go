'use client';

import { usePathname } from 'next/navigation';
import { Footprints, ShieldAlert, Unlock } from 'lucide-react';
import { useAppContext } from '@/modules/onboarding/context/AppContext';

/**
 * 전역 보행 안전 잠금(Safety Lock) 오버레이.
 * /photospot 페이지에서는 DeviceMotion 센서가 통합된 전용 SafetyLockOverlay가 렌더링되므로 중복을 방지합니다.
 */
export function SafetyLockOverlay() {
  const pathname = usePathname();
  const { simulators, setSimulator } = useAppContext();

  if (!simulators.forceSafetyLock || pathname.startsWith('/photospot')) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-lock-title"
      className="fixed inset-0 z-50 mx-auto flex max-w-[430px] flex-col items-center justify-center bg-black/75 px-6 text-center text-white backdrop-blur-md"
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/25 ring-4 ring-orange-400/60">
        <ShieldAlert className="h-11 w-11 text-orange-300" aria-hidden="true" />
      </div>

      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#C2410C] px-3.5 py-1.5 text-sm font-bold text-white">
        <Footprints className="h-4 w-4" aria-hidden="true" />
        <span>보행 진동 감지 · Safety Lock 작동 중</span>
      </span>

      <h2
        id="safety-lock-title"
        className="text-2xl font-bold leading-snug tracking-tight"
      >
        잠시 멈춘 뒤 촬영하세요
      </h2>

      <p className="mt-3 max-w-xs text-base leading-relaxed text-slate-200">
        보행 중 스마트폰 조작으로 인한 넘어짐·충돌 사고를 예방하기 위해 화면을
        잠시 잠갔습니다.
      </p>

      <button
        type="button"
        onClick={() => setSimulator('forceSafetyLock', false)}
        className="mt-7 inline-flex min-h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-[#047857] px-5 py-3.5 text-lg font-bold text-white shadow-lg transition hover:bg-emerald-800 active:scale-[0.98]"
      >
        <Unlock className="h-5 w-5" aria-hidden="true" />
        <span>정지 확인 · 잠금 해제</span>
      </button>
    </div>
  );
}
