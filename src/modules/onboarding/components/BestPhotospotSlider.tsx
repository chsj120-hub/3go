'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Camera, Clock, Heart, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '@/lib/utils';

interface BestCutItem {
  id: string;
  spotName: string;
  poseLabel: string;
  teamNickname: string;
  merchantCoupon: string;
  dipCount: number;
  cuts: [string, string, string, string];
}

const BEST_PHOTOSPOT_ITEMS: BestCutItem[] = [
  {
    id: 'best-01',
    spotName: '쌍암공원 호수 산책로',
    poseLabel: '2인 스트레칭 포즈',
    teamNickname: '첨단동 맥가이버 × 꼬마대장',
    merchantCoupon: '쌍암 호수로스터스 1,000원 할인',
    dipCount: 34,
    cuts: ['준비 찰칵', '양팔 쭉!', '호수 배경', '완주 성공'],
  },
  {
    id: 'best-02',
    spotName: '응암공원 숲길 쉼터',
    poseLabel: '머리 위 큰 하트',
    teamNickname: '월계동 바둑선생 × 지스트청년',
    merchantCoupon: '월계 수제식빵공방 단팥빵 증정',
    dipCount: 41,
    cuts: ['숲길 출발', '큰 하트!', '세대 브이', '보급소 겟'],
  },
  {
    id: 'best-03',
    spotName: '첨단생활체육공원 강변길',
    poseLabel: '이웃과 하이파이브',
    teamNickname: '산월동 러너 × 쌍암 산책러',
    merchantCoupon: '첨단 추억의 떡볶이 15% 할인',
    dipCount: 28,
    cuts: ['영산강 뷰', '하이파이브', '활짝 웃음', '네컷 완성'],
  },
];

interface BestPhotospotSliderProps {
  onNotify: (message: string) => void;
}

/**
 * 홈 대시보드 베스트 동네네컷 가로 슬라이더.
 * 친근한 화이트 포토 스튜디오 프레임 + 치이이즈 '띱!' 투표 UX + 시안 A KRDS 고대비 준수.
 */
export function BestPhotospotSlider({ onNotify }: BestPhotospotSliderProps) {
  const { activeRegion } = useAppContext();
  const [dippedIds, setDippedIds] = useState<Record<string, boolean>>({});

  const handleToggleDip = (item: BestCutItem) => {
    const next = !dippedIds[item.id];
    setDippedIds((prev) => ({ ...prev, [item.id]: next }));
    onNotify(
      next
        ? `'${item.spotName}' 베스트 컷에 띱! (함께 갤러리 응원)`
        : `'${item.spotName}' 띱 응원을 취소했습니다.`,
    );
  };

  return (
    <section aria-labelledby="best-photospot-heading" className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-[#246BEB]">
            {activeRegion.shortName} 이웃들의 화이트 스튜디오
          </p>
          <h2
            id="best-photospot-heading"
            className="text-lg font-bold text-[#1D1D1D]"
          >
            베스트 동네네컷
          </h2>
        </div>

        <Link
          href="/photospot"
          className="inline-flex min-h-12 items-center gap-1 rounded-xl px-2.5 text-sm font-bold text-[#246BEB] hover:bg-blue-50"
        >
          <span>촬영하러 가기</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* 가로 스냅 슬라이더 */}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
        {BEST_PHOTOSPOT_ITEMS.map((item) => {
          const isDipped = Boolean(dippedIds[item.id]);
          return (
            <article
              key={item.id}
              className="w-[272px] shrink-0 snap-start rounded-2xl border border-slate-300 bg-white p-3.5 shadow-sm"
            >
              <div className="mb-2.5 flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A]">
                  <Sparkles className="h-3 w-3 text-[#246BEB]" aria-hidden="true" />
                  <span>{item.poseLabel}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9A3412]">
                  <Clock className="h-3 w-3 text-[#C2410C]" aria-hidden="true" />
                  <span>D-7</span>
                </span>
              </div>

              {/* 미니 2×2 화이트 스튜디오 네컷 프리뷰 */}
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-dashed border-blue-200 bg-[#F8FAFC] p-2">
                {item.cuts.map((label, idx) => (
                  <div
                    key={label}
                    className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-center"
                  >
                    <Camera className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
                    <span className="mt-1 text-[11px] font-bold text-[#1D1D1D]">
                      {idx + 1}컷 · {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-1">
                <h3 className="truncate text-base font-bold text-[#1D1D1D]">
                  {item.spotName}
                </h3>
                <p className="truncate text-xs font-bold text-[#555555]">
                  {item.teamNickname}
                </p>
                <p className="truncate text-xs font-bold text-[#047857]">
                  🎁 {item.merchantCoupon}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleDip(item)}
                  aria-pressed={isDipped}
                  className={cn(
                    'inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 px-3 text-sm font-bold transition active:scale-95',
                    isDipped
                      ? 'border-[#C2410C] bg-[#C2410C] text-white'
                      : 'border-[#C2410C] bg-white text-[#C2410C] hover:bg-orange-50',
                  )}
                >
                  <Heart
                    className={cn('h-4 w-4', isDipped && 'fill-current')}
                    aria-hidden="true"
                  />
                  <span>띱! {item.dipCount + (isDipped ? 1 : 0)}</span>
                </button>

                <Link
                  href="/photospot"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#246BEB] px-3 text-xs font-bold text-white hover:bg-[#1D56BC]"
                >
                  따라 찍기
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
