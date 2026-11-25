'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useAppContext } from '@/modules/onboarding/context/AppContext';
import {
  createDemoPoseCut,
  renderFourCutCanvas,
  type FourCutRenderResult,
  type MerchantCouponInfo,
} from './FourCutCanvasRenderer';
import {
  evaluateCooperativePose,
  type NormalizedLandmark,
  type PoseEvaluationResult,
} from './lib/pose-evaluator';
import { POSE_MISSION_LABELS, type PhotoSpotItem } from './types';
import { cn } from '@/lib/utils';

interface PoseCameraEngineProps {
  spot: PhotoSpotItem;
  merchant: MerchantCouponInfo;
  isSafetyLocked: boolean;
  onClose: () => void;
  onComposed: (result: FourCutRenderResult) => void;
}

const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MEDIAPIPE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/** 포즈 일치도 80% 이상을 1.5초 유지하면 자동 3-2-1 카운트다운 트리거 */
const AUTO_HOLD_CONFIDENCE = 80;
const AUTO_HOLD_DURATION_MS = 1500;

/**
 * 온디바이스 MediaPipe PoseLandmarker(numPoses: 2) 기반 2인 협동 포즈 촬영 엔진.
 * - 카메라 영상 및 포즈 좌표는 100% 브라우저 메모리 내에서만 연산(서버 전송 0%)
 * - 4가지 미션(STRETCH, BIG_HEART, MASCOT_POSE, HIGH_FIVE) 실시간 일치도 게이지 바 표시
 * - 일치도 80% 이상 1.5초 유지 시 3-2-1 카운트다운 후 자동 캡처
 * - 심사장 조명·PC 웹캠 미연결 대비 [데모 포즈 자동 캡처(시연용)] 폴백 버튼 제공
 */
