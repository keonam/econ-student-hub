import type { AiFeature, AiFeatureDefinition, AiRequestContext, AiRequestPayload } from "@/types/ai";
import {
  econTutorAnswerSections,
  getEconTutorCategoryLabel,
  getEconTutorStyleInstruction,
  getEconTutorStyleLabel,
  isEconTutorAnswerStyle,
  isEconTutorCategory
} from "@/lib/ai/econ-tutor";
import {
  newsExplainerRecommendedTags,
  newsExplainerSections
} from "@/lib/ai/news-explainer";
import { reportAssistantSections } from "@/lib/ai/report-assistant";
import {
  analysisMethodOptions,
  dataProjectCoachSections
} from "@/lib/ai/data-project-coach";
import {
  careerCoachSections,
  careerPathOptions,
  careerSkillExamples
} from "@/lib/ai/career-coach";

const sharedRules = [
  "You are an AI academic and career assistant for Korean economics undergraduates.",
  "Answer in Korean unless the user asks for another language.",
  "Be accurate, structured, and practical for coursework, exams, interviews, and early career planning.",
  "When uncertain, say what assumption you are making instead of inventing facts.",
  "Do not claim to have opened external links; ask the user to paste article text when URL content is not provided."
].join("\n");

const maxAiInputLength = 12000;
const maxContextTextLength = 700;

export const aiFeatureDefinitions: Record<AiFeature, AiFeatureDefinition> = {
  econTutor: {
    id: "econTutor",
    label: "AI Econ Tutor",
    description: "경제학 개념을 쉬운 설명, 수식, 예시, 시험 대비 포인트로 정리합니다.",
    systemPrompt: [
      sharedRules,
      "Focus on economics tutoring.",
      "Always answer with the exact Markdown headings below, in this exact order:",
      ...econTutorAnswerSections.map((section) => `## ${section}`),
      "Keep each section concise, but include enough detail to be useful for a Korean undergraduate economics student.",
      "For formulas, define every symbol. For graph explanations, name the axes and explain curve shifts."
    ].join("\n")
  },
  newsExplainer: {
    id: "newsExplainer",
    label: "AI News Explainer",
    description: "경제 뉴스의 핵심 이슈, 관련 개념, 말하기 포인트, 태그를 제안합니다.",
    systemPrompt: [
      sharedRules,
      "Focus on explaining economic news.",
      "Base the analysis only on the article text or title/URL explicitly provided by the user.",
      "Every substantive claim must be framed as '기사 내용 기준' or with an equivalent caveat.",
      "If only a URL is provided and no article body is included, clearly state that you cannot directly read the URL content and ask the user to paste the article body for a more reliable analysis.",
      "Do not provide investment advice, trading recommendations, or price predictions.",
      "Always answer with the exact Markdown headings below, in this exact order:",
      ...newsExplainerSections.map((section) => `## ${section}`),
      `For 추천 태그, choose from this vocabulary when possible: ${newsExplainerRecommendedTags.join(", ")}.`,
      "The 주의 문구 section must include: 기사 내용 기준의 학습용 분석이며 투자 조언이 아닙니다."
    ].join("\n")
  },
  researchAssistant: {
    id: "researchAssistant",
    label: "AI Research Assistant",
    description: "연구 아이디어를 질문, 가설, 데이터, 분석 방법으로 발전시킵니다.",
    systemPrompt: [
      sharedRules,
      "Focus on undergraduate economics research design.",
      "Suggest research questions, hypotheses, data sources, variables, methods, and next actions."
    ].join("\n")
  },
  careerCoach: {
    id: "careerCoach",
    label: "AI Career Coach",
    description: "진로 로드맵, 지원 공고 분석, 자기소개서 소재, 면접 답변 초안을 정리합니다.",
    systemPrompt: [
      sharedRules,
      "Focus on internships, competitions, certificates, activities, resumes, cover letters, and interviews.",
      `The supported career paths are: ${careerPathOptions.join(", ")}.`,
      `Use skill examples such as ${careerSkillExamples.join(", ")} when relevant, but prioritize skills explicitly provided by the user.`,
      "Turn user experiences into honest, specific, evidence-based drafts.",
      "Do not invent experiences, awards, employers, certificates, or job requirements.",
      "If the job posting is vague, state the assumption and give a reusable analysis framework.",
      "Always answer with the exact Markdown headings below, in this exact order:",
      ...careerCoachSections.map((section) => `## ${section}`),
      "In 자기소개서 소재 정리, include a labeled line beginning with 자기소개서 초안:.",
      "In STAR 방식 답변 초안, separate Situation, Task, Action, Result clearly."
    ].join("\n")
  },
  reportAssistant: {
    id: "reportAssistant",
    label: "AI Report Assistant",
    description: "리포트 주제, 개요, 자료 조사 계획, 할 일 설계를 돕습니다.",
    systemPrompt: [
      sharedRules,
      "Focus on helping an economics undergraduate plan a report ethically.",
      "This is not a ghostwriting tool. Do not write a complete final submission.",
      "Guide the student with structure, research design, source planning, and responsible next steps.",
      "Clearly remind the student to verify sources and avoid plagiarism.",
      "Always answer with the exact Markdown headings below, in this exact order:",
      ...reportAssistantSections.map((section) => `## ${section}`),
      "The 윤리적 사용 안내 section must say this is a drafting/structuring aid, not a completed report, and must include source verification and plagiarism prevention reminders."
    ].join("\n")
  },
  dataProjectCoach: {
    id: "dataProjectCoach",
    label: "Data Project Coach",
    description: "경제 데이터 분석 프로젝트의 주제, 변수, 방법, 포트폴리오 카드를 설계합니다.",
    systemPrompt: [
      sharedRules,
      "Focus on economics data analysis projects for undergraduate portfolios.",
      "Recommend feasible projects using public datasets such as ECOS, KOSIS, FRED, World Bank, OECD Data, and IMF Data.",
      "Keep the answer compact enough for a single web response. Use short bullets, avoid long paragraphs, and do not over-explain.",
      "For the five project ideas, write one concise bullet per idea with the research question, data, and method in the same bullet.",
      `Use analysis methods such as ${analysisMethodOptions.join(", ")} when appropriate.`,
      "Do not fabricate actual empirical results. If a result is not known, write a placeholder or explain what result would be tested.",
      "Always answer with the exact Markdown headings below, in this exact order:",
      ...dataProjectCoachSections.map((section) => `## ${section}`),
      "In 포트폴리오 카드 초안, include labeled lines for 프로젝트명, 문제 정의, 사용 데이터, 분석 방법, 핵심 결과, 시각화 이미지 링크, GitHub 링크, 배운 점."
    ].join("\n")
  }
};

