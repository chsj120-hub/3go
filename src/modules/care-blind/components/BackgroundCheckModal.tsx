'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Eraser, PenTool, ShieldCheck } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useAppContext } from '@/modules/onboarding/context/AppContext';

interface BackgroundCheckModalProps {
  open: boolean;
  targetActionLabel: string;
  onClose: () => void;
  onApproved: () => void;
}

/**
 * 아동 동행 · 야간 안심 순찰 매칭 시 미승인자에게 표시되는
 * '성범죄 경력 조회 동의서 전자서명(UI Mock)' 모달.
 */
export function BackgroundCheckModal({
  open,
  targetActionLabel,
  onClose,
  onApproved,
}: BackgroundCheckModalProps) {
  const { currentUser } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const [legalAgreed, setLegalAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const getPoint = (
    e: React.PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * e.currentTarget.width,
      y: ((e.clientY - rect.top) / rect.height) * e.currentTarget.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    setHasSigned(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleAutoDemoSign = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'italic bold 26px "Pretendard GOV", sans-serif';
    ctx.fillText(`${currentUser.nickname} (전자서명)`, 24, 62);
    setHasSigned(true);
  };

  const canSubmit = legalAgreed && privacyAgreed && hasSigned;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      subtitle="3단계 이어지GO · 아동·야간 돌봄 필수 보안 검증"
      title="성범죄 경력 조회 동의서 전자서명"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs leading-relaxed text-[#1D1D1D]">
          <p className="inline-flex items-center gap-1 font-bold text-[#1E3A8A]">
            <ShieldCheck className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
            <span>요청 활동: {targetActionLabel}</span>
          </p>
          <p className="mt-1 text-[#555555]">
            아동·청소년의 성보호에 관한 법률 및 지자체 마을 돌봄 안전 지침에
            따라, 아동 동행 및 야간 순찰 참여자는 성범죄 경력 조회 승인
            (<code>approved</code>) 완료 후 매칭할 수 있습니다.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex min-h-12 cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3 text-xs text-[#1D1D1D]">
            <input
              type="checkbox"
              checked={legalAgreed}
              onChange={(e) => setLegalAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#1E3A8A]"
            />
            <span>
              <strong>[필수] 성범죄 경력 및 아동학대 관련 범죄 전력 조회</strong>
              에 동의합니다. (관할 행정복지센터·경찰서 연계 확인)
            </span>
          </label>

          <label className="flex min-h-12 cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3 text-xs text-[#1D1D1D]">
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#1E3A8A]"
            />
            <span>
              <strong>[필수] 조회 결과는 승인 여부(approved)만 저장</strong>되며,
              민감 개인정보는 앱 서버에 보관하지 않음에 동의합니다.
            </span>
          </label>
        </div>

        {/* HTML5 Canvas 터치·마우스 전자서명 패드 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="inline-flex items-center gap-1 text-[#1D1D1D]">
              <PenTool className="h-4 w-4 text-[#246BEB]" aria-hidden="true" />
              <span>본인 전자서명 (아래 칸에 서명)</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleAutoDemoSign}
                className="min-h-10 rounded-lg border border-[#246BEB] bg-blue-50 px-2.5 text-[11px] font-bold text-[#1E3A8A]"
              >
                시연용 간편 서명
              </button>
              <button
                type="button"
                onClick={handleClearSignature}
                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 text-[11px] font-bold text-[#555555]"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                <span>지우기</span>
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={360}
            height={100}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full touch-none rounded-2xl border-2 border-dashed border-slate-400 bg-white"
          />
        </div>

        <ActionButton
          tone="stage3"
          fullWidth
          disabled={!canSubmit}
          leadingIcon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          onClick={() => {
            onApproved();
            onClose();
          }}
        >
          전자서명 제출 및 승인 완료 (UI Mock)
        </ActionButton>
      </div>
    </BottomSheet>
  );
}
