import { REGION_CONFIG } from '@/config/region.config';

export interface PrGenerateInput {
  eventName: string;
  eventDate: string;
  location: string;
  targetAudience: string;
  details: string;
}

export interface PrFourWayOutput {
  homeLetter: string;
  elevatorNotice: string;
  pressRelease: string;
  cardNewsHeadline: string;
  cardNewsSubtext: string;
  cardNewsBullets: string[];
  mode: 'gemini' | 'template';
}

function buildTemplatePr(input: PrGenerateInput): PrFourWayOutput {
  const region = REGION_CONFIG.displayName;
  const shortRegion = REGION_CONFIG.shortName;

  const homeLetter = `[${shortRegion} 우리동네 3GO 마을교육 가정통신문]

학부모님, 안녕하십니까?
우리 아이와 이웃이 함께 안전하고 따뜻하게 어울리는 '${input.eventName}'을 아래와 같이 무료로 운영합니다.

1. 일시: ${input.eventDate}
2. 장소: ${input.location}
3. 참여 대상: ${input.targetAudience}
4. 주요 내용: ${input.details}
5. 참가비: 전액 무료 (강사료·렌탈비 0원 공공 리빙랩 운영)

※ 우리동네 3GO 앱에서 1클릭으로 간편 신청하실 수 있으며, 완주 시 인근 골목 상권(원정대 보급소) 할인 쿠폰도 함께 제공됩니다. 많은 참여 부탁드립니다.`;

  const elevatorNotice = `📢 [${shortRegion} 이웃 안내] ${input.eventName}

✅ 언제: ${input.eventDate}
✅ 어디서: ${input.location}
✅ 누가: ${input.targetAudience} (참가비 무료!)

💡 무엇을 하나요?
${input.details}

📱 신청 방법: 휴대폰에서 '우리동네 3GO' 접속 ➔ 살피·인사 탭 1클릭 예약
(문의: ${REGION_CONFIG.publicApi.districtOfficeName} 마을 리빙랩 지원팀)`;

  const pressRelease = `[보도자료] ${region}, 주민 주도 0원 마을 안심 플랫폼으로 '${input.eventName}' 개최

- 공공기관 무료 출장 및 온디바이스 AI 기반 '우리동네 3GO' 리빙랩 실증
- ${input.eventDate}, ${input.location}에서 ${input.targetAudience} 대상 무료 운영

${region} 마을안심 TF는 오는 ${input.eventDate} ${input.location}에서 세대 통합형 마을 프로그램 '${input.eventName}'을 개최한다고 밝혔다.

이번 행사는 ${input.details} 등을 중심으로 구성되었으며, 신규 렌탈비 없이 기존 공공시설과 골목 상권(원정대 보급소)을 연계해 예산 효율성과 지역 상생 효과를 동시에 높였다.

${REGION_CONFIG.publicApi.districtOfficeName} 관계자는 "주민 참여예산의 투명한 공개와 0원 오픈소스 기술을 결합해 누구나 쉽게 참여할 수 있는 생활 밀착형 안심 공동체 모델을 확산해 나가겠다"고 전했다.`;

  return {
    homeLetter,
    elevatorNotice,
    pressRelease,
    cardNewsHeadline: input.eventName,
    cardNewsSubtext: `${input.eventDate} · ${input.location}`,
    cardNewsBullets: [
      `대상: ${input.targetAudience} (참가비 0원)`,
      input.details.slice(0, 44),
      `${shortRegion} 우리동네 3GO 앱에서 1클릭 신청`,
    ],
    mode: 'template',
  };
}

/**
 * Gemini 무료 티어 API를 호출해 4-Way 홍보문을 생성합니다.
 * GEMINI_API_KEY가 없거나 API 호출이 실패하면 완성도 높은 공공 템플릿으로 즉시 폴백합니다.
 */
export async function generateFourWayPr(
  input: PrGenerateInput,
): Promise<PrFourWayOutput> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return buildTemplatePr(input);
  }

  try {
    const prompt = `당신은 ${REGION_CONFIG.displayName} 공공 리빙랩 홍보 담당자입니다.
다음 행사 정보를 바탕으로 JSON만 반환하세요.
행사명: ${input.eventName}
일시: ${input.eventDate}
장소: ${input.location}
대상: ${input.targetAudience}
내용: ${input.details}

JSON 스키마:
{
  "homeLetter": "가정통신문 전문",
  "elevatorNotice": "아파트 엘리베이터 공고문 전문",
  "pressRelease": "언론 보도자료 초안 전문",
  "cardNewsHeadline": "카드뉴스 큰 제목(22자 이내)",
  "cardNewsSubtext": "일시 및 장소 요약",
  "cardNewsBullets": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const json = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('EMPTY_GEMINI_TEXT');
    }

    const parsed = JSON.parse(rawText) as Partial<PrFourWayOutput>;
    const fallback = buildTemplatePr(input);

    return {
      homeLetter: parsed.homeLetter || fallback.homeLetter,
      elevatorNotice: parsed.elevatorNotice || fallback.elevatorNotice,
      pressRelease: parsed.pressRelease || fallback.pressRelease,
      cardNewsHeadline: parsed.cardNewsHeadline || fallback.cardNewsHeadline,
      cardNewsSubtext: parsed.cardNewsSubtext || fallback.cardNewsSubtext,
      cardNewsBullets:
        Array.isArray(parsed.cardNewsBullets) && parsed.cardNewsBullets.length > 0
          ? parsed.cardNewsBullets.slice(0, 3)
          : fallback.cardNewsBullets,
      mode: 'gemini',
    };
  } catch (error) {
    console.warn('[AI Agent] Gemini 호출 실패 ➔ 템플릿 폴백:', error);
    return buildTemplatePr(input);
  }
}
