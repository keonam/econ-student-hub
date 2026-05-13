import { NextResponse } from "next/server";
import type { AiErrorPayload, AiResponsePayload } from "@/types/ai";
import {
  aiFeatureDefinitions,
  buildAiPrompt,
  validateAiRequestPayload
} from "@/lib/ai/features";
import { createAiCompletion } from "@/lib/ai/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json<AiErrorPayload>(
      { error: "요청 JSON을 읽을 수 없습니다." },
      { status: 400 }
    );
  }

  let payload;

  try {
    payload = validateAiRequestPayload(rawPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "요청 형식이 올바르지 않습니다.";

    return NextResponse.json<AiErrorPayload>({ error: message }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5";

  if (!apiKey) {
    return NextResponse.json<AiErrorPayload>(
      {
        error:
          "AI 기능을 사용하려면 서버 환경변수 OPENAI_API_KEY가 필요합니다. EC2 서버의 .env.local에 설정한 뒤 앱을 재시작해주세요."
      },
      { status: 503 }
    );
  }

  try {
    const feature = aiFeatureDefinitions[payload.feature];
    const output = await createAiCompletion({
      apiKey,
      model,
      instructions: feature.systemPrompt,
      input: buildAiPrompt(payload)
    });

    return NextResponse.json<AiResponsePayload>({
      feature: payload.feature,
      output,
      model,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("시간이 초과")
        ? error.message
        : "AI 서비스 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";

    return NextResponse.json<AiErrorPayload>({ error: message }, { status: 502 });
  }
}
