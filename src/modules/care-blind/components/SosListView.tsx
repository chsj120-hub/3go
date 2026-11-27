'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Handshake,
  MapPin,
  PlusCircle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import type { SosCategory } from '@/db/schema';
import type { SosBoardItem } from '../types';

const CATEGORY_LABELS: Record<Exclude<SosCategory, 'TOOL'>, string> = {
  CARRY: '짐 이동',
  REPAIR: '생활 수리',
  ESCORT: '아동·어르신 동행',
};

const SOS_TEMPLATES: Array<{
  label: string;
  category: Exclude<SosCategory, 'TOOL'>;
  title: string;
  locationHint: string;
  description: string;
}> = [
  {
    label: '📦 생수·쌀 이동',
    category: 'CARRY',
    title: '생수 2묶음과 쌀 20kg 현관 안쪽 이동 부탁드려요',
    locationHint: '광주 광산구 쌍암동 ○○아파트 103동 정문',
    description:
      '무릎이 불편해 현관 앞 생수와 쌀을 부엌까지 옮기기 어렵습니다. 5분 정도만 손 빌려주시면 감사하겠습니다.',
  },
  {
    label: '💡 LED 형광등 교체',
    category: 'REPAIR',
    title: '안방 LED 형광등 깜빡임 교체 도움 요청 (자재 구비 완료)',
    locationHint: '광주 광산구 월계동 ○○아파트 인근',
    description:
      '새 LED 모듈을 구매해 두었는데 사다리 작업이 불안해 아래에서 잡아주시거나 함께 교체해 주실 이웃을 찾습니다.',
  },
  {
    label: '🎒 초등 하교 안심 동행',
    category: 'ESCORT',
    title: '[아이 하교 동행] 초등 2학년 방과후 첨단도서관 안심 동행',
    locationHint: '광주 광산구 월계동 초등학교 정문 ➔ 첨단도서관',
    description:
      '오후 5시 30분 하교 후 도서관까지 도보 10분 함께 걸어주실 정회원(경력조회 승인) 이웃을 구합니다.',
  },
  {
    label: '📚 늘봄 돌봄 품앗이',
    category: 'ESCORT',
    title: '[늘봄 마을 배움터] 목요일 오후 1시간 그림책 읽기 돌봄 품앗이',
    locationHint: '광주 광산구 첨단종합사회복지관 1층 마을배움터',
    description:
      '맞벌이 가정 아이 3명과 함께 그림책을 읽고 간식을 챙겨주실 정회원 이웃을 찾습니다. (1365 봉사시간 적립)',
  },
];

interface SosListViewProps {
  items: SosBoardItem[];
  matchingId: string | null;
  onMatchSos: (item: SosBoardItem) => void;
  onCreateSos: (payload: {
    category: Exclude<SosCategory, 'TOOL'>;
    title: string;
    description: string;
    locationHint: string;
  }) => Promise<void>;
}

/**
 * 3단계 이어지GO 탭 1: [생활 품앗이 SOS].
 * - 3단계 절차 가이드 + 원클릭 예시 템플릿 4종 제공
 */