const tutorModes = ["easy", "formula", "exam"] as const;

export function buildAiPrompt(payload: AiRequestPayload) {
  const modeInstruction =
    payload.feature === "econTutor" && payload.mode
      ? `튜터 모드: ${getTutorModeLabel(payload.mode)}`
      : "";
  const styleInstruction =
    payload.feature === "econTutor" && payload.answerStyle
      ? [
          `답변 스타일: ${getEconTutorStyleLabel(payload.answerStyle)}`,
          getEconTutorStyleInstruction(payload.answerStyle)
        ].join("\n")
      : "";
  const categoryInstruction =
    payload.feature === "econTutor" && payload.category
      ? `주제 카테고리: ${getEconTutorCategoryLabel(payload.category)}`
      : "";
  const newsSourceInstruction =
    payload.feature === "newsExplainer"
      ? [
          `입력 유형: ${payload.sourceType === "url" ? "URL" : "기사 텍스트"}`,
          payload.articleTitle ? `기사 제목: ${payload.articleTitle}` : "",
          payload.sourceUrl ? `원문 URL: ${payload.sourceUrl}` : ""
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  return [
    modeInstruction,
    styleInstruction,
    categoryInstruction,
    newsSourceInstruction,
    "사용자 입력:",
    payload.input.trim(),
    "",
    "앱 컨텍스트 요약:",
    summarizeContext(payload.context)
  ]
    .filter(Boolean)
    .join("\n");
}

export function validateAiRequestPayload(value: unknown): AiRequestPayload {
  if (!value || typeof value !== "object") {
    throw new Error("요청 형식이 올바르지 않습니다.");
  }

  const payload = value as Partial<AiRequestPayload>;

  if (!payload.feature || !aiFeatureDefinitions[payload.feature]) {
    throw new Error("지원하지 않는 AI 기능입니다.");
  }

  if (!payload.input || typeof payload.input !== "string" || !payload.input.trim()) {
    throw new Error("AI에게 전달할 입력을 작성해주세요.");
  }

  const input = payload.input.trim();

  if (input.length > maxAiInputLength) {
    throw new Error(
      `입력이 너무 깁니다. ${maxAiInputLength.toLocaleString("ko-KR")}자 이하로 줄여주세요.`
    );
  }

  if (payload.mode && !tutorModes.includes(payload.mode)) {
    throw new Error("지원하지 않는 튜터 모드입니다.");
  }

  if (payload.answerStyle && !isEconTutorAnswerStyle(payload.answerStyle)) {
    throw new Error("지원하지 않는 답변 스타일입니다.");
  }

  if (payload.category && !isEconTutorCategory(payload.category)) {
    throw new Error("지원하지 않는 주제 카테고리입니다.");
  }

  if (
    payload.sourceType &&
    payload.sourceType !== "url" &&
    payload.sourceType !== "text"
  ) {
    throw new Error("지원하지 않는 뉴스 입력 방식입니다.");
  }

  return {
    feature: payload.feature,
    input,
    mode: payload.mode,
    answerStyle: payload.answerStyle,
    category: payload.category,
    sourceType: payload.sourceType,
    sourceUrl: payload.sourceUrl,
    articleTitle: payload.articleTitle,
    context: payload.context
  };
}

function getTutorModeLabel(mode: NonNullable<AiRequestPayload["mode"]>) {
  const labels = {
    easy: "쉬운 설명 중심",
    formula: "수식과 그래프 해석 중심",
    exam: "시험 대비 요약 중심"
  };

  return labels[mode];
}

function summarizeContext(context?: AiRequestContext) {
  if (!context) {
    return "없음";
  }

  return JSON.stringify(
    {
      courses: sanitizeContextItems(context.courses?.slice(0, 6)),
      recentNews: sanitizeContextItems(context.recentNews?.slice(0, 5)),
      researchIdeas: sanitizeContextItems(context.researchIdeas?.slice(0, 5)),
      portfolioProjects: sanitizeContextItems(context.portfolioProjects?.slice(0, 5)),
      careerItems: sanitizeContextItems(context.careerItems?.slice(0, 5))
    },
    null,
    2
  );
}

function sanitizeContextItems<T extends Record<string, unknown>>(items: T[] | undefined) {
  return items?.map((item) =>
    Object.fromEntries(
      Object.entries(item).map(([key, value]) => [
        key,
        typeof value === "string" ? truncateContextText(value) : value
      ])
    )
  );
}

function truncateContextText(value: string) {
  return value.length > maxContextTextLength
    ? `${value.slice(0, maxContextTextLength)}...`
    : value;
}
