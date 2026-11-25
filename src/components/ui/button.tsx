import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * KRDS(48px+ 높이, 17px Bold, WCAG AA 4.5:1+ 명도 대비) 준수 기본 버튼 컴포넌트.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[1rem] font-bold transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#246BEB] text-white hover:bg-[#1D56BC] shadow-sm',
        krds: 'bg-[#246BEB] text-white hover:bg-[#1D56BC] shadow-sm',
        emerald: 'bg-[#047857] text-white hover:bg-emerald-800 shadow-sm',
        orange: 'bg-[#C2410C] text-white hover:bg-orange-800 shadow-sm',
        navy: 'bg-[#1E3A8A] text-white hover:bg-blue-950 shadow-sm',
        secondary: 'bg-slate-100 text-[#1D1D1D] border border-slate-300 hover:bg-slate-200',
        outline: 'border-2 border-slate-400 bg-white text-[#1D1D1D] hover:bg-slate-50',
        ghost: 'hover:bg-slate-100 text-[#1D1D1D]',
        destructive: 'bg-[#B91C1C] text-white hover:bg-red-800',
      },
      size: {
        default: 'min-h-12 px-5 py-3',
        sm: 'min-h-12 px-3.5 py-2 text-sm',
        lg: 'min-h-14 px-6 py-3.5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
