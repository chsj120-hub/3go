'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SEED Design의 BottomSheet 패턴 + KRDS 접근성 표준(ESC 닫기, 48px 닫기 버튼, 고대비 헤더) 결합 컴포넌트.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-end bg-black/55 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={cn(
          'animate-slide-up max-h-[86dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* SEED 스타일 상단 드래그 핸들 */}
        <div className="mb-3 flex justify-center" aria-hidden="true">
          <span className="h-1.5 w-11 rounded-full bg-slate-300" />
        </div>

        <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            {subtitle && (
              <p className="text-xs font-bold text-[#047857]">{subtitle}</p>
            )}
            <h2 className="text-lg font-bold text-[#1D1D1D]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-bold text-[#1D1D1D] hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>닫기</span>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
