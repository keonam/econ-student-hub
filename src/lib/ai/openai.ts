import "server-only";

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

type CreateAiCompletionInput = {
  apiKey: string;
  model: string;
  instructions: string;
  input: string;
};

export async function createAiCompletion({
  apiKey,
  model,
  instructions,
  input
}: CreateAiCompletionInput) {
  const controller = new AbortController();
  const timeoutId = windowlessSetTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        instructions,
        input,
        max_output_tokens: 1200,
        text: {
          format: {
            type: "text"
          }
        }
      })
    });

    const body = (await response.json().catch(() => ({}))) as OpenAiResponse;

    if (!response.ok) {
      throw new Error(body.error?.message ?? "AI 응답 생성에 실패했습니다.");
    }

    return extractOpenAiText(body);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("AI 응답 시간이 초과되었습니다. 입력을 줄이거나 잠시 후 다시 시도해주세요.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractOpenAiText(body: OpenAiResponse) {
  if (body.output_text) {
    return body.output_text;
  }

  const output = body.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!output) {
    throw new Error("AI 응답을 읽을 수 없습니다.");
  }

  return output;
}

function windowlessSetTimeout(handler: () => void, timeout: number) {
  return setTimeout(handler, timeout);
}
