'use client';

import { useState } from 'react';
import {
  Barcode,
  CheckCircle2,
  Clock,
  Share2,
  Store,
  Ticket,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { cn } from '@/lib/utils';
import type { CouponWalletItem } from '@/app/api/photospot/quest-log/route';

interface CouponWalletProps {
  coupons: CouponWalletItem[];
  onCouponUsed: (id: string) => void;
  onNotify: (message: string) => void;
}

/** 바코드 문자열을 선명한 SVG 1D 바코드로 렌더링합니다. */
function BarcodeGraphic({ code }: { code: string }) {
  const bars: Array<{ x: number; w: number }> = [];
  let cursor = 8;
  for (let i = 0; i < 48; i += 1) {
    const ch = code.charCodeAt(i % code.length);
    const w = (ch + i * 7) % 3 === 0 ? 4 : 2;
    const gap = (ch + i * 3) % 2 === 0 ? 2 : 3;
    if (cursor + w > 292) break;
    bars.push({ x: cursor, w });
    cursor += w + gap;
  }

  return (
    <svg
      viewBox="0 0 300 68"
      className="mx-auto h-16 w-full max-w-[280px]"
      role="img"
      aria-label={`쿠폰 바코드 ${code}`}
    >
      <rect width="300" height="68" rx="8" fill="#FFFFFF" />
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={8}
          width={bar.w}
          height={52}
          fill="#1D1D1D"
        />
      ))}
    </svg>
  );
}

/**
 * 내 원정대 보급소 쿠폰함.
 * - Neon DB `photo_quest_logs` 완주 기록 및 발급 쿠폰 목록 표시
 * - 상점 직원에게 바코드 제시 + [사용 완료 처리] (PATCH /api/photospot/quest-log) 시연
 */
export function CouponWallet({
  coupons,
  onCouponUsed,
  onNotify,
}: CouponWalletProps) {
  const [selectedId, setSelectedId] = useState<string>(coupons[0]?.id ?? '');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleMarkUsed = async (coupon: CouponWalletItem) => {
    if (coupon.isCouponUsed || updatingId) return;
    setUpdatingId(coupon.id);
    try {
      const response = await fetch('/api/photospot/quest-log', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coupon.id,
          couponBarcode: coupon.couponBarcode,
          isCouponUsed: true,
        }),
      });
      const json = (await response.json()) as { ok?: boolean; message?: string };
      if (json.ok) {
        onCouponUsed(coupon.id);
        onNotify(json.message ?? '보급소 쿠폰이 사용 완료 처리되었습니다.');
      } else {
        onNotify(json.message ?? '쿠폰 사용 처리 중 오류가 발생했습니다.');
      }
    } catch {
      onNotify('네트워크 연결을 확인해 주세요.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (coupons.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-6 text-center">
        <Ticket className="mx-auto h-10 w-10 text-[#246BEB]" aria-hidden="true" />
        <p className="mt-2 text-base font-bold text-[#1D1D1D]">
          아직 발급된 보급소 쿠폰이 없습니다
        </p>
        <p className="mt-1 text-sm text-[#555555]">
          동네네컷 4컷 촬영을 완료하면 골목 상점 할인 바코드가 자동으로
          담깁니다.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="내 원정대 보급소 쿠폰함" className="space-y-3">
      {coupons.map((coupon) => {
        const isExpanded = selectedId === coupon.id;
        return (
          <article
            key={coupon.id}
            className={cn(
              'overflow-hidden rounded-3xl border-2 bg-white shadow-sm transition',
              coupon.isCouponUsed
                ? 'border-slate-200 opacity-80'
                : isExpanded
                  ? 'border-[#246BEB]'
                  : 'border-slate-300',
            )}
          >
            <button
              type="button"
              onClick={() =>
                setSelectedId(isExpanded ? '' : coupon.id)
              }
              aria-expanded={isExpanded}
              className="flex min-h-16 w-full items-start justify-between gap-2 p-4 text-left"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
                      coupon.isCouponUsed
                        ? 'bg-slate-200 text-[#555555]'
                        : 'bg-[#047857] text-white',
                    )}
                  >
                    {coupon.isCouponUsed ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>사용 완료</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>사용 가능 · D-7</span>
                      </>
                    )}
                  </span>

                  {coupon.isSharedToGallery && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1E3A8A]">
                      <Share2 className="h-3 w-3" aria-hidden="true" />
                      <span>동네 자랑 등록</span>
                    </span>
                  )}
                </div>

                <h3 className="flex items-center gap-1.5 text-base font-bold text-[#1D1D1D]">
                  <Store className="h-4 w-4 shrink-0 text-[#246BEB]" aria-hidden="true" />
                  <span className="truncate">{coupon.merchantName}</span>
                </h3>
                <p className="text-sm font-bold text-[#C2410C]">
                  {coupon.discountText}
                </p>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-300 bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-bold text-[#1D1D1D]">
                <Barcode className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
                <span>{isExpanded ? '접기' : '바코드'}</span>
              </span>
            </button>

            {isExpanded && (
              <div className="space-y-3 border-t border-slate-200 bg-[#F8FAFC] p-4">
                <p className="text-center text-xs font-bold text-[#555555]">
                  보급소 사장님께 아래 바코드를 보여주세요
                </p>

                <div className="rounded-2xl border border-slate-300 bg-white p-3 text-center">
                  <BarcodeGraphic code={coupon.couponBarcode} />
                  <p className="mt-1.5 font-mono text-sm font-bold tracking-wider text-[#1D1D1D]">
                    {coupon.couponBarcode}
                  </p>
                </div>

                <ActionButton
                  tone={coupon.isCouponUsed ? 'outline' : 'stage2'}
                  fullWidth
                  disabled={coupon.isCouponUsed}
                  loading={updatingId === coupon.id}
                  leadingIcon={
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  }
                  onClick={() => void handleMarkUsed(coupon)}
                >
                  {coupon.isCouponUsed
                    ? '이미 사용 완료된 쿠폰입니다'
                    : '직원 확인 · 사용 완료 처리'}
                </ActionButton>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
