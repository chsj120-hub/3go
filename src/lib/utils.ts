import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind CSS 클래스명을 충돌 없이 안전하게 병합합니다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
