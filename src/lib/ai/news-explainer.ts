import type { AiResponsePayload, NewsExplainerDraft } from "@/types/ai";

export const newsExplainerSections = [
  "3줄 요약",
  "핵심 경제 이슈",
  "관련 경제 개념",
  "주요 이해관계자",
  "단기 영향",
  "장기 영향",
  "찬반 관점",
  "리포트/토론에서 활용할 수 있는 문장",
  "면접에서 말할 수 있는 답변 예시",
  "추천 태그",
  "주의 문구"
] as const;

export const newsExplainerRecommendedTags = [
  "금리",
  "환율",
  "물가",
  "고용",
  "무역",
  "부동산",
  "금융시장"
];

type BuildNewsDraftInput = {
  response: AiResponsePayload;
  title: string;
  url: string;
  note: string;
  sourceType: "url" | "text";
};

export function buildNewsExplainerInput({
  articleText,
  sourceType,
  sourceUrl,
  title
}: {
  articleText: string;
  sourceType: "url" | "text";
  sourceUrl: string;
  title: string;
}) {
  return [
    title ? `기사 제목: ${title}` : "기사 제목: 제공되지 않음",
    sourceUrl ? `원문 URL: ${sourceUrl}` : "원문 URL: 제공되지 않음",
    `입력 유형: ${sourceType === "url" ? "URL 중심" : "기사 본문 중심"}`,
    "",
    articleText.trim()
      ? ["기사 본문 또는 사용자가 붙여넣은 내용:", articleText.trim()].join("\n")
      : "기사 본문: 제공되지 않음. URL만 제공된 경우 URL 자체와 사용자가 입력한 제목만 기준으로 한계를 명시하세요."
  ].join("\n");
}

export function buildNewsExplainerDraft({
  note,
  response,
  sourceType,
  title,
  url
}: BuildNewsDraftInput): NewsExplainerDraft {
  const summary = extractSection(response.output, "3줄 요약");
  const concepts = extractSection(response.output, "관련 경제 개념");
  const tags = extractRecommendedTags(response.output);

  return {
    title: title.trim() || "AI 분석 경제 뉴스",
    url: url.trim(),
    summary: summary || response.output.slice(0, 220),
    concepts,
    tags,
    note: note.trim(),
    aiAnalysis: {
      output: response.output,
      threeLineSummary: summary,
      coreIssue: extractSection(response.output, "핵심 경제 이슈"),
      concepts,
      stakeholders: extractSection(response.output, "주요 이해관계자"),
      shortTermImpact: extractSection(response.output, "단기 영향"),
      longTermImpact: extractSection(response.output, "장기 영향"),
      perspectives: extractSection(response.output, "찬반 관점"),
      reportSentence: extractSection(
        response.output,
        "리포트/토론에서 활용할 수 있는 문장"
      ),
      interviewAnswer: extractSection(response.output, "면접에서 말할 수 있는 답변 예시"),
      recommendedTags: tags,
      analyzedAt: response.createdAt,
      model: response.model,
      sourceType
    }
  };
}

export function extractSection(markdown: string, heading: string) {
  const escapedHeading = escapeRegExp(heading);
  const pattern = new RegExp(
    `(?:^|\\n)#{1,3}\\s*${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n#{1,3}\\s|$)`,
    "i"
  );
  const match = markdown.match(pattern);

  return match?.[1]?.trim() ?? "";
}

export function extractRecommendedTags(markdown: string) {
  const tagSection = extractSection(markdown, "추천 태그");
  const source = tagSection || markdown;
  const normalizedTags = newsExplainerRecommendedTags.filter((tag) => source.includes(tag));

  if (normalizedTags.length) {
    return normalizedTags;
  }

  return tagSection
    .split(/[,#\n·]/)
    .map((tag) => tag.replace(/[-*]/g, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
