import type { AiErrorPayload, AiRequestPayload, AiResponsePayload } from "@/types/ai";

type AiClientPayload = Pick<AiRequestPayload, "feature" | "input"> &
  Partial<Omit<AiRequestPayload, "feature" | "input">>;

export async function requestAiResponse(
  payload: AiClientPayload,
  fallbackMessage = "AI 응답 생성에 실패했습니다."
) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await readAiJson(response);

  if (!response.ok || "error" in result) {
    throw new Error("error" in result ? result.error : fallbackMessage);
  }

  return result;
}

async function readAiJson(response: Response): Promise<AiResponsePayload | AiErrorPayload> {
  try {
    return (await response.json()) as AiResponsePayload | AiErrorPayload;
  } catch {
    return {
      error: response.ok
        ? "AI 응답 형식을 읽을 수 없습니다."
        : "AI 서버 응답을 읽을 수 없습니다."
    };
  }
}
