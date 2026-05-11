import type { CareerAiAnalysis, CareerPath } from "@/types";
import type {
  AiResponsePayload,
  CareerCoachDraft,
  CareerCoachInput
} from "@/types/ai";

export const careerPathOptions: CareerPath[] = [
  "금융권",
  "공공기관",
  "컨설팅",
  "리서치",
  "데이터분석",
  "대학원",
  "일반 기업"
];

export const careerSkillExamples = [
  "Python",
  "R",
  "Excel",
  "Stata",
  "SQL",
  "영어",
  "자격증"
];

export const careerExperienceExamples = [
  "동아리",
  "공모전",
  "프로젝트",
  "인턴",
  "아르바이트",
  "수업 프로젝트"
];

export const careerCoachSections = [
  "진로별 준비 로드맵",
  "부족한 역량 분석",
  "추천 프로젝트",
  "자기소개서 소재 정리",
  "면접 예상 질문",
  "STAR 방식 답변 초안",
  "지원 공고와 내 경험의 연결 포인트",
  "다음 액션"
] as const;

export function buildCareerCoachInput(input: CareerCoachInput) {
  return [
    `관심 진로: ${input.targetCareer}`,
    `지원 회사/기관: ${input.organization || "미정"}`,
    `직무: ${input.role || "미정"}`,
    `마감일: ${input.deadline || "미정"}`,
    "",
    `보유 역량: ${input.skills || "아직 정리되지 않음"}`,
    "",
    `경험: ${input.experiences || "아직 정리되지 않음"}`,
    "",
    `지원하려는 공고 내용: ${input.jobPosting || "아직 입력되지 않음"}`,
    "",
    "요청:",
    "경제학과 학생의 경험을 바탕으로 진로 준비, 지원 전략, 자기소개서 소재, 면접 답변 초안을 정리해주세요."
  ].join("\n");
}

export function buildCareerCoachDraft({
  input,
  response
}: {
  input: CareerCoachInput;
  response: AiResponsePayload;
}): CareerCoachDraft {
  const coverLetterMaterials = extractSection(response.output, "자기소개서 소재 정리");
  const interviewQuestions = extractSection(response.output, "면접 예상 질문");
  const nextAction = extractSection(response.output, "다음 액션");

  const aiAnalysis: CareerAiAnalysis = {
    output: response.output,
    targetCareer: input.targetCareer,
    skills: input.skills.trim(),
    experiences: input.experiences.trim(),
    jobPosting: input.jobPosting.trim(),
    roadmap: extractSection(response.output, "진로별 준비 로드맵"),
    skillGap: extractSection(response.output, "부족한 역량 분석"),
    recommendedProjects: extractSection(response.output, "추천 프로젝트"),
    coverLetterMaterials,
    interviewQuestions,
    starAnswerDraft: extractSection(response.output, "STAR 방식 답변 초안"),
    connectionPoints: extractSection(response.output, "지원 공고와 내 경험의 연결 포인트"),
    model: response.model,
    generatedAt: response.createdAt
  };

  return {
    ...input,
    aiAnalysis,
    coverLetterDraft:
      extractLineByLabel(coverLetterMaterials, "자기소개서 초안") ||
      firstUsefulParagraph(coverLetterMaterials),
    interviewReview: interviewQuestions,
    nextAction: firstListItem(nextAction) || firstListItem(aiAnalysis.skillGap)
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

function firstUsefulParagraph(text: string) {
  return (
    text
      .split(/\n{2,}/)
      .map((item) => item.replace(/^[-*\d.)\s]+/, "").trim())
      .find(Boolean) ?? ""
  );
}

function firstListItem(text: string) {
  return (
    text
      .split("\n")
      .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
      .find(Boolean) ?? ""
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
