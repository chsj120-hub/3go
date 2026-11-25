'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ChipTabItem<T extends string = string> {
  value: T;
  label: string;
  badgeText?: string;
}

export interface ChipTabsProps<T extends string = string> {
  items: ChipTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** 활성 칩 색상 톤 (KRDS AA 4.5:1+ 보장) */
  tone?: 'krds' | 'stage1' | 'stage2' | 'stage3' | 'dark';
  className?: string;
}

const ACTIVE_TONES = {
  krds: 'border-[#246BEB] bg-[#246BEB] text-white',
  stage1: 'border-[#047857] bg-[#047857] text-white',
  stage2: 'border-[#C2410C] bg-[#C2410C] text-white',
  stage3: 'border-[#1E3A8A] bg-[#1E3A8A] text-white',
  dark: 'border-[#1D1D1D] bg-[#1D1D1D] text-white',
};

/**
 * SEED Design의 ChipTabs 패턴 + KRDS 접근성 표준(최소 48px 높이, 고대비 선택 상태) 결합 컴포넌트.
 */
export function ChipTabs<T extends string = string>({
  items,
  value,
  onChange,
  ariaLabel,
  tone = 'krds',
  className,
}: ChipTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'no-scrollbar flex items-center gap-2 overflow-x-auto pb-1',
        className,
      )}
    >
      {items.map((item) => {
        const isSelected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors active:scale-[0.98]',
              isSelected
                ? ACTIVE_TONES[tone]
                : 'border-slate-300 bg-white text-[#1D1D1D] hover:bg-slate-50',
            )}
          >
            <span>{item.label}</span>
            {item.badgeText && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-bold',
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-[#555555]',
                )}
              >
                {item.badgeText}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
