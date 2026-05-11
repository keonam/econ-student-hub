import type {
  AiResponsePayload,
  DataProjectCoachDraft,
  DataProjectCoachInput
} from "@/types/ai";

export const dataProjectCoachSections = [
  "분석 주제 5개",
  "주제별 연구 질문 데이터 분석 방법",
  "독립변수 종속변수 통제변수",
  "분석 방법 추천",
  "주의해야 할 한계점",
  "포트폴리오 카드 초안",
  "다음 단계"
] as const;

export const dataProjectSources = [
  {
    name: "한국은행 ECOS",
    url: "https://ecos.bok.or.kr",
    description: "금리, 환율, 통화량, 물가, 국민계정 등 거시·금융 시계열"
  },
  {
    name: "KOSIS",
    url: "https://kosis.kr",
    description: "인구, 노동, 지역, 산업, 복지 등 국내 공식 통계"
  },
  {
    name: "FRED",
    url: "https://fred.stlouisfed.org",
    description: "미국과 글로벌 거시경제·금융 시계열"
  },
  {
    name: "World Bank",
    url: "https://data.worldbank.org",
    description: "국가별 개발, 성장, 무역, 인구, 사회 지표"
  },
  {
    name: "OECD Data",
    url: "https://data.oecd.org",
    description: "OECD 회원국 비교 지표와 정책 관련 데이터"
  },
  {
    name: "IMF Data",
    url: "https://www.imf.org/en/Data",
    description: "국제수지, 재정, 금융, 거시 전망 데이터"
  }
];

export const analysisMethodOptions = [
  "상관분석",
  "회귀분석",
  "시계열 분석",
  "DID",
  "패널데이터",
  "로지스틱 회귀"
];

export function buildDataProjectCoachInput(input: DataProjectCoachInput) {
  return [
    `관심 분야: ${input.interestArea || "미정"}`,
    `선택한 분석 주제: ${input.selectedTopic || "아직 선택하지 않음"}`,
    `현재 연구 질문: ${input.researchQuestion || "아직 없음"}`,
    `사용하고 싶은 데이터: ${input.dataPlan || "아직 없음"}`,
    `선호 분석 방법: ${input.analysisMethod || "아직 없음"}`,
    "",
    "요청:",
    "경제학과 학생이 포트폴리오에 넣을 수 있는 데이터 분석 프로젝트를 기획할 수 있도록 주제와 분석 설계를 제안해주세요."
  ].join("\n");
}

export function buildDataProjectCoachDraft({
  input,
  response
}: {
  input: DataProjectCoachInput;
  response: AiResponsePayload;
}): DataProjectCoachDraft {
  const topicIdeas = extractSection(response.output, "분석 주제 5개");
  const topicDetails = extractSection(response.output, "주제별 연구 질문 데이터 분석 방법");
  const variables = extractSection(response.output, "독립변수 종속변수 통제변수");
  const methods = extractSection(response.output, "분석 방법 추천");
  const limitations = extractSection(response.output, "주의해야 할 한계점");
  const portfolioDraft = extractSection(response.output, "포트폴리오 카드 초안");

  return {
    ...input,
    selectedTopic: input.selectedTopic || firstListItem(topicIdeas),
    researchQuestion: input.researchQuestion || firstQuestion(topicDetails),
    dataPlan: input.dataPlan || extractLineByLabel(topicDetails, "데이터") || "",
    analysisMethod: input.analysisMethod || firstMethod(methods),
    independentVariables: extractLineByLabel(variables, "독립변수"),
    dependentVariable: extractLineByLabel(variables, "종속변수"),
    controlVariables: extractLineByLabel(variables, "통제변수"),
    limitations,
    aiPlan: {
      output: response.output,
      topicIdeas,
      topicDetails,
      variables,
      methods,
      limitations,
      portfolioDraft,
      nextSteps: extractSection(response.output, "다음 단계"),
      model: response.model,
      generatedAt: response.createdAt
    },
    portfolioCard: {
      projectName:
        extractLineByLabel(portfolioDraft, "프로젝트명") ||
        input.selectedTopic ||
        firstListItem(topicIdeas) ||
        "데이터 분석 프로젝트",
      problemDefinition:
        extractLineByLabel(portfolioDraft, "문제 정의") ||
        input.researchQuestion ||
        firstQuestion(topicDetails),
      data: extractLineByLabel(portfolioDraft, "사용 데이터") || input.dataPlan,
      method: extractLineByLabel(portfolioDraft, "분석 방법") || firstMethod(methods),
      keyResult: extractLineByLabel(portfolioDraft, "핵심 결과"),
      visualizationUrl: extractLineByLabel(portfolioDraft, "시각화 이미지 링크"),
      githubUrl: extractLineByLabel(portfolioDraft, "GitHub 링크"),
      lessons: extractLineByLabel(portfolioDraft, "배운 점")
    }
  };
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

function extractLineByLabel(text: string, label: string) {
  const pattern = new RegExp(`${label}\\s*[:：]\\s*(.+)`, "i");
  const match = text.match(pattern);

  return match?.[1]?.trim() ?? "";
}

function firstListItem(text: string) {
  return (
    text
      .split("\n")
      .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
      .find(Boolean) ?? ""
  );
}

function firstQuestion(text: string) {
  return (
    text
      .split("\n")
      .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
      .find((line) => line.includes("?") || line.includes("어떻게") || line.includes("영향")) ??
    firstListItem(text)
  );
}

function firstMethod(text: string) {
  return analysisMethodOptions.find((method) => text.includes(method)) ?? firstListItem(text);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
