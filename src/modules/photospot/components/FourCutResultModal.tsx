'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  RotateCcw,
  ShieldCheck,
  Ticket,
  X,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import type { CouponWalletItem } from '@/app/api/photospot/quest-log/route';
import type {
  FourCutRenderResult,
  MerchantCouponInfo,
} from '../FourCutCanvasRenderer';
import type { PhotoSpotItem } from '../types';

interface FourCutResultModalProps {
  result: FourCutRenderResult;
  spot: PhotoSpotItem;
  merchant: MerchantCouponInfo;
  onClose: () => void;
  onRetake: () => void;
  onSavedToWallet: (coupon: CouponWalletItem) => void;
  onOpenWallet: () => void;
  onNotify: (message: string) => void;
}

/**
 * HTML5 Canvas 1080×1920 네컷 + 보급소 바코드 합성 결과 모달.
 * 1) [내 기기에 저장(PNG)] 버튼 — 기본 로컬 저장 (서버 전송 0%)
 * 2) [동네 자랑하기] 동의 체크박스 분리 — 동의 시에만 DB 로그에 공유 상태 기록
 * 3) 완주 기록 및 발급 쿠폰을 Neon DB `photo_quest_logs`에 저장 후 내 쿠폰함 연동
 */
export function FourCutResultModal({
  result,
  spot,
  merchant,
  onClose,
  onRetake,
  onSavedToWallet,
  onOpenWallet,
  onNotify,
}: FourCutResultModalProps) {
  const { currentUser, activeRegion } = useAppContext();
  const [shareConsent, setShareConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const handleDownloadPng = () => {
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = `동네네컷_${activeRegion.shortName.replace(/\s+/g, '')}_${result.createdAtLabel.replace(/\./g, '')}.png`;
    link.click();
    onNotify('1080×1920 동네네컷 PNG가 내 기기에 저장되었습니다! (서버 미전송)');
  };

  const handleSaveQuestAndCoupon = async () => {
    if (hasSaved || isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/photospot/quest-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          merchantId: merchant.id,
          courseName: spot.courseName,
          stepCount: 3850,
          couponBarcode: result.couponBarcode,
          shareConsent,
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        id?: string;
        message?: string;
      };
      if (json.ok) {
        setHasSaved(true);
        onSavedToWallet({
          id: json.id ?? `quest-${Date.now()}`,
          courseName: spot.courseName,
          merchantName: merchant.name,
          discountText: merchant.discountText,
          couponBarcode: result.couponBarcode,
          isCouponUsed: false,
          isSharedToGallery: shareConsent,
          completedAt: new Date().toISOString(),
        });
        onNotify(json.message ?? '쿠폰함에 발급 및 완주 기록이 저장되었습니다!');
      } else {
        onNotify(json.message ?? '저장 중 오류가 발생했습니다.');
      }
    } catch {
      onNotify('네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fourcut-result-title"
      className="fixed inset-0 z-50 mx-auto flex max-w-[430px] items-end justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-slide-up max-h-[92dvh] w-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-[#047857]">
              온디바이스 Canvas 1080×1920 합성 완료
            </p>
            <h2
              id="fourcut-result-title"
              className="text-lg font-bold text-[#1D1D1D]"
            >
              동네네컷 &amp; 보급소 할인 쿠폰
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-[#1D1D1D] hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>닫기</span>
          </button>
        </div>

        {/* 합성된 1080×1920 네컷 프리뷰 */}
        <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-[#F8FAFC] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.dataUrl}
            alt="합성된 동네네컷 포토카드 및 원정대 보급소 할인 바코드"
            className="mx-auto max-h-[340px] w-auto rounded-xl object-contain shadow-sm"
          />
        </div>

        {/* 발급 바코드 요약 */}
        <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-3 text-xs">
          <p className="inline-flex items-center gap-1 font-bold text-[#1E3A8A]">
            <Ticket className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
            <span>
              {merchant.name} · {merchant.discountText}
            </span>
          </p>
          <p className="mt-1 font-mono font-bold text-[#1D1D1D]">
            바코드: {result.couponBarcode}
          </p>
        </div>

        {/* [동네 자랑하기] 명시적 동의 체크박스 (기본 로컬 저장과 분리) */}
        <label className="mt-3 flex min-h-12 cursor-pointer items-start gap-2.5 rounded-2xl border-2 border-slate-200 bg-[#F8FAFC] p-3 text-xs">
          <input
            type="checkbox"
            checked={shareConsent}
            disabled={hasSaved}
            onChange={(e) => setShareConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#246BEB]"
          />
          <span>
            <strong className="block text-sm font-bold text-[#1D1D1D]">
              [동네 자랑하기] 마을 갤러리 공유 동의 (선택)
            </strong>
            <span className="text-[#555555]">
              체크한 경우에만 DB 완주 로그에 공개 공유 상태가 기록됩니다.
              미체크 시 쿠폰만 비공개로 발급됩니다.
            </span>
          </span>
        </label>

        {/* 버튼 영역: 로컬 PNG 저장 / DB 쿠폰함 저장 / 쿠폰함 이동 */}
        <div className="mt-4 space-y-2">
          <ActionButton
            tone="krds"
            fullWidth
            leadingIcon={<Download className="h-5 w-5" aria-hidden="true" />}
            onClick={handleDownloadPng}
          >
            내 기기에 저장 (PNG · 로컬 전용)
          </ActionButton>

          {!hasSaved ? (
            <ActionButton
              tone="stage1"
              fullWidth
              loading={isSaving}
              leadingIcon={<Ticket className="h-5 w-5" aria-hidden="true" />}
              onClick={() => void handleSaveQuestAndCoupon()}
            >
              {shareConsent
                ? '쿠폰함 저장 + 동네 자랑하기 등록'
                : '완주 기록 & 내 쿠폰함에 쿠폰 담기'}
            </ActionButton>
          ) : (
            <ActionButton
              tone="stage3"
              fullWidth
              leadingIcon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
              onClick={() => {
                onClose();
                onOpenWallet();
              }}
            >
              내 쿠폰함에서 바코드 제시 · 사용 처리하기
            </ActionButton>
          )}

          <button
            type="button"
            onClick={onRetake}
            className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-[#1D1D1D] hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>다시 촬영하기</span>
          </button>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[#555555]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#047857]" aria-hidden="true" />
          <span>개인정보 보호: 사진 원본은 서버로 업로드되지 않습니다.</span>
        </p>
      </div>
    </div>
  );
}