export function PoseCameraEngine({
  spot,
  merchant,
  isSafetyLocked,
  onClose,
  onComposed,
}: PoseCameraEngineProps) {
  const { activeRegion } = useAppContext();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cutsRef = useRef<string[]>([]);
  const isCountingRef = useRef(false);
  const isSafetyLockedRef = useRef(isSafetyLocked);

  const landmarkerRef = useRef<{
    detectForVideo: (
      video: HTMLVideoElement,
      timestampMs: number,
    ) => { landmarks: NormalizedLandmark[][] };
    close: () => void;
  } | null>(null);

  const [cameraState, setCameraState] = useState<'LOADING' | 'READY' | 'DEMO'>(
    'LOADING',
  );
  const [aiStatusText, setAiStatusText] = useState(
    '온디바이스 MediaPipe PoseLandmarker 로드 중...',
  );
  const [poseResult, setPoseResult] = useState<PoseEvaluationResult>({
    matched: false,
    confidence: 0,
    detectedPeople: 0,
    feedback: '카메라 화면 안에 2인이 함께 서 주세요.',
  });
  const [holdProgressMs, setHoldProgressMs] = useState(0);
  const [cuts, setCuts] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    cutsRef.current = cuts;
  }, [cuts]);

  useEffect(() => {
    isSafetyLockedRef.current = isSafetyLocked;
    if (isSafetyLocked && countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
      isCountingRef.current = false;
      holdStartRef.current = null;
      setCountdown(null);
      setHoldProgressMs(0);
    }
  }, [isSafetyLocked]);

  const finishAndRender = useCallback(
    async (finalCuts: string[]) => {
      setIsComposing(true);
      try {
        const result = await renderFourCutCanvas({
          cuts: finalCuts,
          region: activeRegion,
          spot,
          merchant,
        });
        onComposed(result);
      } finally {
        setIsComposing(false);
      }
    },
    [activeRegion, merchant, onComposed, spot],
  );

  const captureSingleCut = useCallback(() => {
    const currentCuts = cutsRef.current;
    if (currentCuts.length >= 4) return;

    let cutDataUrl = '';
    const video = videoRef.current;
    if (video && video.readyState >= 2 && video.videoWidth > 0) {
      const snap = document.createElement('canvas');
      snap.width = 640;
      snap.height = 480;
      const ctx = snap.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, snap.width, snap.height);
        cutDataUrl = snap.toDataURL('image/png');
      }
    }

    if (!cutDataUrl) {
      cutDataUrl = createDemoPoseCut(
        currentCuts.length,
        spot.spotName,
        POSE_MISSION_LABELS[spot.poseMissionType],
        activeRegion.shortName,
      );
    }

    const updated = [...currentCuts, cutDataUrl];
    cutsRef.current = updated;
    setCuts(updated);

    if (updated.length >= 4) {
      void finishAndRender(updated);
    }
  }, [
    activeRegion.shortName,
    finishAndRender,
    spot.poseMissionType,
    spot.spotName,
  ]);

  const startCountdownCapture = useCallback(() => {
    if (
      isSafetyLockedRef.current ||
      isCountingRef.current ||
      cutsRef.current.length >= 4
    ) {
      return;
    }

    isCountingRef.current = true;
    holdStartRef.current = null;
    setHoldProgressMs(0);

    let remain = 3;
    setCountdown(remain);
    countdownTimerRef.current = setInterval(() => {
      remain -= 1;
      if (remain <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        isCountingRef.current = false;
        setCountdown(null);
        captureSingleCut();
      } else {
        setCountdown(remain);
      }
    }, 850);
  }, [captureSingleCut]);

  useEffect(() => {
    let cancelled = false;

    async function initPoseEngine() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('NO_CAMERA');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraState('READY');

        const vision = await import('@mediapipe/tasks-vision');
        const fileset = await vision.FilesetResolver.forVisionTasks(
          MEDIAPIPE_WASM_URL,
        );
        const landmarker = await vision.PoseLandmarker.createFromOptions(
          fileset,
          {
            baseOptions: { modelAssetPath: MEDIAPIPE_MODEL_URL },
            runningMode: 'VIDEO',
            numPoses: 2,
          },
        );

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setAiStatusText('온디바이스 2인 AI 포즈 판정 가동 중 (서버 전송 0%)');

        const detectLoop = () => {
          if (cancelled) return;
          const video = videoRef.current;
          const overlay = overlayCanvasRef.current;

          if (video && video.readyState >= 2 && landmarkerRef.current) {
            const nowMs = performance.now();
            const result = landmarkerRef.current.detectForVideo(video, nowMs);
            const evaluation = evaluateCooperativePose(
              result.landmarks,
              spot.poseMissionType,
            );
            setPoseResult(evaluation);

            // 일치도 80% 이상 1.5초 유지 시 3-2-1 자동 카운트다운
            if (
              evaluation.confidence >= AUTO_HOLD_CONFIDENCE &&
              !isSafetyLockedRef.current &&
              !isCountingRef.current &&
              cutsRef.current.length < 4
            ) {
              if (holdStartRef.current === null) {
                holdStartRef.current = nowMs;
              }
              const elapsed = nowMs - holdStartRef.current;
              setHoldProgressMs(Math.min(AUTO_HOLD_DURATION_MS, elapsed));
              if (elapsed >= AUTO_HOLD_DURATION_MS) {
                startCountdownCapture();
              }
            } else {
              holdStartRef.current = null;
              setHoldProgressMs(0);
            }

            if (overlay) {
              const ctx = overlay.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, overlay.width, overlay.height);
                ctx.fillStyle =
                  evaluation.confidence >= AUTO_HOLD_CONFIDENCE
                    ? '#047857'
                    : '#246BEB';
                for (const pose of result.landmarks) {
                  for (const pt of pose) {
                    ctx.beginPath();
                    ctx.arc(
                      pt.x * overlay.width,
                      pt.y * overlay.height,
                      4,
                      0,
                      Math.PI * 2,
                    );
                    ctx.fill();
                  }
                }
              }
            }
          }
          rafRef.current = requestAnimationFrame(detectLoop);
        };
        rafRef.current = requestAnimationFrame(detectLoop);
      } catch {
        if (!cancelled) {
          setCameraState('DEMO');
          setAiStatusText(
            '카메라 미연결 — 하단 [데모 포즈 자동 캡처(시연용)]로 4컷을 바로 완성하세요.',
          );
        }
      }
    }

    void initPoseEngine();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      landmarkerRef.current?.close();
    };
  }, [spot.poseMissionType, startCountdownCapture]);

  const handleDemoAutoCaptureAll = () => {
    if (isSafetyLocked || isComposing) return;
    const filled = [...cutsRef.current];
    while (filled.length < 4) {
      filled.push(
        createDemoPoseCut(
          filled.length,
          spot.spotName,
          POSE_MISSION_LABELS[spot.poseMissionType],
          activeRegion.shortName,
        ),
      );
    }
    setCuts(filled);
    void finishAndRender(filled);
  };

  const confidencePercent = Math.min(100, Math.max(0, poseResult.confidence));
  const holdSeconds = (holdProgressMs / 1000).toFixed(1);

  return (
    <section
      aria-label="온디바이스 MediaPipe 2인 협동 포즈 촬영 엔진"
      className="space-y-3.5 rounded-3xl border-2 border-[#246BEB] bg-white p-4 shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A]">
            <Sparkles className="h-3.5 w-3.5 text-[#246BEB]" aria-hidden="true" />
            <span>{POSE_MISSION_LABELS[spot.poseMissionType]}</span>
          </span>
          <h2 className="mt-1 text-lg font-bold text-[#1D1D1D]">
            2인 협동 AI 촬영 ({cuts.length} / 4컷)
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-12 items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-[#1D1D1D] hover:bg-slate-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span>닫기</span>
        </button>
      </div>

      {/* 카메라 프리뷰 & MediaPipe 스켈레톤 오버레이 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-[#F8FAFC]">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas
          ref={overlayCanvasRef}
          width={640}
          height={480}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {cameraState === 'DEMO' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
            <Camera className="h-10 w-10 text-[#246BEB]" aria-hidden="true" />
            <p className="mt-2 text-base font-bold text-[#1D1D1D]">
              화이트 스튜디오 시연 모드 준비 완료
            </p>
            <p className="mt-1 text-xs text-[#555555]">
              웹캠이 없는 PC나 심사장에서도 하단 폴백 버튼으로 1080×1920 네컷과
              보급소 쿠폰을 즉시 시연할 수 있습니다.
            </p>
          </div>
        )}

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#246BEB] text-5xl font-bold text-white shadow-xl">
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* 실시간 포즈 일치도 게이지 바 (80% 이상 1.5초 유지 시 자동 3-2-1 카운트다운) */}
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="inline-flex items-center gap-1 text-[#047857]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>포즈 일치도 (목표 80% · 1.5초 유지)</span>
          </span>
          <span
            className={cn(
              confidencePercent >= AUTO_HOLD_CONFIDENCE
                ? 'text-[#047857]'
                : 'text-[#246BEB]',
            )}
          >
            {confidencePercent}%
            {holdProgressMs > 0 ? ` (${holdSeconds}s / 1.5s)` : ''}
          </span>
        </div>

        <div
          className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={confidencePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`포즈 일치도 ${confidencePercent}%`}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-150',
              confidencePercent >= AUTO_HOLD_CONFIDENCE
                ? 'bg-[#047857]'
                : 'bg-[#246BEB]',
            )}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>

        <p className="text-xs font-bold text-[#1D1D1D]">
          {cameraState === 'READY'
            ? `인식 인원: ${poseResult.detectedPeople}명 · ${poseResult.feedback}`
            : aiStatusText}
        </p>
      </div>

      {/* 4컷 촬영 진행 썸네일 */}
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-[#555555]"
          >
            {cuts[idx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cuts[idx]}
                alt={`${idx + 1}번째 촬영 컷`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{idx + 1}컷</span>
            )}
          </div>
        ))}
      </div>

      {/* 심사장 폴백 버튼 (3-2-1 1컷 캡처 + 4컷 자동 완성) */}
      <div className="space-y-2">
        <ActionButton
          tone="krds"
          fullWidth
          disabled={isSafetyLocked || countdown !== null || isComposing}
          loading={isComposing}
          leadingIcon={<Timer className="h-5 w-5" aria-hidden="true" />}
          onClick={startCountdownCapture}
        >
          {isComposing
            ? '1080×1920 네컷·바코드 합성 중...'
            : `데모 포즈 자동 캡처(시연용 · 3-2-1 · ${cuts.length + 1}/4컷)`}
        </ActionButton>

        <ActionButton
          tone="stage1"
          fullWidth
          disabled={isSafetyLocked || isComposing}
          leadingIcon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          onClick={handleDemoAutoCaptureAll}
        >
          4컷 즉시 완성 &amp; 원정대 보급소 쿠폰 합성
        </ActionButton>
      </div>
    </section>
  );
}
