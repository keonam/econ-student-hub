import "server-only";

type OpenAiResponse = {
  id?: string;
  status?: "completed" | "failed" | "incomplete" | "cancelled" | "queued" | "in_progress";
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    code?: string;
    message?: string;
  };
  incomplete_details?: {
    reason?: string;
  };
};

type CreateAiCompletionInput = {
  apiKey: string;
  model: string;
  instructions?: string;
  input?: string;
  maxOutputTokens?: number;
  prompt?: {
    id: string;
    variables: Record<string, string>;
    version?: string;
  };
};

export async function createAiCompletion({
  apiKey,
  model,
  instructions,
  input,
  maxOutputTokens = 4000,
  prompt
}: CreateAiCompletionInput) {
  const controller = new AbortController();
  const timeoutId = windowlessSetTimeout(() => controller.abort(), 240000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify(
        buildResponsesRequestBody({
          model,
          instructions,
          input,
          maxOutputTokens,
          prompt
        })
      )
    });

    const body = (await response.json().catch(() => ({}))) as OpenAiResponse;

    if (!response.ok) {
      throw new Error(
        body.error?.message ?? `OpenAI API request failed with status ${response.status}.`
      );
    }

    assertCompletedResponse(body);

    return extractOpenAiText(body);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        "AI 응답 시간이 초과되었습니다. 입력을 줄이거나 잠시 후 다시 시도해주세요."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildResponsesRequestBody({
  model,
  instructions,
  input,
  maxOutputTokens,
  prompt
}: Omit<CreateAiCompletionInput, "apiKey">) {
  const body: Record<string, unknown> = {
    model,
    max_output_tokens: maxOutputTokens,
    text: {
      format: {
        type: "text"
      }
    }
  };

  if (prompt) {
    body.prompt = {
      id: prompt.id,
      variables: prompt.variables,
      ...(prompt.version ? { version: prompt.version } : {})
    };
  } else {
    body.instructions = instructions;
    body.input = input;
  }

  return body;
}

function assertCompletedResponse(body: OpenAiResponse) {
  if (!body.status || body.status === "completed") {
    return;
  }

  if (body.status === "incomplete") {
    const reason = body.incomplete_details?.reason ?? "unknown";
    const partialOutput = extractOpenAiText(body, { allowEmpty: true });

    console.warn("OpenAI response incomplete", {
      responseId: body.id,
      reason
    });

    if (partialOutput) {
      return;
    }
  }

  const reason =
    body.error?.message ??
    body.incomplete_details?.reason ??
    `OpenAI response ended with status ${body.status}.`;

  throw new Error(`OpenAI response ${body.status}: ${reason}`);
}

function extractOpenAiText(
  body: OpenAiResponse,
  options: { allowEmpty?: boolean } = {}
) {
  if (body.output_text) {
    return withIncompleteNotice(body, body.output_text);
  }

  const output = body.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!output && options.allowEmpty) {
    return "";
  }

  if (!output) {
    throw new Error("AI 응답 텍스트를 찾을 수 없습니다.");
  }

  return withIncompleteNotice(body, output);
}

function withIncompleteNotice(body: OpenAiResponse, output: string) {
  if (body.status !== "incomplete") {
    return output;
  }

  return `${output}\n\n---\n응답이 길어 일부만 표시되었을 수 있습니다. 질문 범위를 좁히거나 다시 시도해주세요.`;
}

function windowlessSetTimeout(handler: () => void, timeout: number) {
  return setTimeout(handler, timeout);
}
