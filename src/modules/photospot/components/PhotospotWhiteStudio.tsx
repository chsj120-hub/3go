'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  Camera,
  Clock,
  Footprints,
  Heart,
  Lock,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { PublicDataStatusChip } from '@/components/layout/PublicDataStatusChip';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { ChipTabs } from '@/components/ui/chip-tabs';
import { Snackbar } from '@/components/ui/snackbar';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import type { CouponWalletItem } from '@/app/api/photospot/quest-log/route';
import type {
  FourCutRenderResult,
  MerchantCouponInfo,
} from '../FourCutCanvasRenderer';
import { PoseCameraEngine } from '../PoseCameraEngine';
import { useSafetyLock } from '../hooks/useSafetyLock';
import { POSE_MISSION_LABELS, type PhotoSpotItem } from '../types';
import { CouponWallet } from './CouponWallet';
import { FourCutResultModal } from './FourCutResultModal';
import { SafetyLockOverlay } from './SafetyLockOverlay';
import { SpotQrScanner } from './SpotQrScanner';
import { cn } from '@/lib/utils';

type PhotospotTab = 'STUDIO' | 'WALLET';

interface PhotospotWhiteStudioProps {
  spots: PhotoSpotItem[];
  dataSource: 'NEON_DB' | 'DEMO_SNAPSHOT';
}

const SPOT_MERCHANTS: MerchantCouponInfo[] = [
  {
    id: 'merchant-cheomdan-01',
    name: '쌍암 호수로스터스',
    discountText: '전 음료 1,000원 즉시 할인',
    barcodePrefix: '3GO-CHD01',
  },
  {
    id: 'merchant-cheomdan-02',
    name: '월계 수제식빵공방',
    discountText: '5,000원 이상 구매 시 단팥빵 1개 증정',
    barcodePrefix: '3GO-CHD02',
  },
  {
    id: 'merchant-cheomdan-03',
    name: '첨단 추억의 떡볶이',
    discountText: '세트 메뉴 15% 할인 (포장 가능)',
    barcodePrefix: '3GO-CHD03',
  },
];

/**
 * 동네네컷 원정대 메인 화면 (/photospot).
 * - 탭 1: 안전 산책 모드 + 3스팟 QR/GPS 스캐너 + MediaPipe PoseCameraEngine + Canvas 합성
 * - 탭 2: 내 원정대 보급소 쿠폰함 (바코드 제시 + [사용 완료 처리])
 */
