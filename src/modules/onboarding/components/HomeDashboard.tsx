'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Camera,
  EyeOff,
  Handshake,
  Sparkles,
  Users,
} from 'lucide-react';
import { PublicDataStatusChip } from '@/components/layout/PublicDataStatusChip';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Snackbar } from '@/components/ui/snackbar';
import { useAppContext } from '../context/AppContext';
import { isRegularOrAbove } from '../demo-users';
import type { HomeDashboardData } from '../lib/home-data';
import { BestPhotospotSlider } from './BestPhotospotSlider';
import { OnboardingModal } from './OnboardingModal';
import { RecommendedProgramsSection } from './RecommendedProgramsSection';
import { SupplyMerchantsSection } from './SupplyMerchantsSection';
import { cn } from '@/lib/utils';

interface HomeDashboardProps {
  initialData: HomeDashboardData;
}

/**
 * 우리동네 3GO 홈 대시보드 (/).
 * - 최초 진입 시 3단계 온보딩 모달 자동 표시 (및 [온보딩 안내] 버튼으로 재실행 가능)
 * - 악천후 시뮬레이션 시 상단 실내 전환 알림 배너 + 실내 클래스 자동 우선 추천
 * - 베스트 동네네컷 가로 슬라이더
 * - 이달의 추천 1GO/2GO 클래스 카드 (Neon DB 조회)
 * - 골목 상권 '원정대 보급소' 상생 배너 섹션
 */
export function HomeDashboard({ initialData }: HomeDashboardProps) {
  const { currentUser, activeRegion, isGpsVerified, openOnboarding } =
    useAppContext();
  const [toast, setToast] = useState<string | null>(null);
  const canAccessCareBlind = isRegularOrAbove(currentUser.role);

  return (
    <div className="space-y-6">
      {/* 공공데이터포털 6대 API 실시간/스냅샷 연동 상태 칩 */}
      <PublicDataStatusChip />

      {/* 1. 진입 히어로 카드 (KRDS 시안 A 컬러·서체 + 모각작 마스코트 슬롯 + 화이트 진입 톤) */}
      <Card className="border-slate-300 bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold',
                currentUser.badgeColorClass,
              )}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {currentUser.roleLabel} · {currentUser.nickname}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1E3A8A]">
              <Users className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
              <span>이웃 18명 참여 중</span>
            </span>
          </div>

          <CardTitle className="mt-2 text-xl font-bold text-[#1D1D1D]">
            {activeRegion.displayName} 안심마을
          </CardTitle>
          <CardDescription className="text-sm text-[#555555]">
            {activeRegion.center.landmarkName} (반경 {activeRegion.radiusKm}km){' '}
            {isGpsVerified
              ? '· 생활권 GPS 인증 완료'
              : '· 온보딩 또는 시연 모드에서 GPS 인증을 완료해 보세요.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 우리동네 3GO 다람쥐 마스코트 + 배지 레벨 바 */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-300 bg-[#FFFDF8] shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot/3go-squirrel.jpg"
                alt="우리동네 3GO 다람쥐 마스코트"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#1D1D1D]">Lv.2 우리동네 안심 탐험대</span>
                <span className="text-[#246BEB]">배지 2/5</span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={40}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="마을 안심 탐험대 배지 진행률 40%"
              >
                <div className="h-full w-2/5 rounded-full bg-[#246BEB]" />
              </div>
              <p className="text-xs text-[#555555]">
                동네네컷 완주 시 골목 보급소 할인 쿠폰 + 명예 배지 발급
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/photospot"
              className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-[#246BEB] px-4 py-3 text-white shadow-sm transition hover:bg-[#1D56BC] active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <Camera className="h-6 w-6 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-base font-bold leading-tight">
                    동네네컷 화이트 스튜디오 출발
                  </p>
                  <p className="text-xs font-medium text-blue-100">
                    온디바이스 AI 2인 포즈 ➔ 보급소 D-7 쿠폰
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={openOnboarding}
              className="flex min-h-12 w-full items-center justify-between rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#1D1D1D] transition hover:bg-slate-50"
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
                <span>첫 방문 온보딩 · GPS 인증 다시 보기</span>
              </span>
              <ArrowRight className="h-4 w-4 text-[#555555]" aria-hidden="true" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. 베스트 동네네컷 가로 슬라이더 */}
      <BestPhotospotSlider onNotify={setToast} />

      {/* 3. 이달의 추천 1GO/2GO 클래스 카드 (Neon DB 조회 + 악천후 실내 전환 연동) */}
      <RecommendedProgramsSection
        programs={initialData.programs}
        dataSource={initialData.dataSource}
        onNotify={setToast}
      />

      {/* 4. 골목 상권 '원정대 보급소' 상생 배너 섹션 */}
      <SupplyMerchantsSection merchants={initialData.merchants} />

      {/* 5. 3단계 이어지GO 블라인드 상태 요약 카드 */}
      {canAccessCareBlind ? (
        <Link href="/care" className="block">
          <Card className="border-blue-300 bg-blue-50/70 transition hover:border-[#1E3A8A]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="navy">
                  <Handshake className="h-4 w-4" aria-hidden="true" />
                  <span>3GO 이어지GO · 정회원 활성</span>
                </Badge>
                <ArrowRight className="h-5 w-5 text-[#1E3A8A]" aria-hidden="true" />
              </div>
              <CardTitle className="mt-1.5 text-lg text-[#1E3A8A]">
                생활 품앗이 SOS · 스마트 공구도서관 입장
              </CardTitle>
              <CardDescription className="text-[#1D1D1D]">
                정회원 GPS 인증 및 성범죄 경력 조회 승인 완료 이웃과 안심
                품앗이를 나누세요.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ) : (
        <Card className="border-dashed border-slate-400 bg-slate-100/80">
          <CardHeader className="pb-4">
            <Badge variant="outline" className="w-fit text-[#555555]">
              <EyeOff className="h-4 w-4" aria-hidden="true" />
              <span>3단계 이어지GO 블라인드 보호 중</span>
            </Badge>
            <CardTitle className="mt-1.5 text-base text-[#1D1D1D]">
              준회원 화면에서는 3단계 메뉴가 완전히 숨겨집니다
            </CardTitle>
            <CardDescription>
              [🎭 시연 모드]에서 <strong>정회원</strong>으로 전환하면 하단
              &lsquo;이어지GO&rsquo; 탭과 품앗이 SOS가 즉시 활성화됩니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* 최초 진입용 3단계 온보딩 모달 */}
      <OnboardingModal onFinished={setToast} />
      <Snackbar message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
