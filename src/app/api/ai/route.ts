import { NextResponse } from "next/server";
import type { AiErrorPayload, AiRequestPayload, AiResponsePayload, EconTutorMode } from "@/types/ai";
import {
  aiFeatureDefinitions,
  buildAiPrompt,
  validateAiRequestPayload
} from "@/lib/ai/features";
import {
  getEconTutorCategoryLabel,
  getEconTutorStyleInstruction,
  getEconTutorStyleLabel
} from "@/lib/ai/econ-tutor";
import { createAiCompletion } from "@/lib/ai/openai";

export const runtime = "nodejs";
export const maxDuration = 300;

const econTutorModeLabels: Record<EconTutorMode, string> = {
  easy: "쉬운 설명 중심",
  formula: "수식과 그래프 해석 중심",
  exam: "시험 대비 요약 중심"
};

export async function POST(request: Request) {
  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return jsonError("요청 JSON을 읽을 수 없습니다.", 400);
  }

  let payload: AiRequestPayload;

  try {
    payload = validateAiRequestPayload(rawPayload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "요청 형식이 올바르지 않습니다.";

    return jsonError(message, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5";
  const promptId = getPromptId(payload.feature);

  if (!apiKey) {
    return jsonError(
      "AI 기능을 사용하려면 서버 환경변수 OPENAI_API_KEY가 필요합니다. EC2 서버의 .env.local에 설정한 뒤 앱을 재시작해주세요.",
      503
    );
  }

  if (isPromptBuilderFeature(payload.feature) && !promptId) {
    return jsonError(
      `${getFeatureLabel(payload.feature)}를 사용하려면 서버 환경변수 ${getPromptEnvName(payload.feature)}가 필요합니다. Prompt Builder의 Prompt ID를 EC2 .env.local에 설정한 뒤 앱을 재시작해주세요.`,
      503
    );
  }

  try {
    const feature = aiFeatureDefinitions[payload.feature];
    const output =
      promptId
        ? await createAiCompletion({
            apiKey,
            model,
            maxOutputTokens: getMaxOutputTokens(payload.feature),
            prompt: {
              id: promptId,
              variables: buildPromptVariables(payload)
            }
          })
        : await createAiCompletion({
            apiKey,
            model,
            instructions: feature.systemPrompt,
            input: buildAiPrompt(payload),
            maxOutputTokens: getMaxOutputTokens(payload.feature)
          });

    return NextResponse.json<AiResponsePayload>({
      feature: payload.feature,
      output,
      model,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    const detail = getErrorMessage(error);

    console.error("AI response generation failed", {
      feature: payload.feature,
      openAiError: detail
    });

    return jsonError(
      "AI 서비스 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
      502,
      detail
    );
  }
}

function buildEconTutorPromptVariables(payload: AiRequestPayload) {
  const level = payload.answerStyle
    ? getEconTutorStyleLabel(payload.answerStyle)
    : "대학교 1학년 수준";
  const mode =
    (payload.mode ? econTutorModeLabels[payload.mode] : undefined) ??
    (payload.answerStyle ? getEconTutorStyleInstruction(payload.answerStyle) : undefined) ??
    "경제학 개념을 쉽게 설명";
  const category = payload.category ? getEconTutorCategoryLabel(payload.category) : "경제학";

  return {
    question: payload.input,
    level,
    mode,
    category
  };
}

function buildPromptVariables(payload: AiRequestPayload) {
  if (payload.feature === "econTutor") {
    return buildEconTutorPromptVariables(payload);
  }

  return payload.promptVariables ?? {
    input: payload.input
  };
}

function getPromptId(feature: AiRequestPayload["feature"]) {
  const envName = getPromptEnvName(feature);

  return envName ? process.env[envName]?.trim() : undefined;
}

function getPromptEnvName(feature: AiRequestPayload["feature"]) {
  const envNames: Partial<Record<AiRequestPayload["feature"], string>> = {
    econTutor: "OPENAI_ECON_TUTOR_PROMPT_ID",
    reportAssistant: "OPENAI_REPORT_ASSISTANT_PROMPT_ID",
    newsExplainer: "OPENAI_NEWS_EXPLAINER_PROMPT_ID",
    dataProjectCoach: "OPENAI_DATA_PROJECT_COACH_PROMPT_ID",
    careerCoach: "OPENAI_CAREER_COACH_PROMPT_ID"
  };

  return envNames[feature];
}

function isPromptBuilderFeature(feature: AiRequestPayload["feature"]) {
  return Boolean(getPromptEnvName(feature));
}

function getFeatureLabel(feature: AiRequestPayload["feature"]) {
  const labels: Record<AiRequestPayload["feature"], string> = {
    econTutor: "AI Econ Tutor",
    newsExplainer: "AI News Explainer",
    researchAssistant: "AI Research Assistant",
    careerCoach: "AI Career Coach",
    reportAssistant: "AI Report Assistant",
    dataProjectCoach: "Data Project Coach"
  };

  return labels[feature];
}

function getMaxOutputTokens(feature: AiRequestPayload["feature"]) {
  const budgets: Record<AiRequestPayload["feature"], number> = {
    econTutor: 7000,
    newsExplainer: 5000,
    researchAssistant: 5000,
    careerCoach: 6000,
    reportAssistant: 7000,
    dataProjectCoach: 8000
  };

  return budgets[feature];
}

function jsonError(message: string, status: number, details?: string) {
  return NextResponse.json<AiErrorPayload>(
    {
      error: message,
      ...(process.env.NODE_ENV !== "production" && details ? { details } : {})
    },
    { status }
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
