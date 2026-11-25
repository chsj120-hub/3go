'use client';

import { Footprints, ShieldAlert, Unlock } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useSafetyLock } from '../hooks/useSafetyLock';

interface SafetyLockOverlayProps {
  /** 외부에서 잠금 상태를 주입할 때 사용 (생략 시 useSafetyLock 내부 구독) */
  isLocked?: boolean;
  isWalkingDetected?: boolean;
  motionIntensity?: number;
  onRelease?: () => void;
}

/**
 * 동네네컷 원정대 보행 안전 잠금(Safety Lock) 오버레이.
 * - DeviceMotion API 보행 진동 감지 또는 데모 스위처 [보행 잠금 강제] 시 화면 전체 블러 처리
 * - "잠시 멈춘 뒤 촬영하세요" 경고 문구 표시 및 촬영 버튼 비활성화 연동
 */
export function SafetyLockOverlay({
  isLocked: lockedProp,
  isWalkingDetected: walkingProp,
  motionIntensity: intensityProp,
  onRelease: releaseProp,
}: SafetyLockOverlayProps) {
  const hookState = useSafetyLock();

  const isLocked = lockedProp ?? hookState.isSafetyLocked;
  const isWalkingDetected = walkingProp ?? hookState.isWalkingDetected;
  const motionIntensity = intensityProp ?? hookState.motionIntensity;
  const onRelease = releaseProp ?? hookState.releaseLock;

  if (!isLocked) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photospot-safety-lock-title"
      className="fixed inset-0 z-50 mx-auto flex max-w-[430px] flex-col items-center justify-center bg-black/75 px-6 text-center text-white backdrop-blur-md"
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/25 ring-4 ring-orange-400/60">
        <ShieldAlert className="h-11 w-11 text-orange-300" aria-hidden="true" />
      </div>

      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#C2410C] px-3.5 py-1.5 text-sm font-bold text-white">
        <Footprints className="h-4 w-4" aria-hidden="true" />
        <span>
          {isWalkingDetected
            ? `보행 진동 감지 (${motionIntensity.toFixed(1)} m/s²)`
            : '안전 산책 모드 · 보행 잠금 작동 중'}
        </span>
      </span>

      <h2
        id="photospot-safety-lock-title"
        className="text-2xl font-bold leading-snug tracking-tight"
      >
        잠시 멈춘 뒤 촬영하세요
      </h2>

      <p className="mt-3 max-w-xs text-base leading-relaxed text-slate-200">
        보행 중 스마트폰을 조작하면 넘어짐·충돌 위험이 큽니다. 안전하게 멈추면
        촬영 버튼이 다시 활성화됩니다.
      </p>

      <div className="mt-7 w-full max-w-xs">
        <ActionButton
          tone="stage1"
          fullWidth
          leadingIcon={<Unlock className="h-5 w-5" aria-hidden="true" />}
          onClick={onRelease}
        >
          정지 확인 · 잠금 해제
        </ActionButton>
      </div>
    </div>
  );
}
