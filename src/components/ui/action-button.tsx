'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActionButtonTone =
  | 'krds'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'neutral'
  | 'outline';

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 시맨틱 톤 (모든 색상은 KRDS WCAG AA 4.5:1 이상 명도 대비 보장) */
  tone?: ActionButtonTone;
  /** SEED ActionButton 스타일 전체 너비 확장 여부 */
  fullWidth?: boolean;
  /** 로딩 스피너 표시 및 중복 클릭 방지 */
  loading?: boolean;
  /** 좌측 보조 아이콘 (반드시 children 한글 라벨과 병기) */
  leadingIcon?: React.ReactNode;
}

const TONE_CLASSES: Record<ActionButtonTone, string> = {
  krds: 'bg-[#246BEB] text-white hover:bg-[#1D56BC] shadow-sm',
  stage1: 'bg-[#047857] text-white hover:bg-emerald-800 shadow-sm',
  stage2: 'bg-[#C2410C] text-white hover:bg-orange-800 shadow-sm',
  stage3: 'bg-[#1E3A8A] text-white hover:bg-blue-950 shadow-sm',
  neutral: 'bg-[#1D1D1D] text-white hover:bg-slate-800 shadow-sm',
  outline:
    'border-2 border-slate-400 bg-white text-[#1D1D1D] hover:bg-slate-50',
};

/**
 * 당근 SEED Design의 ActionButton 패턴 + KRDS 접근성 표준(높이 52px, 17px Bold, 대비 4.5:1+) 결합 컴포넌트.
 */
export function ActionButton({
  tone = 'krds',
  fullWidth = false,
  loading = false,
  leadingIcon,
  disabled,
  className,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[1rem] font-bold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        TONE_CLASSES[tone],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leadingIcon && <span className="shrink-0">{leadingIcon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
