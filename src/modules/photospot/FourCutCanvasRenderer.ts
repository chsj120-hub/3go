import type { RegionConfig } from '@/config/region.config';
import { POSE_MISSION_LABELS, type PhotoSpotItem } from './types';

export interface MerchantCouponInfo {
  id: string;
  name: string;
  discountText: string;
  barcodePrefix: string;
}

export interface FourCutRenderInput {
  cuts: string[];
  region: RegionConfig;
  spot: PhotoSpotItem;
  merchant: MerchantCouponInfo;
}

export interface FourCutRenderResult {
  dataUrl: string;
  couponBarcode: string;
  createdAtLabel: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function generateCouponBarcode(prefix: string): string {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const randomDigits = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}-${ymd}-${randomDigits}`;
}

/**
 * 심사장 조명·PC 웹캠 미연결 상황에서 [데모 포즈 자동 캡처(시연용)]가 호출하는
 * 화이트 스튜디오 시연 컷 생성기입니다.
 */
export function createDemoPoseCut(
  cutIndex: number,
  spotName: string,
  missionLabel: string,
  regionShortName: string,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const palettes = [
    ['#EFF6FF', '#246BEB', '#1E3A8A'],
    ['#ECFDF5', '#047857', '#065F46'],
    ['#FFF7ED', '#C2410C', '#9A3412'],
    ['#F0F9FF', '#1E3A8A', '#246BEB'],
  ];
  const [bg, accent, dark] = palettes[cutIndex % palettes.length];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 640, 480);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(320, 210, 145, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.stroke();

  // 2인 협동 포즈 실루엣
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(270, 175, 28, 0, Math.PI * 2);
  ctx.arc(370, 175, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.roundRect(238, 212, 64, 72, 24);
  ctx.roundRect(338, 212, 64, 72, 24);
  ctx.fill();

  ctx.fillStyle = dark;
  ctx.font = 'bold 26px "Pretendard GOV", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`CUT ${cutIndex + 1} · ${missionLabel}`, 320, 385);

  ctx.fillStyle = '#555555';
  ctx.font = '600 20px "Pretendard GOV", sans-serif';
  ctx.fillText(`${regionShortName} · ${spotName}`, 320, 425);

  return canvas.toDataURL('image/png');
}

/** 1D 바코드 패턴을 Canvas에 선명하게 렌더링합니다. */
function drawBarcode(
  ctx: CanvasRenderingContext2D,
  code: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.fillStyle = '#1D1D1D';
  const totalBars = 56;
  const unit = width / (totalBars * 1.6);
  let cursor = x;

  for (let i = 0; i < totalBars; i += 1) {
    const charCode = code.charCodeAt(i % code.length);
    const barWidth = ((charCode + i * 7) % 3 === 0 ? 2.1 : 1.1) * unit;
    const gapWidth = ((charCode + i * 3) % 2 === 0 ? 1.0 : 1.4) * unit;
    if (cursor + barWidth > x + width) break;
    ctx.fillRect(cursor, y, barWidth, height);
    cursor += barWidth + gapWidth;
  }
}

/**
 * 4컷 촬영 완료 시 오프스크린 HTML5 Canvas(1080×1920)에
 * 4장 사진 + region.config.ts 지역 프레임 + 날짜/스팟명 +
 * 하단 '원정대 보급소' 골목 상점 할인 쿠폰 바코드를 100% 온디바이스로 합성합니다.
 */
export async function renderFourCutCanvas({
  cuts,
  region,
  spot,
  merchant,
}: FourCutRenderInput): Promise<FourCutRenderResult> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('브라우저 Canvas 2D 컨텍스트를 초기화할 수 없습니다.');
  }

  const now = new Date();
  const createdAtLabel = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const couponBarcode = generateCouponBarcode(merchant.barcodePrefix);

  // 1. 화이트 스튜디오 베이스 + region.config.ts 지역 프레임 SVG 배경 시도
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, 1080, 1920);

  const frameUrl = spot.frameAssetUrl || region.frameAssets.defaultFrameUrl;
  try {
    const frameImg = await loadImage(frameUrl);
    ctx.globalAlpha = 0.14;
    ctx.drawImage(frameImg, 0, 0, 1080, 1920);
    ctx.globalAlpha = 1;
  } catch {
    // 프레임 SVG 로드 실패 시에도 깔끔한 벡터 프레임으로 무중단 합성
  }

  ctx.strokeStyle = '#246BEB';
  ctx.lineWidth = 20;
  ctx.strokeRect(20, 20, 1040, 1880);

  // 2. 상단 KRDS 공식 지역 헤더 바
  ctx.fillStyle = '#246BEB';
  ctx.beginPath();
  ctx.roundRect(56, 56, 968, 176, 28);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 46px "Pretendard GOV", sans-serif';
  ctx.fillText(`우리동네 3GO × ${region.displayName}`, 540, 134);

  ctx.fillStyle = '#DBEAFE';
  ctx.font = '600 28px "Pretendard GOV", sans-serif';
  ctx.fillText(
    `${spot.spotName} · ${POSE_MISSION_LABELS[spot.poseMissionType]} · ${createdAtLabel}`,
    540,
    190,
  );

  // 3. 2×2 네컷 사진 렌더링
  const slots = [
    { x: 56, y: 276, w: 468, h: 492 },
    { x: 556, y: 276, w: 468, h: 492 },
    { x: 56, y: 800, w: 468, h: 492 },
    { x: 556, y: 800, w: 468, h: 492 },
  ];

  for (let i = 0; i < 4; i += 1) {
    const slot = slots[i];
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(slot.x, slot.y, slot.w, slot.h, 24);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 4;
    ctx.stroke();

    const cutSrc = cuts[i];
    if (cutSrc) {
      const img = await loadImage(cutSrc);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(slot.x + 14, slot.y + 14, slot.w - 28, slot.h - 82, 16);
      ctx.clip();
      ctx.drawImage(img, slot.x + 14, slot.y + 14, slot.w - 28, slot.h - 82);
      ctx.restore();
    }

    ctx.fillStyle = '#1D1D1D';
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px "Pretendard GOV", sans-serif';
    ctx.fillText(
      `#${i + 1}컷 · ${region.shortName}`,
      slot.x + 22,
      slot.y + slot.h - 24,
    );
  }

  // 4. 하단 '원정대 보급소' 골목 상점 할인 쿠폰 & 1D 바코드 섹션
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(56, 1344, 968, 492, 32);
  ctx.fill();
  ctx.strokeStyle = '#1E3A8A';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = '#1E3A8A';
  ctx.beginPath();
  ctx.roundRect(84, 1372, 912, 74, 18);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px "Pretendard GOV", sans-serif';
  ctx.fillText('🎁 원정대 보급소 골목 상권 할인 쿠폰 (D-7)', 540, 1420);

  ctx.fillStyle = '#1D1D1D';
  ctx.font = 'bold 42px "Pretendard GOV", sans-serif';
  ctx.fillText(merchant.name, 540, 1510);

  ctx.fillStyle = '#C2410C';
  ctx.font = 'bold 34px "Pretendard GOV", sans-serif';
  ctx.fillText(merchant.discountText, 540, 1564);

  drawBarcode(ctx, couponBarcode, 180, 1600, 720, 118);

  ctx.fillStyle = '#1D1D1D';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(couponBarcode, 540, 1758);

  ctx.fillStyle = '#555555';
  ctx.font = '600 22px "Pretendard GOV", sans-serif';
  ctx.fillText(
    '온디바이스 AI 생성 · 개인정보 서버 미전송 | 살피GO · 인사하GO · 이어지GO',
    540,
    1808,
  );

  return {
    dataUrl: canvas.toDataURL('image/png'),
    couponBarcode,
    createdAtLabel,
  };
}