export function PhotospotWhiteStudio({
  spots,
  dataSource,
}: PhotospotWhiteStudioProps) {
  const { currentUser, activeRegion, simulators, setSimulator } =
    useAppContext();
  const safety = useSafetyLock();

  const [tab, setTab] = useState<PhotospotTab>('STUDIO');
  const [activeSpotId, setActiveSpotId] = useState<string>(spots[0]?.id ?? '');
  const [verifiedSpotIds, setVerifiedSpotIds] = useState<
    Record<string, boolean>
  >({});
  const [dippedIds, setDippedIds] = useState<Record<string, boolean>>({});
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [composedResult, setComposedResult] =
    useState<FourCutRenderResult | null>(null);
  const [coupons, setCoupons] = useState<CouponWalletItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // 현재 사용자의 발급 쿠폰 목록 로드 (Neon DB photo_quest_logs + 스냅샷 폴백)
  useEffect(() => {
    let active = true;
    fetch(`/api/photospot/quest-log?userId=${encodeURIComponent(currentUser.id)}`)
      .then((res) => res.json())
      .then((json: { ok?: boolean; coupons?: CouponWalletItem[] }) => {
        if (active && json.ok && Array.isArray(json.coupons)) {
          setCoupons(json.coupons);
        }
      })
      .catch(() => {
        // 오프라인 시 기존 메모리 목록 유지
      });
    return () => {
      active = false;
    };
  }, [currentUser.id]);

  const activeSpot = spots.find((s) => s.id === activeSpotId) ?? spots[0];
  const activeMerchant =
    SPOT_MERCHANTS[(activeSpot.spotOrder - 1) % SPOT_MERCHANTS.length];
  const isActiveSpotVerified =
    Boolean(verifiedSpotIds[activeSpot.id]) || simulators.virtualGpsArrived;
  const isDipped = Boolean(dippedIds[activeSpot.id]);
  const canStartCapture = !safety.isSafetyLocked && isActiveSpotVerified;

  const handleSpotVerified = (spot: PhotoSpotItem, method: 'QR' | 'GPS') => {
    setVerifiedSpotIds((prev) => ({ ...prev, [spot.id]: true }));
    setToast(
      `'${spot.spotName}' ${method === 'QR' ? 'QR 코드' : 'GPS 반경'} 인증 완료! 이제 촬영할 수 있습니다.`,
    );
  };

  const handleToggleDip = () => {
    setDippedIds((prev) => ({ ...prev, [activeSpot.id]: !prev[activeSpot.id] }));
    setToast(
      isDipped
        ? `'${activeSpot.spotName}' 띱 선택을 취소했습니다.`
        : `'${activeSpot.spotName}' 베스트 컷으로 띱! (동네네컷 반영)`,
    );
  };

  return (
    <div className="space-y-4">
      {/* 공공데이터 실시간/스냅샷 연동 상태 칩 */}
      <PublicDataStatusChip />

      {/* 상단 배지 & D-7 보급소 쿠폰 타이머 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="navy">
          <Camera className="h-4 w-4" aria-hidden="true" />
          <span>안전 산책 모드 · 화이트 스튜디오</span>
        </Badge>
        <span className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs font-bold text-[#9A3412]">
          <Clock className="h-3.5 w-3.5 text-[#C2410C]" aria-hidden="true" />
          <span>보급소 쿠폰 D-7</span>
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1D]">동네네컷 원정대</h1>
        <p className="mt-1 text-sm text-[#555555]">
          카메라 영상·포즈 좌표는 서버 전송 없이 브라우저 안에서만 처리됩니다.
        </p>
      </div>

      {/* 스튜디오 / 내 보급소 쿠폰함 전환 탭 */}
      <ChipTabs<PhotospotTab>
        ariaLabel="동네네컷 기능 전환"
        tone="krds"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'STUDIO', label: '스팟 촬영 스튜디오' },
          {
            value: 'WALLET',
            label: '내 보급소 쿠폰함',
            badgeText: String(coupons.filter((c) => !c.isCouponUsed).length),
          },
        ]}
      />

      {tab === 'WALLET' ? (
        <CouponWallet
          coupons={coupons}
          onCouponUsed={(id) =>
            setCoupons((prev) =>
              prev.map((c) => (c.id === id ? { ...c, isCouponUsed: true } : c)),
            )
          }
          onNotify={setToast}
        />
      ) : (
        <>
          {/* 1. 안전 산책 모드 상태 */}
          <section className="space-y-2.5 rounded-2xl border border-slate-300 bg-white p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#047857]">
                <Activity className="h-4 w-4" aria-hidden="true" />
                <span>
                  보행 안전 감지:{' '}
                  {safety.isSafetyLocked
                    ? '잠금 작동 중'
                    : `정지 안정 (${safety.motionIntensity.toFixed(1)} m/s²)`}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setSimulator('forceSafetyLock', true)}
                className="inline-flex min-h-12 items-center gap-1 rounded-xl border-2 border-[#C2410C] bg-orange-50 px-3 text-xs font-bold text-[#9A3412] hover:bg-orange-100"
              >
                <Footprints className="h-4 w-4" aria-hidden="true" />
                <span>보행 감지 테스트</span>
              </button>
            </div>

            {safety.needsPermission && (
              <ActionButton
                tone="outline"
                fullWidth
                onClick={() => void safety.requestMotionPermission()}
              >
                모션(가속도) 센서 권한 허용하기
              </ActionButton>
            )}
          </section>

          {/* 2. photo_spots 3스팟 코스 & QR·GPS 인증 */}
          <SpotQrScanner
            spots={spots}
            dataSource={dataSource}
            activeSpotId={activeSpot.id}
            verifiedSpotIds={verifiedSpotIds}
            onSelectSpot={setActiveSpotId}
            onSpotVerified={handleSpotVerified}
            onNotify={setToast}
          />

          {/* 3. 온디바이스 MediaPipe 2인 협동 포즈 엔진 */}
          {isCameraOpen && (
            <PoseCameraEngine
              spot={activeSpot}
              merchant={activeMerchant}
              isSafetyLocked={safety.isSafetyLocked}
              onClose={() => setIsCameraOpen(false)}
              onComposed={(result) => {
                setIsCameraOpen(false);
                setComposedResult(result);
                setToast('1080×1920 동네네컷 + 보급소 바코드 합성이 완료되었습니다!');
              }}
            />
          )}

          {/* 4. 화이트 스튜디오 4컷 프레임 & 촬영 액션 */}
          <section className="space-y-4 rounded-3xl border-2 border-slate-300 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-[#246BEB]">
                  스팟 {activeSpot.spotOrder} ·{' '}
                  {POSE_MISSION_LABELS[activeSpot.poseMissionType]}
                </p>
                <h2 className="text-lg font-bold text-[#1D1D1D]">
                  {activeSpot.spotName}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleToggleDip}
                aria-pressed={isDipped}
                className={cn(
                  'inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-xl border-2 px-3.5 text-sm font-bold transition active:scale-95',
                  isDipped
                    ? 'border-[#C2410C] bg-[#C2410C] text-white'
                    : 'border-[#C2410C] bg-white text-[#C2410C] hover:bg-orange-50',
                )}
              >
                <Heart
                  className={cn('h-4 w-4', isDipped && 'fill-current')}
                  aria-hidden="true"
                />
                <span>
                  띱! {24 + activeSpot.spotOrder * 3 + (isDipped ? 1 : 0)}
                </span>
              </button>
            </div>

            <p className="text-sm leading-relaxed text-[#555555]">
              {activeSpot.description}
            </p>

            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-[#F8FAFC] p-3">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((cut) => (
                  <div
                    key={cut}
                    className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-center"
                  >
                    <Camera className="h-5 w-5 text-[#246BEB]" aria-hidden="true" />
                    <span className="mt-1 text-xs font-bold text-[#1D1D1D]">
                      {cut}컷 프레임
                    </span>
                    <span className="text-[11px] text-[#555555]">
                      {cut === activeSpot.spotOrder
                        ? POSE_MISSION_LABELS[activeSpot.poseMissionType]
                        : '2인 협동 포즈'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-[#1E3A8A]">
                <span>{activeRegion.shortName} 보급소</span>
                <span>
                  {activeMerchant.name} · {activeMerchant.discountText}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <ActionButton
                tone={canStartCapture ? 'krds' : 'outline'}
                fullWidth
                disabled={!canStartCapture}
                leadingIcon={
                  canStartCapture ? (
                    <Camera className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Lock className="h-5 w-5" aria-hidden="true" />
                  )
                }
                onClick={() => setIsCameraOpen(true)}
              >
                {safety.isSafetyLocked
                  ? '잠시 멈춘 뒤 촬영하세요 (보행 잠금 중)'
                  : !isActiveSpotVerified
                    ? '스팟 QR·GPS 인증 후 촬영 버튼 활성화'
                    : '온디바이스 AI 네컷 촬영 시작하기'}
              </ActionButton>

              <ActionButton
                tone="outline"
                fullWidth
                leadingIcon={<QrCode className="h-5 w-5" aria-hidden="true" />}
                onClick={() =>
                  setToast(
                    '설치 없이 함께 찍는 원정대 QR 초대 링크가 복사되었습니다.',
                  )
                }
              >
                함께 걸을 이웃에게 QR 초대 링크 보내기
              </ActionButton>
            </div>

            <p className="flex items-center gap-1.5 text-xs font-bold text-[#047857]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>개인정보 유출 0% · 영상 서버 전송 없음 · Safety Lock 보호</span>
            </p>
          </section>
        </>
      )}

      {/* 합성 결과 모달 (로컬 PNG 저장 + 동네 자랑하기 동의 체크박스 + 쿠폰함 발급) */}
      {composedResult && (
        <FourCutResultModal
          result={composedResult}
          spot={activeSpot}
          merchant={activeMerchant}
          onClose={() => setComposedResult(null)}
          onRetake={() => {
            setComposedResult(null);
            setIsCameraOpen(true);
          }}
          onSavedToWallet={(newCoupon) =>
            setCoupons((prev) => [newCoupon, ...prev])
          }
          onOpenWallet={() => setTab('WALLET')}
          onNotify={setToast}
        />
      )}

      {/* DeviceMotion + 데모 스위처 통합 Safety Lock 오버레이 */}
      <SafetyLockOverlay
        isLocked={safety.isSafetyLocked}
        isWalkingDetected={safety.isWalkingDetected}
        motionIntensity={safety.motionIntensity}
        onRelease={safety.releaseLock}
      />

      <Snackbar message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
