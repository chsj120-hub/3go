'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '@/modules/onboarding/context/AppContext';

/** 보행 진동으로 판정할 가속도 변화량 임계치 (m/s²) */
const WALKING_THRESHOLD = 2.6;
/** 멈춘 뒤 자동 잠금 해제까지 대기 시간 (ms) */
const STILLNESS_RELEASE_MS = 2500;

interface DeviceMotionEventWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export interface SafetyLockState {
  /** 최종 보행 잠금 활성화 여부 (실제 센서 또는 시연 토글) */
  isSafetyLocked: boolean;
  /** 실제 DeviceMotion 센서로 보행 진동이 감지되었는지 여부 */
  isWalkingDetected: boolean;
  /** 현재 가속도 진동 수치 (m/s², 소수점 1자리) */
  motionIntensity: number;
  /** iOS Safari 등 명시적 센서 권한 요청이 필요한지 여부 */
  needsPermission: boolean;
  /** 센서 권한 요청 핸들러 */
  requestMotionPermission: () => Promise<void>;
  /** 수동 잠금 해제 (정지 확인 버튼) */
  releaseLock: () => void;
}

/**
 * DeviceMotion API 기반 보행 진동 감지 + 데모 스위처 [보행 잠금 강제] 통합 훅.
 * 가속도 센서가 보행 진동 임계치를 넘으면 자동으로 안전 잠금을 발동합니다.
 */
export function useSafetyLock(): SafetyLockState {
  const { simulators, setSimulator } = useAppContext();
  const [isWalkingDetected, setIsWalkingDetected] = useState(false);
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(true);

  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const needsPermission =
    typeof window !== 'undefined' &&
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as unknown as DeviceMotionEventWithPermission)
      .requestPermission === 'function' &&
    !permissionGranted;

  const requestMotionPermission = useCallback(async () => {
    if (typeof DeviceMotionEvent === 'undefined') return;
    const ctor =
      DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
    if (typeof ctor.requestPermission === 'function') {
      try {
        const result = await ctor.requestPermission();
        setPermissionGranted(result === 'granted');
      } catch {
        setPermissionGranted(false);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !permissionGranted) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const linear = event.acceleration;
      const withGravity = event.accelerationIncludingGravity;

      let delta = 0;
      if (
        linear &&
        linear.x !== null &&
        linear.y !== null &&
        linear.z !== null
      ) {
        delta = Math.sqrt(
          linear.x * linear.x + linear.y * linear.y + linear.z * linear.z,
        );
      } else if (
        withGravity &&
        withGravity.x !== null &&
        withGravity.y !== null &&
        withGravity.z !== null
      ) {
        const total = Math.sqrt(
          withGravity.x * withGravity.x +
            withGravity.y * withGravity.y +
            withGravity.z * withGravity.z,
        );
        delta = Math.abs(total - 9.81);
      }

      const rounded = Math.round(delta * 10) / 10;
      setMotionIntensity(rounded);

      if (delta >= WALKING_THRESHOLD) {
        setIsWalkingDetected(true);
        if (releaseTimerRef.current) {
          clearTimeout(releaseTimerRef.current);
        }
        releaseTimerRef.current = setTimeout(() => {
          setIsWalkingDetected(false);
        }, STILLNESS_RELEASE_MS);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
      }
    };
  }, [permissionGranted]);

  const releaseLock = useCallback(() => {
    setIsWalkingDetected(false);
    setSimulator('forceSafetyLock', false);
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
    }
  }, [setSimulator]);

  return {
    isSafetyLocked: simulators.forceSafetyLock || isWalkingDetected,
    isWalkingDetected,
    motionIntensity,
    needsPermission,
    requestMotionPermission,
    releaseLock,
  };
}