export function SosListView({
  items,
  matchingId,
  onMatchSos,
  onCreateSos,
}: SosListViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<Exclude<SosCategory, 'TOOL'>>('CARRY');
  const [title, setTitle] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationHint.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateSos({ category, title, locationHint, description });
      setTitle('');
      setLocationHint('');
      setDescription('');
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#1D1D1D]">
          진행 중인 품앗이 SOS ({items.length}건)
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex min-h-12 items-center gap-1 rounded-xl border-2 border-[#1E3A8A] bg-blue-50 px-3 text-xs font-bold text-[#1E3A8A]"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span>{showForm ? '작성 닫기' : '품앗이 요청하기'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-3 rounded-2xl border-2 border-[#1E3A8A] bg-white p-4 shadow-sm"
        >
          {/* 3단계 절차 가이드 */}
          <ol className="grid grid-cols-3 gap-1 rounded-xl bg-blue-50 p-2 text-center text-[11px] font-bold text-[#1E3A8A]">
            <li className="rounded-lg bg-white py-1">① 예시 선택</li>
            <li className="rounded-lg bg-white py-1">② 동·시간 수정</li>
            <li className="rounded-lg bg-white py-1">③ 안심 등록</li>
          </ol>

          {/* 원클릭 SOS 예시 칩 */}
          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-1 text-xs font-bold text-[#246BEB]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>예시를 누르면 바로 채워져요</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SOS_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => {
                    setCategory(tpl.category);
                    setTitle(tpl.title);
                    setLocationHint(tpl.locationHint);
                    setDescription(tpl.description);
                  }}
                  className="min-h-10 rounded-full border border-blue-300 bg-blue-50/70 px-3 py-1 text-xs font-bold text-[#1E3A8A] hover:bg-blue-100"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(['CARRY', 'REPAIR', 'ESCORT'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={
                  category === cat
                    ? 'min-h-12 rounded-xl bg-[#1E3A8A] px-2 text-xs font-bold text-white'
                    : 'min-h-12 rounded-xl border border-slate-300 bg-slate-50 px-2 text-xs font-bold text-[#1D1D1D]'
                }
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="도움이 필요한 내용을 간단히 적어주세요"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
          />
          <div>
            <input
              type="text"
              required
              value={locationHint}
              onChange={(e) => setLocationHint(e.target.value)}
              placeholder="위치 힌트 (예: 첨단 쌍암동 ○○아파트 정문)"
              className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
            />
            <p className="mt-1 text-[11px] text-[#555555]">
              ※ 상세 호수나 전화번호는 적지 마세요. 매칭 후 050 안심 톡방으로
              연결됩니다.
            </p>
          </div>
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="희망 시간과 상세 설명을 입력해 주세요"
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm text-[#1D1D1D]"
          />

          <ActionButton
            type="submit"
            tone="stage3"
            fullWidth
            loading={isSubmitting}
          >
            정회원 전용 SOS 등록하기
          </ActionButton>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const isMatched = item.status !== 'OPEN';
          const catLabel =
            item.category === 'TOOL'
              ? '공구'
              : CATEGORY_LABELS[item.category];

          return (
            <article
              key={item.id}
              className="space-y-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="navy">
                    <span>{catLabel}</span>
                  </Badge>
                  {item.requiresBackgroundCheck && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-950">
                      <ShieldAlert className="h-3 w-3 text-[#C2410C]" aria-hidden="true" />
                      <span>성범죄 경력 조회 승인 필수</span>
                    </span>
                  )}
                </div>

                <span
                  className={
                    isMatched
                      ? 'rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-[#555555]'
                      : 'rounded-full bg-[#047857] px-2.5 py-0.5 text-xs font-bold text-white'
                  }
                >
                  {isMatched ? '매칭 완료' : '도움 대기'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold leading-snug text-[#1D1D1D]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#555555]">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-[#555555]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{item.locationHint}</span>
                </span>
                <span>요청자: {item.authorNickname}</span>
              </div>

              <ActionButton
                tone={isMatched ? 'outline' : 'stage3'}
                fullWidth
                disabled={isMatched}
                loading={matchingId === item.id}
                leadingIcon={
                  isMatched ? (
                    <CheckCircle2 className="h-5 w-5 text-[#047857]" aria-hidden="true" />
                  ) : (
                    <Handshake className="h-5 w-5" aria-hidden="true" />
                  )
                }
                onClick={() => onMatchSos(item)}
              >
                {isMatched
                  ? '이웃 매칭 완료'
                  : item.requiresBackgroundCheck
                    ? '아동·어르신 동행 매칭하기 (경력 조회 확인)'
                    : '품앗이 도움 매칭하기 (명예 배지 적립)'}
              </ActionButton>
            </article>
          );
        })}
      </div>
    </div>
  );
}
