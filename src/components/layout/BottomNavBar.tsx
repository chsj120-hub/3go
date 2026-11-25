'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Crown, Handshake, Home, Wrench } from 'lucide-react';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { isRegularOrAbove } from '@/modules/onboarding/demo-users';
import { cn } from '@/lib/utils';

interface NavTabItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isCenterAction?: boolean;
  activeColorClass: string;
  requiresRegular?: boolean;
}

const NAV_TABS: NavTabItem[] = [
  {
    href: '/',
    label: '홈',
    icon: Home,
    activeColorClass: 'text-[#246BEB]',
  },
  {
    href: '/community',
    label: '살피·인사',
    icon: Wrench,
    activeColorClass: 'text-[#047857]',
  },
  {
    href: '/photospot',
    label: '동네네컷',
    icon: Camera,
    isCenterAction: true,
    activeColorClass: 'text-[#246BEB]',
  },
  {
    href: '/care',
    label: '이어지GO',
    icon: Handshake,
    activeColorClass: 'text-[#1E3A8A]',
    requiresRegular: true,
  },
  {
    href: '/my',
    label: '마이·행정',
    icon: Crown,
    activeColorClass: 'text-slate-900',
  },
];

/**
 * 하단 5대 고정 탭바.
 * - 모든 탭 버튼 최소 높이 48px 이상 + 아이콘·한글 라벨 병기
 * - 중앙 '동네네컷' 돌출 강조 버튼
 * - 준회원(ASSOCIATE)일 경우 '이어지GO' 탭을 UI에서 완전 비노출(Blind) 처리
 */
export function BottomNavBar() {
  const pathname = usePathname();
  const { currentUser } = useAppContext();
  const canSeeCareBlind = isRegularOrAbove(currentUser.role);

  const visibleTabs = NAV_TABS.filter(
    (tab) => !tab.requiresRegular || canSeeCareBlind,
  );

  return (
    <nav
      aria-label="주요 하단 내비게이션"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-slate-200 bg-white/95 px-1.5 pb-[env(safe-area-inset-bottom,6px)] pt-1.5 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] backdrop-blur-md"
    >
      <ul
        className={cn(
          'grid items-end gap-0.5',
          visibleTabs.length === 5 ? 'grid-cols-5' : 'grid-cols-4',
        )}
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);

          if (tab.isCenterAction) {
            return (
              <li key={tab.href} className="flex justify-center">
                <Link
                  href={tab.href}
                  aria-current={isActive ? 'page' : undefined}
                  className="group -mt-6 flex min-h-14 flex-col items-center justify-end px-1 pb-1"
                >
                  <span
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full border-4 border-white shadow-lg transition-transform group-active:scale-95',
                      isActive
                        ? 'bg-[#246BEB] text-white ring-2 ring-blue-300'
                        : 'bg-[#1E3A8A] text-white',
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 whitespace-nowrap text-xs font-bold',
                      isActive ? 'text-[#246BEB]' : 'text-[#1D1D1D]',
                    )}
                  >
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors active:bg-slate-100',
                  isActive
                    ? cn(tab.activeColorClass, 'bg-slate-50 font-extrabold')
                    : 'text-slate-500 font-semibold hover:text-slate-800',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap text-xs leading-tight">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
