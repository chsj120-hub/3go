'use client';

import {
  CheckCircle2,
  Clock,
  Footprints,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import type { PatrolCrewItem } from '../types';

const PATROL_CREWS: PatrolCrewItem[] = [
  {
    id: 'patrol-01',
    title: '쌍암공원 ➔ 첨단중앙로 야간 안심 귀가 크루',
    routeSummary: '쌍암공원 수변데크 ➔ 중심상가 ➔ 첨단라인아파트 정문 (1.4km)',
    schedule: '매주 화·목 20:30 ~ 21:30',
    safetyGrade: '생활안전지도 보안등 1등급 코스',
    currentMembers: 4,
    maxMembers: 6,
    agencyNote: '방범 CCTV 6개소 연계 · 2인 이상 동행 필수',
  },
  {
    id: 'patrol-02',
    title: '산월동 이면골목 조도 점검 & 어르신 안부 체크 크루',
    routeSummary: '첨단강변로 이면골목 ➔ 호반리젠시빌 ➔ 독거노인 가구 문앞 안부',
    schedule: '매주 수·금 19:30 ~ 20:30',
    safetyGrade: '생활안전지도 조도 개선 우선 구역',
    currentMembers: 3,
    maxMembers: 5,
    agencyNote: '광주첨단우체국 안부살핌망 협력 코스',
  },
  {
    id: 'patrol-03',
    title: '월계동 학원가 ➔ 응암공원 방과후·저녁 안심 동행 크루',
    routeSummary: '임방울대로 학원가 ➔ 첨단도서관 ➔ 첨단부영아파트',
    schedule: '평일 18:30 ~ 19:30 (순환 릴레이)',
    safetyGrade: '안심비상벨 4개소 설치 구간',
    currentMembers: 5,
    maxMembers: 8,
    agencyNote: '아동·청소년 귀가 안전 지원',
  },
];

interface PatrolCrewViewProps {
  joinedCrewIds: Record<string, boolean>;
  onJoinCrew: (crew: PatrolCrewItem) => void;
}

/**
 * 3단계 이어지GO 탭 3: [야간 안심 순찰 크루].
 * 모든 크루 매칭 버튼 클릭 시 background_check_status === 'approved'를 확인합니다.
 */
export function PatrolCrewView({
  joinedCrewIds,
  onJoinCrew,
}: PatrolCrewViewProps) {
  return (
    <div className="space-y-3.5">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-950">
        <p className="inline-flex items-center gap-1 font-bold">
          <ShieldAlert className="h-4 w-4 text-[#C2410C]" aria-hidden="true" />
          <span>야간 안심 순찰 크루 참여 안전 기준</span>
        </p>
        <p className="mt-1">
          광주광역시 생활안전지도(보안등·CCTV) 공공데이터 기반 안심 동선을
          순찰합니다. 참여 매칭 시 <strong>성범죄 경력 조회 승인(approved)</strong>
          이 필수입니다.
        </p>
      </div>

      <div className="space-y-3">
        {PATROL_CREWS.map((crew) => {
          const isJoined = Boolean(joinedCrewIds[crew.id]);
          const members = crew.currentMembers + (isJoined ? 1 : 0);

          return (
            <article
              key={crew.id}
              className="space-y-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <Badge variant="navy">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{crew.safetyGrade}</span>
                </Badge>
                <span className="text-xs font-bold text-[#555555]">
                  {members} / {crew.maxMembers}명
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1D1D1D]">
                  {crew.title}
                </h3>
                <p className="mt-1 text-xs font-bold text-[#246BEB]">
                  {crew.agencyNote}
                </p>
              </div>

              <div className="space-y-1 text-xs text-[#555555]">
                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{crew.routeSummary}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{crew.schedule}</span>
                </p>
              </div>

              <ActionButton
                tone={isJoined ? 'outline' : 'stage3'}
                fullWidth
                disabled={isJoined}
                leadingIcon={
                  isJoined ? (
                    <CheckCircle2 className="h-5 w-5 text-[#047857]" aria-hidden="true" />
                  ) : (
                    <Footprints className="h-5 w-5" aria-hidden="true" />
                  )
                }
                onClick={() => onJoinCrew(crew)}
              >
                {isJoined
                  ? '야간 안심 순찰 크루 합류 완료'
                  : '야간 순찰 크루 매칭하기 (경력 조회 확인)'}
              </ActionButton>
            </article>
          );
        })}
      </div>
    </div>
  );
}
