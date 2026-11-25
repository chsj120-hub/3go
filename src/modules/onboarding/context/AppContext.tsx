'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  DEFAULT_REGION_ID,
  getRegionConfig,
  type RegionConfig,
  type RegionId,
} from '@/config/region.config';
import type { UserRole } from '@/db/schema';
import { DEMO_USERS, type DemoUserProfile } from '../demo-users';

export interface PublishedMerchantBanner {
  id: string;
  merchantName: string;
  headline: string;
  reviewQuote: string;
  discountBadge: string;
  approvedAt: string;
}

export interface DemoSimulators {
  /** 가상 GPS 생활권 도착 시뮬레이션 */
  virtualGpsArrived: boolean;
  /** 보행 감지(Safety Lock) 강제 발동 */
  forceSafetyLock: boolean;
  /** 기상 악화(우천·미세먼지) 실내 전환 알림 시뮬레이션 */
  badWeatherAlert: boolean;
}

interface AppContextValue {
  /** 큰 글씨 모드 상태 (1.25배 확대, localStorage 유지) */
  isLargeText: boolean;
  toggleLargeText: () => void;
  setLargeText: (enabled: boolean) => void;

  /** 현재 시연 중인 사용자 프로필 및 역할 전환 */
  currentUser: DemoUserProfile;
  setDemoRole: (role: UserRole) => void;

  /** 현재 활성 생활권 지역 (기본값: 광주 광산구 첨단) */
  activeRegion: RegionConfig;
  setActiveRegionId: (regionId: RegionId) => void;

  /** 실질 GPS 인증 완료 여부 (계정 인증 또는 가상 GPS 도착) */
  isGpsVerified: boolean;

  /** 최초 진입 온보딩 완료 여부 및 모달 제어 */
  hasCompletedOnboarding: boolean;
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  completeOnboarding: () => void;

  /** 공무원 승인 완료 후 홈 화면에 실시간 게시되는 로컬 상점 상생 배너 */
  publishedBanners: PublishedMerchantBanner[];
  publishMerchantBanner: (banner: PublishedMerchantBanner) => void;

  /** 공모전 시연용 가상 환경 센서 토글 3종 */
  simulators: DemoSimulators;
  toggleSimulator: (key: keyof DemoSimulators) => void;
  setSimulator: (key: keyof DemoSimulators, value: boolean) => void;
}

const STORAGE_KEYS = {
  LARGE_TEXT: '3go-large-text',
  DEMO_ROLE: '3go-demo-role',
  REGION_ID: '3go-region-id',
  ONBOARDING_DONE: '3go-onboarding-done',
  PUBLISHED_BANNERS: '3go-published-banners',
} as const;

const STORAGE_SYNC_EVENT = '3go-storage-sync';

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_SYNC_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_SYNC_EVENT, callback);
  };
}

function readStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    window.dispatchEvent(new Event(STORAGE_SYNC_EVENT));
  } catch {
    // 프라이빗 브라우징 등 저장 불가 환경 무시
  }
}

