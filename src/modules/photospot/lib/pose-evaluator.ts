import type { PoseMissionType } from '@/db/schema';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseEvaluationResult {
  matched: boolean;
  confidence: number;
  detectedPeople: number;
  feedback: string;
}

// MediaPipe Pose Landmarker 주요 관절 인덱스
const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;

function dist2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function isStretching(person: NormalizedLandmark[]): boolean {
  const nose = person[NOSE];
  const lWrist = person[LEFT_WRIST];
  const rWrist = person[RIGHT_WRIST];
  if (!nose || !lWrist || !rWrist) return false;
  return lWrist.y < nose.y + 0.04 && rWrist.y < nose.y + 0.04;
}

/**
 * 브라우저 메모리 내 MediaPipe 랜드마크 좌표만으로 2인 협동 포즈를 판정합니다.
 * (영상 및 좌표는 절대 서버로 전송하지 않습니다.)
 */
export function evaluateCooperativePose(
  poses: NormalizedLandmark[][],
  mission: PoseMissionType,
): PoseEvaluationResult {
  const detectedPeople = poses.length;

  if (detectedPeople === 0) {
    return {
      matched: false,
      confidence: 0,
      detectedPeople: 0,
      feedback: '카메라 화면 안에 2인이 함께 서 주세요.',
    };
  }

  if (mission === 'STRETCH') {
    const stretchedCount = poses.filter(isStretching).length;
    if (detectedPeople >= 2 && stretchedCount >= 2) {
      return {
        matched: true,
        confidence: 96,
        detectedPeople,
        feedback: '2인 스트레칭 포즈 성공! 잠시 멈춰 주세요!',
      };
    }
    return {
      matched: false,
      confidence: stretchedCount > 0 ? 55 : 20,
      detectedPeople,
      feedback:
        detectedPeople < 2
          ? '1명 인식됨 — 이웃과 나란히 서서 양팔을 머리 위로 뻗어주세요.'
          : '두 분 모두 양손을 머리 위로 쭉 뻗어주세요!',
    };
  }

  if (mission === 'BIG_HEART') {
    if (detectedPeople < 2) {
      return {
        matched: false,
        confidence: 25,
        detectedPeople,
        feedback: '2인이 나란히 서서 머리 위에서 양손을 맞대어 큰 하트를 만들어 주세요.',
      };
    }
    const [p1, p2] = poses;
    const wrists1 = [p1[LEFT_WRIST], p1[RIGHT_WRIST]].filter(Boolean);
    const wrists2 = [p2[LEFT_WRIST], p2[RIGHT_WRIST]].filter(Boolean);
    const overhead =
      wrists1.some((w) => w.y < (p1[NOSE]?.y ?? 0.5) + 0.05) &&
      wrists2.some((w) => w.y < (p2[NOSE]?.y ?? 0.5) + 0.05);

    let minDist = 1;
    for (const w1 of wrists1) {
      for (const w2 of wrists2) {
        minDist = Math.min(minDist, dist2D(w1, w2));
      }
    }

    if (overhead && minDist < 0.18) {
      return {
        matched: true,
        confidence: 95,
        detectedPeople,
        feedback: '협동 큰 하트 완성! 그대로 웃어주세요!',
      };
    }
    return {
      matched: false,
      confidence: overhead ? 65 : 30,
      detectedPeople,
      feedback: '머리 위에서 두 분의 손을 조금 더 가까이 맞대어 주세요!',
    };
  }

  if (mission === 'HIGH_FIVE') {
    if (detectedPeople < 2) {
      return {
        matched: false,
        confidence: 25,
        detectedPeople,
        feedback: '2인이 마주 보거나 나란히 서서 하이파이브를 준비해 주세요.',
      };
    }
    const [p1, p2] = poses;
    const wrists1 = [p1[LEFT_WRIST], p1[RIGHT_WRIST]].filter(Boolean);
    const wrists2 = [p2[LEFT_WRIST], p2[RIGHT_WRIST]].filter(Boolean);

    let minDist = 1;
    for (const w1 of wrists1) {
      for (const w2 of wrists2) {
        minDist = Math.min(minDist, dist2D(w1, w2));
      }
    }

    if (minDist < 0.14) {
      return {
        matched: true,
        confidence: 97,
        detectedPeople,
        feedback: '힘찬 하이파이브 성공! 찰칵 촬영합니다!',
      };
    }
    return {
      matched: false,
      confidence: Math.max(20, Math.round((1 - Math.min(minDist, 0.8)) * 85)),
      detectedPeople,
      feedback: '두 분의 손을 가까이 맞대어 하이파이브해 주세요!',
    };
  }

  // MASCOT_POSE: 양손이 어깨 높이 이상으로 펼쳐진 활기찬 포즈
  const mascotReady = poses.filter((p) => {
    const lS = p[LEFT_SHOULDER];
    const rS = p[RIGHT_SHOULDER];
    const lW = p[LEFT_WRIST];
    const rW = p[RIGHT_WRIST];
    if (!lS || !rS || !lW || !rW) return false;
    return lW.y < lS.y + 0.08 && rW.y < rS.y + 0.08;
  }).length;

  return {
    matched: detectedPeople >= 2 && mascotReady >= 2,
    confidence: mascotReady >= 2 ? 94 : mascotReady * 45,
    detectedPeople,
    feedback:
      mascotReady >= 2
        ? '마스코트 포즈 완성! 찰칵 촬영합니다!'
        : '두 분 모두 양팔을 어깨 위로 활짝 펼쳐 마스코트 포즈를 취해 주세요!',
  };
}
