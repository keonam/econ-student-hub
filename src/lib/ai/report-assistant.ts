import type { AiResponsePayload, ReportAssistantDraft, ReportAssistantInput } from "@/types/ai";

export const reportAssistantSections = [
  "리포트 제목 후보 5개",
  "핵심 연구 질문",
  "주장/가설 정리",
  "목차 초안",
  "각 장에 들어갈 내용",
  "필요한 데이터",
  "참고할 만한 자료 유형",
  "분석 방법 제안",
  "예상 반론",
  "결론 방향",
  "발표용 요약",
  "윤리적 사용 안내"
] as const;

export const reportStatuses = ["아이디어", "자료조사", "초안", "수정", "제출"] as const;

export const plagiarismChecklist = [
  "AI가 만든 문장을 그대로 제출하지 않고 내 문장으로 다시 쓴다.",
  "통계, 주장, 사례는 원 출처를 확인한다.",
  "인용한 문장과 데이터에는 출처를 표시한다.",
  "교수님 요구사항과 학교 표절 규정을 확인한다.",
  "최종 결론은 내가 이해하고 책임질 수 있는 주장으로 정리한다."
];

export function buildReportAssistantInput(input: ReportAssistantInput) {
  return [
    `과목명: ${input.courseName || "미정"}`,
    `리포트 주제: ${input.topic || "미정"}`,
    `분량: ${input.length || "미정"}`,
    `마감일: ${input.dueDate || "미정"}`,
    "교수님 요구사항:",
    input.requirements || "제공되지 않음",
    "",
    "현재 생각한 주장 또는 가설:",
    input.currentClaim || "제공되지 않음",
    "",
    "사용하고 싶은 데이터 또는 사례:",
    input.dataOrCases || "제공되지 않음"
  ].join("\n");
}

export function buildReportAssistantDraft({
  input,
  response
}: {
  input: ReportAssistantInput;
  response: AiResponsePayload;
}): ReportAssistantDraft {
  const aiPlan = {
    output: response.output,
    titleCandidates: extractSection(response.output, "리포트 제목 후보 5개"),
    researchQuestion: extractSection(response.output, "핵심 연구 질문"),
    hypothesis: extractSection(response.output, "주장/가설 정리"),
    outline: extractSection(response.output, "목차 초안"),
    chapterPlan: extractSection(response.output, "각 장에 들어갈 내용"),
    requiredData: extractSection(response.output, "필요한 데이터"),
    sourceTypes: extractSection(response.output, "참고할 만한 자료 유형"),
    analysisMethods: extractSection(response.output, "분석 방법 제안"),
    counterarguments: extractSection(response.output, "예상 반론"),
    conclusionDirection: extractSection(response.output, "결론 방향"),
    presentationSummary: extractSection(response.output, "발표용 요약"),
    model: response.model,
    generatedAt: response.createdAt
  };

  return {
    ...input,
    aiPlan,
    todoTitles: buildReportTodos(input)
  };
}

function buildReportTodos(input: ReportAssistantInput) {
  const topic = input.topic || "리포트";

  return [
    `${topic} 연구 질문 1개로 좁히기`,
    "교수님 요구사항 체크하고 평가 기준 표시하기",
    "핵심 참고자료 5개 찾고 출처 기록하기",
    "사용할 데이터 또는 사례의 신뢰도 확인하기",
    "목차별 핵심 문장 1개씩 작성하기",
    "초안 작성 후 예상 반론 보강하기",
    "인용/참고문헌 형식과 표절 체크리스트 확인하기"
  ];
}

function extractSection(markdown: string, heading: string) {
  const escapedHeading = escapeRegExp(heading);
  const pattern = new RegExp(
    `(?:^|\\n)#{1,3}\\s*${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n#{1,3}\\s|$)`,
    "i"
  );
  const match = markdown.match(pattern);

  return match?.[1]?.trim() ?? "";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
