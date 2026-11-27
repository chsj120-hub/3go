'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Footprints,
  MapPin,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import type { PatrolCrewItem } from '../types';

const INITIAL_PATROL_CREWS: PatrolCrewItem[] = [
  {
    id: 'patrol-01',
    title: '쌍암공원 ➔ 첨단중앙로 야간 안심 귀가 크루',
    routeSummary: '쌍암공원 수변데크 ➔ 중심상가 ➔ 첨단라인아파트 정문 (1.4km)',
    schedule: '매주 화·목 20:30 ~ 21:30',
    safetyGrade: '생활안전지도 보안등 1등급 코스',
    currentMembers: 4,
    maxMembers: 6,
    agencyNote: '방범 CCTV 6개소 연계 · 순찰 스팟 네컷 인증 시 1365 봉사 적립',
  },
  {
    id: 'patrol-02',
    title: '산월동 이면골목 조도 점검 & 우체국 연계 어르신 안부 크루',
    routeSummary: '첨단강변로 이면골목 ➔ 호반리젠시빌 ➔ 독거노인 가구 문앞 안부',
    schedule: '매주 수·금 19:30 ~ 20:30',
    safetyGrade: '생활안전지도 조도 개선 우선 구역',
    currentMembers: 3,
    maxMembers: 5,
    agencyNote: '광주첨단우체국·배달망 안부살핌 협력 코스',
  },
  {
    id: 'patrol-03',
    title: '월계동 학원가 ➔ 응암공원 방과후·저녁 안심 동행 크루',
    routeSummary: '임방울대로 학원가 ➔ 첨단도서관 ➔ 첨단부영아파트',
    schedule: '평일 18:30 ~ 19:30 (순환 릴레이)',
    safetyGrade: '안심비상벨 4개소 설치 구간',
    currentMembers: 5,
    maxMembers: 8,
    agencyNote: '아동·청소년 하교 및 학원 귀가 안전 지원',
  },
];

const PATROL_TEMPLATES = [
  {
    label: '🔦 야간 귀가 안심 크루',
    title: '쌍암동 중심상가 ➔ 아파트 단지 야간 안심 산책 크루',
    routeSummary: '쌍암공원 입구 ➔ 첨단중앙로 횡단보도 ➔ 단지 정문 (약 1.2km)',
    schedule: '매주 월·수 20:00 ~ 21:00',
  },
  {
    label: '📮 우체국 연계 어르신 안부',
    title: '홀몸 어르신 문앞 안부 살피기 & 골목 보안등 점검 크루',
    routeSummary: '첨단1동 복지관 ➔ 인근 임대아파트 101~104동 복도 순회',
    schedule: '매주 화·금 18:00 ~ 19:00',
  },
  {
    label: '🎒 초등 하교·학원 동행',
    title: '초등학생 방과후·태권도장 하원길 스팟 네컷 동행 크루',
    routeSummary: '초등학교 후문 ➔ 학원가 사거리 ➔ 응암공원 쉼터',
    schedule: '평일 17:30 ~ 18:30',
  },
];

interface PatrolCrewViewProps {
  joinedCrewIds: Record<string, boolean>;
  onJoinCrew: (crew: PatrolCrewItem) => void;
}

/**
 * 3단계 이어지GO 탭 3: [야간 안심 순찰 크루].
 * - 순찰 크루 합류 및 신규 크루 개설(3단계 절차 가이드 + 원클릭 예시 템플릿) 지원
 * - 모든 매칭은 성범죄 경력 조회 승인(approved) 확인 후 진행
 */
export function PatrolCrewView({
  joinedCrewIds,
  onJoinCrew,
}: PatrolCrewViewProps) {
  const [crews, setCrews] = useState<PatrolCrewItem[]>(INITIAL_PATROL_CREWS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [routeSummary, setRouteSummary] = useState('');
  const [schedule, setSchedule] = useState('');

  const handleCreateCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !routeSummary.trim() || !schedule.trim()) return;
    const newCrew: PatrolCrewItem = {
      id: `patrol-${Date.now()}`,
      title: title.trim(),
      routeSummary: routeSummary.trim(),
      schedule: schedule.trim(),
      safetyGrade: '주민 제안 안심 순찰 코스',
      currentMembers: 1,
      maxMembers: 6,
      agencyNote: '스팟 네컷 인증 연동 · 2인 이상 동행 필수',
    };
    setCrews((prev) => [newCrew, ...prev]);
    setTitle('');
    setRouteSummary('');
    setSchedule('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-950">
        <div className="flex items-start justify-between gap-2">
          <div>
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
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-xl bg-[#1E3A8A] px-3 text-xs font-bold text-white"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>{showCreateForm ? '닫기' : '크루 개설'}</span>
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateCrew}
          className="space-y-3 rounded-2xl border-2 border-[#1E3A8A] bg-white p-4"
        >
          <ol className="grid grid-cols-3 gap-1 rounded-xl bg-blue-50 p-2 text-center text-[11px] font-bold text-[#1E3A8A]">
            <li className="rounded-lg bg-white py-1">① 코스 예시 선택</li>
            <li className="rounded-lg bg-white py-1">② 동선·시간 수정</li>
            <li className="rounded-lg bg-white py-1">③ 크루 개설</li>
          </ol>

          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-1 text-xs font-bold text-[#246BEB]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>예시를 누르면 순찰 코스 양식이 바로 채워져요</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PATROL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => {
                    setTitle(tpl.title);
                    setRouteSummary(tpl.routeSummary);
                    setSchedule(tpl.schedule);
                  }}
                  className="min-h-10 rounded-full border border-blue-300 bg-blue-50/70 px-3 py-1 text-xs font-bold text-[#1E3A8A] hover:bg-blue-100"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="순찰 크루명"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
          />
          <input
            type="text"
            required
            value={routeSummary}
            onChange={(e) => setRouteSummary(e.target.value)}
            placeholder="순찰 동선 (예: 쌍암공원 입구 ➔ 중심상가 ➔ 단지 정문)"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
          />
          <input
            type="text"
            required
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="운영 요일 및 시간 (예: 매주 화·목 20:00 ~ 21:00)"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
          />

          <ActionButton type="submit" tone="stage3" fullWidth>
            안심 순찰 크루 개설하기
          </ActionButton>
        </form>
      )}

      <div className="space-y-3">
        {crews.map((crew) => {
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
