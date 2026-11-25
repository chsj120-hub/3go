'use client';

import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface SnackbarProps {
  message: string | null;
  onClose: () => void;
}

/**
 * SEED Design의 Snackbar 패턴 + KRDS 접근성(aria-live="polite", 고대비 닫기 버튼).
 */
export function Snackbar({ message, onClose }: SnackbarProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center justify-between gap-2 rounded-2xl bg-[#1D1D1D] px-4 py-3 text-sm font-bold text-white shadow-xl"
    >
      <div className="flex items-center gap-2">
        <CheckCircle2
          className="h-5 w-5 shrink-0 text-emerald-400"
          aria-hidden="true"
        />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg bg-white/15 px-2.5 text-xs font-bold text-white hover:bg-white/25"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        <span>닫기</span>
      </button>
    </div>
  );
}
