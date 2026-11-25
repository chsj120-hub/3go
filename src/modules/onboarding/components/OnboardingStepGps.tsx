'use client';

import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  MapPin,
  Navigation,
  ShieldAlert,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import {
  calculateDistanceMeters,
  findMatchedRegion,
} from '@/config/region.config';
import { useAppContext } from '../context/AppContext';

interface OnboardingStepGpsProps {
  selectedProviderLabel: string;
  onNext: () => void;
  onBack: () => void;
}

type GpsStatus =
  | { state: 'IDLE' }
  | { state: 'LOADING' }
  | { state: 'VERIFIED'; message: string; distanceMeters: number }
  | { state: 'OUT_OF_RANGE'; message: string };

/**
 * 온보딩 2단계: GPS 1.5km 생활권 동네 인증.
 * - 실제 브라우저 Geolocation API + region.config.ts Haversine 반경 판정
 * - 발표장·PC 환경에서도 막히지 않는 [가상 GPS 즉시 인증] 버튼 병행 제공
 */
export function OnboardingStepGps({
  selectedProviderLabel,
  onNext,
  onBack,
}: OnboardingStepGpsProps) {
  const { activeRegion, setActiveRegionId, setSimulator } = useAppContext();
  const [status, setStatus] = useState<GpsStatus>({ state: 'IDLE' });

  const handleRealGeolocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus({
        state: 'OUT_OF_RANGE',
        message:
          '현재 브라우저에서 위치(GPS) 기능을 지원하지 않습니다. 아래 가상 GPS 버튼을 이용해 주세요.',
      });
      return;
    }

    setStatus({ state: 'LOADING' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const matched = findMatchedRegion(latitude, longitude);

        if (matched) {
          setActiveRegionId(matched.region.regionId);
          setSimulator('virtualGpsArrived', true);
          setStatus({
            state: 'VERIFIED',
            distanceMeters: matched.distanceMeters,
            message: `${matched.region.displayName} 생활권 인증 완료! (중심에서 약 ${matched.distanceMeters}m)`,
          });
          return;
        }

        const distance = calculateDistanceMeters(
          latitude,
          longitude,
          activeRegion.center.lat,
          activeRegion.center.lng,
        );
        const kmText = (distance / 1000).toFixed(1);
        setStatus({
          state: 'OUT_OF_RANGE',
          message: `현재 위치는 ${activeRegion.shortName} 중심에서 약 ${kmText}km 떨어져 있습니다(반경 ${activeRegion.radiusKm}km 초과). 시연을 위해 아래 [가상 GPS 인증]을 눌러주세요.`,
        });
      },
      () => {
        setStatus({
          state: 'OUT_OF_RANGE',
          message:
            '위치 권한이 거부되었거나 실내 GPS 신호가 약합니다. 아래 [가상 GPS 인증]으로 즉시 체험할 수 있습니다.',
        });
      },
      { enableHighAccuracy: false, timeout: 6000 },
    );
  };

  const handleVirtualGps = () => {
    setSimulator('virtualGpsArrived', true);
    setStatus({
      state: 'VERIFIED',
      distanceMeters: 120,
      message: `${activeRegion.displayName} 가상 GPS 도착 인증 완료! (${activeRegion.center.landmarkName} 인근 120m)`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#047857]">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{selectedProviderLabel} 완료 · 1.5km 생활권 확인</span>
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#1D1D1D]">
          {activeRegion.displayName} 반경 {activeRegion.radiusKm}km
          <br />
          동네 인증을 진행해 주세요
        </h3>
        <p className="mt-1 text-sm text-[#555555]">
          실제 거주·생활 이웃끼리만 안심하고 소통할 수 있도록 위치 좌표를
          서버에 저장하지 않고 반경 여부만 확인합니다.
        </p>
      </div>

      {/* 인증 결과 피드백 영역 */}
      {status.state === 'VERIFIED' && (
        <div className="flex items-start gap-2.5 rounded-2xl border-2 border-[#047857] bg-emerald-50 p-3.5 text-sm font-bold text-[#065F46]">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#047857]" aria-hidden="true" />
          <span>{status.message}</span>
        </div>
      )}

      {status.state === 'OUT_OF_RANGE' && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-400 bg-amber-50 p-3.5 text-sm font-bold text-amber-950">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
          <span>{status.message}</span>
        </div>
      )}

      {/* 실제 Geolocation + 가상 GPS 버튼 */}
      <div className="space-y-2.5">
        <ActionButton
          tone="krds"
          fullWidth
          loading={status.state === 'LOADING'}
          leadingIcon={<Compass className="h-5 w-5" aria-hidden="true" />}
          onClick={handleRealGeolocation}
        >
          실제 내 위치(GPS)로 1.5km 인증하기
        </ActionButton>

        <ActionButton
          tone="stage1"
          fullWidth
          leadingIcon={<Navigation className="h-5 w-5" aria-hidden="true" />}
          onClick={handleVirtualGps}
        >
          가상 GPS 인증 ({activeRegion.shortName} 도착)
        </ActionButton>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-[#1D1D1D] hover:bg-slate-50"
        >
          이전 단계
        </button>

        <ActionButton
          tone={status.state === 'VERIFIED' ? 'krds' : 'outline'}
          onClick={onNext}
        >
          <span>{status.state === 'VERIFIED' ? '다음: 신뢰 사다리 보기' : '건너뛰고 안내 보기'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ActionButton>
      </div>
    </div>
  );
}
