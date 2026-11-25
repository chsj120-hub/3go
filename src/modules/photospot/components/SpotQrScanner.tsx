'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Compass,
  Database,
  MapPin,
  Navigation,
  QrCode,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { calculateDistanceMeters } from '@/config/region.config';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { POSE_MISSION_LABELS, type PhotoSpotItem } from '../types';
import { cn } from '@/lib/utils';

/** 스팟 현장 도착 인정 반경 (m) */
const SPOT_ARRIVAL_RADIUS_M = 150;

interface SpotQrScannerProps {
  spots: PhotoSpotItem[];
  dataSource: 'NEON_DB' | 'DEMO_SNAPSHOT';
  activeSpotId: string;
  verifiedSpotIds: Record<string, boolean>;
  onSelectSpot: (spotId: string) => void;
  onSpotVerified: (spot: PhotoSpotItem, method: 'QR' | 'GPS') => void;
  onNotify: (message: string) => void;
}

interface QrScannerHandle {
  stop: () => Promise<void>;
  clear: () => void;
}

/**
 * 동네네컷 3스팟 코스 선택 + Geolocation 거리 계산 + html5-qrcode 스캔 UI.
 * - 데모 스위처의 [가상 GPS 도착] 활성화 시 즉시 스팟 인증 통과
 */