function syncRoleCookie(role: UserRole) {
  if (typeof document === 'undefined') return;
  document.cookie = `3go_demo_role=${role}; path=/; max-age=604800; SameSite=Lax`;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const largeTextRaw = useSyncExternalStore(
    subscribeStorage,
    () => readStorage(STORAGE_KEYS.LARGE_TEXT, 'false'),
    () => 'false',
  );

  const roleRaw = useSyncExternalStore(
    subscribeStorage,
    () => readStorage(STORAGE_KEYS.DEMO_ROLE, 'REGULAR'),
    () => 'REGULAR',
  );

  const regionRaw = useSyncExternalStore(
    subscribeStorage,
    () => readStorage(STORAGE_KEYS.REGION_ID, DEFAULT_REGION_ID),
    () => DEFAULT_REGION_ID,
  );

  // SSR 중에는 모달 플래시를 막기 위해 'true'를 기본 반환하고, 클라이언트에서 미완료 시 자동 표시
  const onboardingDoneRaw = useSyncExternalStore(
    subscribeStorage,
    () => readStorage(STORAGE_KEYS.ONBOARDING_DONE, 'false'),
    () => 'true',
  );

  const bannersRaw = useSyncExternalStore(
    subscribeStorage,
    () => readStorage(STORAGE_KEYS.PUBLISHED_BANNERS, '[]'),
    () => '[]',
  );

  const publishedBanners = useMemo<PublishedMerchantBanner[]>(() => {
    try {
      const parsed = JSON.parse(bannersRaw) as PublishedMerchantBanner[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [bannersRaw]);

  const isLargeText = largeTextRaw === 'true';
  const role: UserRole =
    roleRaw in DEMO_USERS ? (roleRaw as UserRole) : 'REGULAR';
  const activeRegion = useMemo(() => getRegionConfig(regionRaw), [regionRaw]);
  const hasCompletedOnboarding = onboardingDoneRaw === 'true';

  const [manualOnboardingOpen, setManualOnboardingOpen] = useState(false);
  const [dismissedInitialOnboarding, setDismissedInitialOnboarding] =
    useState(false);

  const [simulators, setSimulators] = useState<DemoSimulators>({
    virtualGpsArrived: false,
    forceSafetyLock: false,
    badWeatherAlert: false,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('large-text-mode', isLargeText);
  }, [isLargeText]);

  useEffect(() => {
    syncRoleCookie(role);
  }, [role]);

  const setLargeText = useCallback((enabled: boolean) => {
    writeStorage(STORAGE_KEYS.LARGE_TEXT, String(enabled));
  }, []);

  const toggleLargeText = useCallback(() => {
    const current = readStorage(STORAGE_KEYS.LARGE_TEXT, 'false') === 'true';
    writeStorage(STORAGE_KEYS.LARGE_TEXT, String(!current));
  }, []);

  const setDemoRole = useCallback((nextRole: UserRole) => {
    writeStorage(STORAGE_KEYS.DEMO_ROLE, nextRole);
  }, []);

  const setActiveRegionId = useCallback((nextRegionId: RegionId) => {
    const resolved = getRegionConfig(nextRegionId).regionId;
    writeStorage(STORAGE_KEYS.REGION_ID, resolved);
  }, []);

  const openOnboarding = useCallback(() => {
    setManualOnboardingOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setManualOnboardingOpen(false);
    setDismissedInitialOnboarding(true);
    writeStorage(STORAGE_KEYS.ONBOARDING_DONE, 'true');
  }, []);

  const completeOnboarding = useCallback(() => {
    setManualOnboardingOpen(false);
    setDismissedInitialOnboarding(true);
    writeStorage(STORAGE_KEYS.ONBOARDING_DONE, 'true');
  }, []);

  const publishMerchantBanner = useCallback(
    (banner: PublishedMerchantBanner) => {
      const existingRaw = readStorage(STORAGE_KEYS.PUBLISHED_BANNERS, '[]');
      let existing: PublishedMerchantBanner[] = [];
      try {
        const parsed = JSON.parse(existingRaw) as PublishedMerchantBanner[];
        if (Array.isArray(parsed)) existing = parsed;
      } catch {
        existing = [];
      }
      writeStorage(
        STORAGE_KEYS.PUBLISHED_BANNERS,
        JSON.stringify([banner, ...existing].slice(0, 5)),
      );
    },
    [],
  );

  const toggleSimulator = useCallback((key: keyof DemoSimulators) => {
    setSimulators((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setSimulator = useCallback(
    (key: keyof DemoSimulators, value: boolean) => {
      setSimulators((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const currentUser = DEMO_USERS[role];
  const isGpsVerified = currentUser.gpsVerified || simulators.virtualGpsArrived;
  const isOnboardingOpen =
    manualOnboardingOpen ||
    (!hasCompletedOnboarding && !dismissedInitialOnboarding);

  const value = useMemo<AppContextValue>(
    () => ({
      isLargeText,
      toggleLargeText,
      setLargeText,
      currentUser,
      setDemoRole,
      activeRegion,
      setActiveRegionId,
      isGpsVerified,
      hasCompletedOnboarding,
      isOnboardingOpen,
      openOnboarding,
      closeOnboarding,
      completeOnboarding,
      publishedBanners,
      publishMerchantBanner,
      simulators,
      toggleSimulator,
      setSimulator,
    }),
    [
      isLargeText,
      toggleLargeText,
      setLargeText,
      currentUser,
      setDemoRole,
      activeRegion,
      setActiveRegionId,
      isGpsVerified,
      hasCompletedOnboarding,
      isOnboardingOpen,
      openOnboarding,
      closeOnboarding,
      completeOnboarding,
      publishedBanners,
      publishMerchantBanner,
      simulators,
      toggleSimulator,
      setSimulator,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext는 AppProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}

/** 큰 글씨 모드 전용 단축 훅 */
export function useLargeText() {
  const { isLargeText, toggleLargeText, setLargeText } = useAppContext();
  return { isLargeText, toggleLargeText, setLargeText };
}
