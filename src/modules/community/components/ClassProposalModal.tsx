'use client';

import { useState } from 'react';
import { PlusCircle, ShieldAlert } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import type { CommunityClassItem } from '../types';

interface ClassProposalModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (item: CommunityClassItem) => void;
  onNotify: (message: string) => void;
}

/**
 * 주민 누구나 재능기부로 제안할 수 있는 [클래스 개설·강사 지원] 모달.
 * 시설 안전 수칙 준수 및 배상책임 면책 체크박스 동의를 필수로 검증합니다.
 */
export function ClassProposalModal({
  open,
  onClose,
  onCreated,
  onNotify,
}: ClassProposalModalProps) {
  const { currentUser, activeRegion } = useAppContext();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('생활기술');
  const [location, setLocation] = useState(
    `${activeRegion.shortName} 행정복지센터 공유공방`,
  );
  const [maxCapacity, setMaxCapacity] = useState('12');
  const [description, setDescription] = useState('');
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [liabilityWaiverAgreed, setLiabilityWaiverAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        onNotify(json.message ?? '주민 제안 클래스가 개설되었습니다!');
        setTitle('');
        setDescription('');
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
      subtitle="강사료 0원 · 주민 재능기부 & 생활기술 나눔"
      title="클래스 개설 · 강사 지원"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
        <div>
          <label
            htmlFor="proposal-title"
            className="block text-sm font-bold text-[#1D1D1D]"
          >
            클래스 제목 (필수)
          </label>
          <input
            id="proposal-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 어르신 스마트폰 카카오톡 안전 설정 1시간 특강"
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
              <option value="독서문화">독서·취미</option>
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

        {/* 시설 안전 & 배상책임 면책 필수 체크 영역 */}
        <div className="space-y-2 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950">
            <ShieldAlert className="h-4 w-4 text-[#C2410C]" aria-hidden="true" />
            <span>공공 리빙랩 시설 안전 · 배상책임 면책 필수 동의</span>
          </p>

          <label className="flex min-h-12 cursor-pointer items-start gap-2.5 text-xs text-[#1D1D1D]">
            <input
              type="checkbox"
              checked={safetyAgreed}
              onChange={(e) => setSafetyAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#047857]"
            />
            <span>
              <strong>[필수] 공공·아파트 공유시설 안전 수칙 준수:</strong> 화기·고위험
              공구 사용을 금지하고 시설 관리자 안내에 따라 안전하게 진행합니다.
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
              0원 순수 비영리 나눔이며, 고의·중과실 외 경미한 생활 사고에 대한
              상호 면책 및 상해보험 안내 기준에 동의합니다.
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
          클래스 개설 제안 등록하기
        </ActionButton>
      </form>
    </BottomSheet>
  );
}