export function SpotQrScanner({
  spots,
  dataSource,
  activeSpotId,
  verifiedSpotIds,
  onSelectSpot,
  onSpotVerified,
  onNotify,
}: SpotQrScannerProps) {
  const { simulators } = useAppContext();
  const qrRegionId = `qr-reader-${useId().replace(/:/g, '')}`;
  const scannerRef = useRef<QrScannerHandle | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [isLocating, setIsLocating] = useState(false);

  const activeSpot = spots.find((s) => s.id === activeSpotId) ?? spots[0];

  const stopScanner = useCallback(async () => {
    const instance = scannerRef.current;
    scannerRef.current = null;
    setIsScanning(false);
    if (!instance) return;
    try {
      await instance.stop();
      instance.clear();
    } catch {
      // 이미 정지된 스캐너 정리 무시
    }
  }, []);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const handleMeasureDistance = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      onNotify('이 브라우저는 GPS 측정을 지원하지 않습니다. 시연 모드의 가상 GPS를 이용해 주세요.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setIsLocating(false);

        const dist = calculateDistanceMeters(
          coords.lat,
          coords.lng,
          activeSpot.lat,
          activeSpot.lng,
        );
        if (dist <= SPOT_ARRIVAL_RADIUS_M) {
          onSpotVerified(activeSpot, 'GPS');
        } else {
          onNotify(
            `'${activeSpot.spotName}'까지 약 ${dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`} 남았습니다.`,
          );
        }
      },
      () => {
        setIsLocating(false);
        onNotify(
          '위치 권한이 거부되었습니다. [🎭 시연 모드]의 [가상 GPS 도착]을 켜면 즉시 인증됩니다.',
        );
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  const handleStartQrScan = async () => {
    setScanError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      setIsScanning(true);

      // DOM에 뷰포트가 마운트된 직후 스캐너 바인딩
      await new Promise((resolve) => setTimeout(resolve, 60));

      const scanner = new Html5Qrcode(qrRegionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          const matchedSpot =
            spots.find((s) => s.qrCodeKey === decodedText.trim()) ?? null;

          if (matchedSpot) {
            onSelectSpot(matchedSpot.id);
            onSpotVerified(matchedSpot, 'QR');
            void stopScanner();
          } else {
            onNotify(`인식된 QR(${decodedText})이 스팟 코드와 다릅니다.`);
          }
        },
        () => {
          // 프레임 탐색 중 미인식 콜백은 무시
        },
      );
    } catch {
      setIsScanning(false);
      setScanError(
        '카메라를 열 수 없습니다(권한 미허용 또는 PC 웹캠 없음). 아래 [데모 QR 즉시 스캔]이나 [가상 GPS 도착]을 이용해 주세요.',
      );
    }
  };

  const getDistanceLabel = (spot: PhotoSpotItem): string => {
    if (simulators.virtualGpsArrived) {
      return '가상 GPS 도착 (12m · 인증 통과)';
    }
    if (!userCoords) {
      return '거리 측정 전';
    }
    const dist = calculateDistanceMeters(
      userCoords.lat,
      userCoords.lng,
      spot.lat,
      spot.lng,
    );
    return dist >= 1000
      ? `약 ${(dist / 1000).toFixed(1)}km`
      : `약 ${dist}m${dist <= SPOT_ARRIVAL_RADIUS_M ? ' · 도착' : ''}`;
  };

  const isSpotVerified = (spotId: string) =>
    Boolean(verifiedSpotIds[spotId]) || simulators.virtualGpsArrived;

  return (
    <section
      aria-labelledby="spot-qr-scanner-heading"
      className="space-y-3.5 rounded-3xl border-2 border-slate-300 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-bold text-[#555555]">
            <Database className="h-3 w-3 text-[#246BEB]" aria-hidden="true" />
            <span>
              {dataSource === 'NEON_DB'
                ? 'photo_spots Neon DB 연동'
                : 'photo_spots 시연 스냅샷'}
            </span>
          </span>
          <h2
            id="spot-qr-scanner-heading"
            className="mt-1 text-lg font-bold text-[#1D1D1D]"
          >
            3스팟 코스 &amp; QR·GPS 인증
          </h2>
        </div>

        <button
          type="button"
          onClick={handleMeasureDistance}
          disabled={isLocating}
          className="inline-flex min-h-12 items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-[#1D1D1D] hover:bg-slate-50 disabled:opacity-60"
        >
          <Compass className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
          <span>{isLocating ? '측정 중...' : 'GPS 거리 측정'}</span>
        </button>
      </div>

      {/* 가상 GPS 도착 즉시 인증 배너 */}
      {simulators.virtualGpsArrived && (
        <div className="flex items-center gap-2 rounded-2xl border-2 border-[#047857] bg-emerald-50 px-3.5 py-2.5 text-sm font-bold text-[#065F46]">
          <Navigation className="h-4 w-4 shrink-0 text-[#047857]" aria-hidden="true" />
          <span>가상 GPS 도착 ON — 3개 스팟 인증이 즉시 통과되었습니다!</span>
        </div>
      )}

      {/* 3스팟 코스 리스트 */}
      <div className="space-y-2">
        {spots.map((spot) => {
          const selected = spot.id === activeSpot.id;
          const verified = isSpotVerified(spot.id);
          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => onSelectSpot(spot.id)}
              className={cn(
                'flex min-h-16 w-full items-start justify-between gap-2.5 rounded-2xl border-2 p-3 text-left transition active:scale-[0.99]',
                selected
                  ? 'border-[#246BEB] bg-blue-50/70'
                  : 'border-slate-200 bg-[#F8FAFC] hover:bg-slate-100/70',
              )}
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-[#1E3A8A] px-2 py-0.5 text-[11px] font-bold text-white">
                    스팟 {spot.spotOrder}
                  </span>
                  <span className="text-xs font-bold text-[#246BEB]">
                    {POSE_MISSION_LABELS[spot.poseMissionType]}
                  </span>
                </div>
                <p className="truncate text-base font-bold text-[#1D1D1D]">
                  {spot.spotName}
                </p>
                <p className="flex items-center gap-1 text-xs font-bold text-[#555555]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{getDistanceLabel(spot)}</span>
                </p>
              </div>

              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                  verified
                    ? 'bg-[#047857] text-white'
                    : 'border border-slate-300 bg-white text-[#555555]',
                )}
              >
                {verified ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>인증 완료</span>
                  </>
                ) : (
                  <span>인증 필요</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* html5-qrcode 스캔 영역 */}
      <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="inline-flex items-center gap-1 text-[#1D1D1D]">
            <QrCode className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
            <span>현장 안내판 QR 스캔 ({activeSpot.qrCodeKey})</span>
          </span>
        </div>

        {isScanning && (
          <div
            id={qrRegionId}
            className="overflow-hidden rounded-xl border-2 border-[#246BEB] bg-black"
          />
        )}

        {scanError && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-xs font-bold text-amber-950">
            {scanError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {isScanning ? (
            <ActionButton
              tone="outline"
              fullWidth
              leadingIcon={<CameraOff className="h-5 w-5" aria-hidden="true" />}
              onClick={() => void stopScanner()}
            >
              QR 스캔 중지
            </ActionButton>
          ) : (
            <ActionButton
              tone="krds"
              fullWidth
              leadingIcon={<Camera className="h-5 w-5" aria-hidden="true" />}
              onClick={() => void handleStartQrScan()}
            >
              QR 카메라 스캔
            </ActionButton>
          )}

          <ActionButton
            tone="stage1"
            fullWidth
            leadingIcon={<QrCode className="h-5 w-5" aria-hidden="true" />}
            onClick={() => onSpotVerified(activeSpot, 'QR')}
          >
            데모 QR 즉시 인증
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
