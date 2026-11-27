'use client';

import { useState } from 'react';
import { PlusCircle, Sparkles, Users } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { STAGE2_QUICK_TEMPLATES, type Stage2Template } from '../templates';
import type { CommunityClassItem } from '../types';
import { cn } from '@/lib/utils';

interface Stage2MeetupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (item: CommunityClassItem) => void;
  onNotify: (message: string) => void;
}

/**
 * 2GO 인사하GO [세대 교차 모임·크루 개설] 마법사 모달.
 * - 3단계 절차 안내 (① 7대 크루 예시 고르기 ➔ ② 모임 정보 수정 ➔ ③ 3대 운영 원칙 동의 후 개설)
 * - 통합 기획서 부록 4(씨앗·모종 도서관, 골목 줍깅, 출사 크루, 골목놀이, 시니어 미식) 원클릭 예시 제공
 */
export function Stage2MeetupModal({
  open,
  onClose,
  onCreated,
  onNotify,
}: Stage2MeetupModalProps) {
  const { currentUser, activeRegion } = useAppContext();
  const [selectedTplId, setSelectedTplId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('생태버디');
  const [monthTag, setMonthTag] = useState('상시');
  const [location, setLocation] = useState(
    `${activeRegion.shortName} 쌍암공원 입구 광장`,
  );
  const [maxCapacity, setMaxCapacity] = useState('20');
  const [description, setDescription] = useState('');
  const [nicknameRuleAgreed, setNicknameRuleAgreed] = useState(false);
  const [seasonRuleAgreed, setSeasonRuleAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTemplate = (tpl: Stage2Template) => {
    setSelectedTplId(tpl.id);
    setTitle(tpl.title);
    setCategory(tpl.category);
    setMonthTag(tpl.monthTag);
    setLocation(`${activeRegion.shortName} ${tpl.locationSuffix}`);
    setMaxCapacity(tpl.maxCapacity);
    setDescription(tpl.description);
  };

  const canSubmit =
    title.trim().length > 0 &&
    location.trim().length > 0 &&
    description.trim().length > 0 &&
    nicknameRuleAgreed &&
    seasonRuleAgreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/community/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: '2GO',
          title,
          category,
          proposerNickname: currentUser.nickname,
          location,
          description,
          maxCapacity: Number(maxCapacity) || 20,
          safetyAgreed: nicknameRuleAgreed,
          liabilityWaiverAgreed: seasonRuleAgreed,
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        created?: CommunityClassItem;
        message?: string;
      };
      if (json.ok && json.created) {
        onCreated({ ...json.created, monthTag });
        onNotify(json.message ?? '2GO 세대 교차 모임이 개설되었습니다!');
        setTitle('');
        setDescription('');
        setSelectedTplId('');
        setNicknameRuleAgreed(false);
        setSeasonRuleAgreed(false);
        onClose();
      } else {
        onNotify(json.message ?? '모임 개설 중 오류가 발생했습니다.');
      }
    } catch {
      onNotify('네트워크 연결을 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      subtitle="2GO 인사하GO · 직함·텃세 없는 세대 교차 모임"
      title="새 동네 모임 · 크루 개설하기"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <ol className="grid grid-cols-3 gap-1.5 rounded-2xl border border-orange-200 bg-orange-50/70 p-2.5 text-center text-[11px] font-bold text-[#9A3412]">
          <li className="rounded-xl bg-white py-1.5 shadow-xs">① 크루 예시 선택</li>
          <li className="rounded-xl bg-white py-1.5 shadow-xs">② 일정·내용 수정</li>
          <li className="rounded-xl bg-white py-1.5 shadow-xs">③ 3대원칙·개설</li>
        </ol>

        <div className="space-y-2">
          <p className="inline-flex items-center gap-1 text-xs font-bold text-[#C2410C]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>① 인기 7대 크루 예시를 눌러 바로 시작해 보세요</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STAGE2_QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={cn(
                  'min-h-11 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition active:scale-95',
                  selectedTplId === tpl.id
                    ? 'border-[#C2410C] bg-[#C2410C] text-white'
                    : 'border-slate-300 bg-white text-[#1D1D1D] hover:bg-orange-50',
                )}
              >
                {tpl.chipLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div>
            <label
              htmlFor="meetup-title"
              className="block text-sm font-bold text-[#1D1D1D]"
            >
              ② 모임·크루 이름 (필수)
            </label>
            <input
              id="meetup-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 토요일 오전 쌍암공원 줍깅 & 동네네컷 크루"
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm text-[#1D1D1D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="meetup-month"
                className="block text-sm font-bold text-[#1D1D1D]"
              >
                운영 시즌
              </label>
              <select
                id="meetup-month"
                value={monthTag}
                onChange={(e) => setMonthTag(e.target.value)}
                className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-[#1D1D1D]"
              >
                <option value="상시">상시 (4~8주 시즌)</option>
                <option value="3월">3월 시즌</option>
                <option value="4월">4월 시즌</option>
                <option value="5월">5월 시즌</option>
                <option value="6월">6월 시즌</option>
                <option value="7~8월">7~8월 하계</option>
                <option value="분기·방학">분기·방학 팝업</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="meetup-capacity"
                className="block text-sm font-bold text-[#1D1D1D]"
              >
                정원 (명)
              </label>
              <input
                id="meetup-capacity"
                type="number"
                min={4}
                max={40}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm font-bold text-[#1D1D1D]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="meetup-location"
              className="block text-sm font-bold text-[#1D1D1D]"
            >
              모임 장소 (필수)
            </label>
            <input
              id="meetup-location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm text-[#1D1D1D]"
            />
          </div>

          <div>
            <label
              htmlFor="meetup-desc"
              className="block text-sm font-bold text-[#1D1D1D]"
            >
              활동 소개 및 참여 방법 (필수)
            </label>
            <textarea
              id="meetup-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="누구나 부담 없이 어울릴 수 있도록 활동 방식을 적어주세요."
              className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm text-[#1D1D1D]"
            />
          </div>
        </div>

        {/* ③ 2GO 3대 필수 운영 원칙 체크 */}
        <div className="space-y-2 rounded-2xl border-2 border-orange-200 bg-orange-50/80 p-3.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9A3412]">
            <Users className="h-4 w-4 text-[#C2410C]" aria-hidden="true" />
            <span>③ 2단계 인사하GO 텃세 차단 3대 원칙 동의</span>
          </p>

          <label className="flex min-h-12 cursor-pointer items-start gap-2.5 text-xs text-[#1D1D1D]">
            <input
              type="checkbox"
              checked={nicknameRuleAgreed}
              onChange={(e) => setNicknameRuleAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#C2410C]"
            />
            <span>
              <strong>[필수] 직함·나이 계급장 떼기:</strong> 모임 중 가명
              닉네임으로 상호 존칭하며 세대 혼합 배치를 준수합니다.
            </span>
          </label>

          <label className="flex min-h-12 cursor-pointer items-start gap-2.5 text-xs text-[#1D1D1D]">
            <input
              type="checkbox"
              checked={seasonRuleAgreed}
              onChange={(e) => setSeasonRuleAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#C2410C]"
            />
            <span>
              <strong>[필수] 4~8주 시즌제 &amp; 사조직화 금지:</strong> 정해진
              시즌 종료 후 자동 해산하며, 민간 현금 회비를 걷지 않습니다.
            </span>
          </label>
        </div>

        <ActionButton
          type="submit"
          tone="stage2"
          fullWidth
          disabled={!canSubmit}
          loading={isSubmitting}
          leadingIcon={<PlusCircle className="h-5 w-5" aria-hidden="true" />}
        >
          2GO 세대 교차 모임 개설하기
        </ActionButton>
      </form>
    </BottomSheet>
  );
}
