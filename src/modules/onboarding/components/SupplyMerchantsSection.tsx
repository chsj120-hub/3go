'use client';

import Link from 'next/link';
import { ArrowRight, Barcode, Store, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '../context/AppContext';
import type { HomeMerchantItem } from '../lib/home-data';

interface SupplyMerchantsSectionProps {
  merchants: HomeMerchantItem[];
}

/**
 * 골목 상권 '원정대 보급소' 상생 배너 섹션.
 * - 신규 렌탈 0원·로컬 상권 직접 환원 철학을 시각적으로 전달
 * - Neon DB `local_merchants` 테이블 연동
 */
export function SupplyMerchantsSection({
  merchants,
}: SupplyMerchantsSectionProps) {
  const { activeRegion, publishedBanners } = useAppContext();

  return (
    <section
      aria-labelledby="supply-merchants-heading"
      className="space-y-3 rounded-3xl border-2 border-slate-300 bg-white p-4 shadow-sm"
    >
      {/* 공무원 승인 완료 후 실시간 반영되는 주민 리뷰 상생 배너 */}
      {publishedBanners.length > 0 && (
        <div className="space-y-2">
          {publishedBanners.map((banner) => (
            <div
              key={banner.id}
              className="rounded-2xl border-2 border-[#246BEB] bg-blue-50/80 p-3.5"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="rounded-full bg-[#246BEB] px-2.5 py-0.5 text-white">
                  공무원 승인 상생 배너
                </span>
                <span className="text-[#1E3A8A]">{banner.merchantName}</span>
              </div>
              <p className="mt-1.5 text-base font-bold text-[#1D1D1D]">
                {banner.headline}
              </p>
              <p className="mt-0.5 text-xs text-[#555555]">
                &ldquo;{banner.reviewQuote}&rdquo; ·{' '}
                <strong className="text-[#C2410C]">{banner.discountBadge}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="orange">
          <Store className="h-4 w-4" aria-hidden="true" />
          <span>골목 상권 상생 · 원정대 보급소</span>
        </Badge>
        <span className="text-xs font-bold text-[#047857]">
          제휴 {merchants.length}곳 운영 중
        </span>
      </div>

      <div>
        <h2
          id="supply-merchants-heading"
          className="text-lg font-bold text-[#1D1D1D]"
        >
          {activeRegion.shortName} 동네네컷 완주하고
          <br />
          골목 상점 할인 쿠폰 받으세요
        </h2>
        <p className="mt-1 text-sm text-[#555555]">
          고비용 행사 렌탈 대신 우리 동네 카페·빵집·분식·비수기 PC방으로 혜택이
          바로 돌아갑니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {merchants.map((shop) => (
          <div
            key={shop.id}
            className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-[#1E3A8A] border border-slate-300">
                  {shop.category}
                </span>
                <h3 className="text-base font-bold text-[#1D1D1D]">
                  {shop.name}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#555555]">
                <Barcode className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{shop.barcodePrefix}</span>
              </span>
            </div>

            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C2410C]">
              <Ticket className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{shop.discountText}</span>
            </p>
            <p className="text-xs text-[#555555]">{shop.address}</p>
          </div>
        ))}
      </div>

      <Link
        href="/photospot"
        className="flex min-h-[52px] w-full items-center justify-between rounded-2xl bg-[#1E3A8A] px-4 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-950 active:scale-[0.99]"
      >
        <span>동네네컷 찍고 보급소 바코드 발급받기</span>
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
      </Link>
    </section>
  );
}
