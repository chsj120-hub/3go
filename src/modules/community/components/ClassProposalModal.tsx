'use client';

import { useState } from 'react';
import { PlusCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import { STAGE1_QUICK_TEMPLATES, type Stage1Template } from '../templates';
import type { CommunityClassItem } from '../types';
import { cn } from '@/lib/utils';

interface ClassProposalModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (item: CommunityClassItem) => void;
  onNotify: (message: string) => void;
}

/**
 * 1GO 살피GO [클래스 개설·강사 지원] 모달.
 * - 3단계 절차 가이드 (① 예시 고르기 ➔ ② 내용 다듬기 ➔ ③ 안전·면책 동의 후 등록)
 * - 통합 기획서 부록 2(14대 생활 꿀팁 클래스) 원클릭 예시 템플릿 5종 제공
 */
export function ClassProposalModal({
  open,
  onClose,
  onCreated,
  onNotify,
}: ClassProposalModalProps) {
  const { currentUser, activeRegion } = useAppContext();
  const [selectedTplId, setSelectedTplId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('생활기술');
  const [location, setLocation] = useState(
    `${activeRegion.shortName} 행정복지센터 1층 공유공방`,
  );
  const [maxCapacity, setMaxCapacity] = useState('12');
  const [description, setDescription] = useState('');
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [liabilityWaiverAgreed, setLiabilityWaiverAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTemplate = (tpl: Stage1Template) => {
    setSelectedTplId(tpl.id);
    setTitle(tpl.title);
    setCategory(tpl.category);
    setLocation(`${activeRegion.shortName} ${tpl.locationSuffix}`);
    setMaxCapacity(tpl.maxCapacity);
    setDescription(tpl.description);
  };

  const canSubmit =
    title.trim().length > 0 &&
    location.trim().length > 0 &&
    description.trim().length > 0 &&
    safetyAgreed &&
    liabilityWaiverAgreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/community/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: '1GO',
          title,
          category,
          proposerNickname: currentUser.nickname,
          location,
          description,
          maxCapacity: Number(maxCapacity) || 12,
          safetyAgreed,
          liabilityWaiverAgreed,
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        created?: CommunityClassItem;
        message?: string;
      };

      if (json.ok && json.created) {
        onCreated(json.created);
        onNotify(json.message ?? '주민 제안 1GO 클래스가 개설되었습니다!');
        setTitle('');
        setDescription('');
        setSelectedTplId('');
        setSafetyAgreed(false);
        setLiabilityWaiverAgreed(false);
        onClose();
      } else {
        onNotify(json.message ?? '클래스 개설 중 오류가 발생했습니다.');
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
      subtitle="1GO 살피GO · 강사료 0원 주민 재능기부"
      title="생활 꿀팁 클래스 개설 · 강사 지원"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {/* 3단계 절차 안내 바 */}
        <ol className="grid grid-cols-3 gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-center text-[11px] font-bold text-[#065F46]">
          <li className="rounded-xl bg-white py-1.5 shadow-xs">① 예시 고르기</li>
          <li className="rounded-xl bg-white py-1.5 shadow-xs">② 내용 다듬기</li>
          <li className="rounded-xl bg-white py-1.5 shadow-xs">③ 안전동의·개설</li>
        </ol>

        {/* ① 원클릭 예시 템플릿 칩 */}
        <div className="space-y-2">
          <p className="inline-flex items-center gap-1 text-xs font-bold text-[#047857]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>① 인기 예시를 누르면 제목·설명이 자동으로 채워져요</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STAGE1_QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={cn(
                  'min-h-11 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition active:scale-95',
                  selectedTplId === tpl.id
                    ? 'border-[#047857] bg-[#047857] text-white'
                    : 'border-slate-300 bg-white text-[#1D1D1D] hover:bg-emerald-50',
                )}
              >
                {tpl.chipLabel}
              </button>
            ))}
          </div>
        </div>

        {/* ② 상세 정보 입력 */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div>
            <label
              htmlFor="proposal-title"
              className="block text-sm font-bold text-[#1D1D1D]"
            >
              ② 클래스 제목 (필수)
            </label>
            <input
              id="proposal-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="위 예시 칩을 누르거나 직접 제목을 적어주세요"
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm text-[#1D1D1D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="proposal-category"
                className="block text-sm font-bold text-[#1D1D1D]"
              >
                분야
              </label>
              <select
                id="proposal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-[#1D1D1D]"
              >
                <option value="생활기술">생활기술·수리</option>
                <option value="디지털AI">스마트폰·AI</option>
                <option value="생활안전">생활안전·건강</option>
                <option value="독서문화">독서·식물·취미</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="proposal-capacity"
                className="block text-sm font-bold text-[#1D1D1D]"
              >
                모집 정원 (명)
              </label>
              <input
                id="proposal-capacity"
                type="number"
                min={4}
                max={50}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm font-bold text-[#1D1D1D]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="proposal-location"
              className="block text-sm font-bold text-[#1D1D1D]"
            >
              희망 공공·공유 장소 (필수)
            </label>
            <input
              id="proposal-location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm text-[#1D1D1D]"
            />
            <p className="mt-1 text-[11px] text-[#555555]">
              ※ 개인 집 주소 대신 주민센터·도서관·아파트 커뮤니티실을 적어주세요.
            </p>
          </div>

          <div>
            <label
              htmlFor="proposal-desc"
              className="block text-sm font-bold text-[#1D1D1D]"
            >
              클래스 소개 및 준비물 (필수)
            </label>
            <textarea
              id="proposal-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이웃들과 함께 나누고 싶은 내용과 간단한 준비물을 적어주세요."
              className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm text-[#1D1D1D]"
            />
          </div>
        </div>

        {/* ③ 시설 안전 & 배상책임 면책 필수 체크 */}
        <div className="space-y-2 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950">
            <ShieldAlert className="h-4 w-4 text-[#C2410C]" aria-hidden="true" />
            <span>③ 시설 안전 · 배상책임 면책 필수 동의</span>
          </p>

          <label className="flex min-h-12 cursor-pointer items-start gap-2.5 text-xs text-[#1D1D1D]">
            <input
              type="checkbox"
              checked={safetyAgreed}
              onChange={(e) => setSafetyAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#047857]"
            />
            <span>
              <strong>[필수] 공공·공유시설 안전 수칙 준수:</strong> 고압 위험
              가전(대형 TV·전자레인지 등)이나 화기 작업은 제외하고 안전하게
              진행합니다.
            </span>
          </label>

          <label className="flex min-h-12 cursor-pointer items-start gap-2.5 text-xs text-[#1D1D1D]">
            <input
              type="checkbox"
              checked={liabilityWaiverAgreed}
              onChange={(e) => setLiabilityWaiverAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#047857]"
            />
            <span>
              <strong>[필수] 비영리 재능기부 배상책임 면책 확인:</strong> 강사료
              0원 무상 나눔이며, 주민센터 단체 배상책임보험 및 면책 기준에
              동의합니다.
            </span>
          </label>
        </div>

        <ActionButton
          type="submit"
          tone="stage1"
          fullWidth
          disabled={!canSubmit}
          loading={isSubmitting}
          leadingIcon={<PlusCircle className="h-5 w-5" aria-hidden="true" />}
        >
          1GO 클래스 개설 등록하기
        </ActionButton>
      </form>
    </BottomSheet>
  );
}
