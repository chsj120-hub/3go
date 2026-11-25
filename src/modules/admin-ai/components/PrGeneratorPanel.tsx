'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, Download, Sparkles } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { ChipTabs } from '@/components/ui/chip-tabs';
import type { PrFourWayOutput } from '@/lib/ai-agent';
import { useAppContext } from '@/modules/onboarding/context/AppContext';

type PrOutputTab = 'HOME_LETTER' | 'ELEVATOR' | 'PRESS' | 'CARD_NEWS';

interface PrGeneratorPanelProps {
  onNotify: (message: string) => void;
}

/**
 * AI 4-Way 홍보문 생성기.
 * - 행사명·일시·장소·내용 입력 ➔ POST /api/admin-ai/pr
 * - ① 가정통신문 ② 엘리베이터 공고문 ③ 보도자료 ④ 1080×1080 SNS 카드뉴스(Canvas PNG 다운로드)
 */
export function PrGeneratorPanel({ onNotify }: PrGeneratorPanelProps) {
  const { activeRegion } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [eventName, setEventName] = useState(
    '은퇴 장인의 자가수리 학교 & 잉여 자재 나눔 은행',
  );
  const [eventDate, setEventDate] = useState('2026년 12월 12일(토) 10:30');
  const [location, setLocation] = useState(
    `${activeRegion.shortName} 첨단1동 행정복지센터 1층 공유공방`,
  );
  const [targetAudience, setTargetAudience] = useState('관내 전 세대 주민 16명');
  const [details, setDetails] = useState(
    '방충망 교체·수전 트랩·LED 수리를 노인일자리 은퇴 장인에게 무료로 배우고 남은 자재를 이웃과 나눕니다.',
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<PrFourWayOutput | null>(null);
  const [outputTab, setOutputTab] = useState<PrOutputTab>('HOME_LETTER');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin-ai/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventDate,
          location,
          targetAudience,
          details,
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        result?: PrFourWayOutput;
        message?: string;
      };
      if (json.ok && json.result) {
        setOutput(json.result);
        onNotify(
          json.result.mode === 'gemini'
            ? 'Gemini AI로 4-Way 홍보문이 동시 생성되었습니다!'
            : '공공 표준 AI 템플릿으로 4-Way 홍보문이 즉시 생성되었습니다!',
        );
      } else {
        onNotify(json.message ?? '홍보문 생성 중 오류가 발생했습니다.');
      }
    } catch {
      onNotify('네트워크 연결을 확인해 주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ④ 1080×1080 SNS 카드뉴스 HTML5 Canvas 렌더링
  useEffect(() => {
    if (!output || outputTab !== 'CARD_NEWS') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 1080, 1080);

    // KRDS 블루 외곽선 & 상단 배너
    ctx.strokeStyle = '#246BEB';
    ctx.lineWidth = 24;
    ctx.strokeRect(24, 24, 1032, 1032);

    ctx.fillStyle = '#246BEB';
    ctx.beginPath();
    ctx.roundRect(72, 72, 936, 126, 24);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px "Pretendard GOV", sans-serif';
    ctx.fillText(`우리동네 3GO · ${activeRegion.displayName}`, 540, 148);

    // 메인 제목
    ctx.fillStyle = '#1D1D1D';
    ctx.font = 'bold 54px "Pretendard GOV", sans-serif';
    const titleLine1 = output.cardNewsHeadline.slice(0, 16);
    const titleLine2 = output.cardNewsHeadline.slice(16, 34);
    ctx.fillText(titleLine1, 540, 310);
    if (titleLine2) {
      ctx.fillText(titleLine2, 540, 382);
    }

    // 일시·장소
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 32px "Pretendard GOV", sans-serif';
    ctx.fillText(output.cardNewsSubtext.slice(0, 34), 540, 466);

    // 핵심 포인트 3줄 카드
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(72, 520, 936, 360, 28);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1D1D1D';
    ctx.font = 'bold 32px "Pretendard GOV", sans-serif';
    output.cardNewsBullets.forEach((bullet, idx) => {
      ctx.fillText(`✓ ${bullet.slice(0, 30)}`, 112, 608 + idx * 100);
    });

    // 하단 푸터
    ctx.fillStyle = '#1E3A8A';
    ctx.beginPath();
    ctx.roundRect(72, 920, 936, 88, 20);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px "Pretendard GOV", sans-serif';
    ctx.fillText('참가비 0원 · 지금 우리동네 3GO 앱에서 1클릭 신청', 540, 976);
  }, [activeRegion.displayName, output, outputTab]);

  const handleCopyText = (text: string, label: string) => {
    void navigator.clipboard?.writeText(text);
    onNotify(`${label} 텍스트가 클립보드에 복사되었습니다.`);
  };

  const handleDownloadCardNews = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `우리동네3GO_카드뉴스_1080x1080.png`;
    link.click();
    onNotify('1080×1080 SNS 카드뉴스 PNG가 다운로드되었습니다!');
  };

  return (
    <section className="space-y-4 rounded-3xl border-2 border-slate-300 bg-white p-4 shadow-sm">
      <div>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A]">
          <Sparkles className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
          <span>담당자 업무 제로화 · AI 4-Way 홍보문</span>
        </span>
        <h2 className="mt-1 text-lg font-bold text-[#1D1D1D]">
          1회 입력 ➔ 4종 홍보물 동시 생성
        </h2>
      </div>

      <form onSubmit={(e) => void handleGenerate(e)} className="space-y-2.5">
        <input
          type="text"
          required
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="행사명"
          className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm font-bold text-[#1D1D1D]"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder="일시"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3 text-xs font-bold text-[#1D1D1D]"
          />
          <input
            type="text"
            required
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="참여 대상"
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3 text-xs font-bold text-[#1D1D1D]"
          />
        </div>
        <input
          type="text"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="장소"
          className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-3.5 text-sm text-[#1D1D1D]"
        />
        <textarea
          rows={2}
          required
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="핵심 내용"
          className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm text-[#1D1D1D]"
        />

        <ActionButton
          type="submit"
          tone="krds"
          fullWidth
          loading={isGenerating}
          leadingIcon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
        >
          AI 4-Way 홍보문 &amp; 카드뉴스 동시 생성
        </ActionButton>
      </form>

      {output && (
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <ChipTabs<PrOutputTab>
            ariaLabel="4-Way 홍보문 출력 탭"
            tone="krds"
            value={outputTab}
            onChange={setOutputTab}
            items={[
              { value: 'HOME_LETTER', label: '① 가정통신문' },
              { value: 'ELEVATOR', label: '② 엘리베이터 공고' },
              { value: 'PRESS', label: '③ 보도자료' },
              { value: 'CARD_NEWS', label: '④ 1080 카드뉴스' },
            ]}
          />

          {outputTab !== 'CARD_NEWS' ? (
            <div className="space-y-2.5">
              <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3.5 font-sans text-xs leading-relaxed text-[#1D1D1D]">
                {outputTab === 'HOME_LETTER' && output.homeLetter}
                {outputTab === 'ELEVATOR' && output.elevatorNotice}
                {outputTab === 'PRESS' && output.pressRelease}
              </pre>
              <ActionButton
                tone="outline"
                fullWidth
                leadingIcon={<Copy className="h-4 w-4" aria-hidden="true" />}
                onClick={() =>
                  handleCopyText(
                    outputTab === 'HOME_LETTER'
                      ? output.homeLetter
                      : outputTab === 'ELEVATOR'
                        ? output.elevatorNotice
                        : output.pressRelease,
                    outputTab === 'HOME_LETTER'
                      ? '가정통신문'
                      : outputTab === 'ELEVATOR'
                        ? '엘리베이터 공고문'
                        : '보도자료',
                  )
                }
              >
                작성된 홍보문 복사하기
              </ActionButton>
            </div>
          ) : (
            <div className="space-y-2.5">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1080}
                className="mx-auto aspect-square w-full max-w-[320px] rounded-2xl border-2 border-slate-300 shadow-sm"
              />
              <ActionButton
                tone="stage1"
                fullWidth
                leadingIcon={<Download className="h-5 w-5" aria-hidden="true" />}
                onClick={handleDownloadCardNews}
              >
                1080×1080 SNS 카드뉴스 PNG 다운로드
              </ActionButton>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
