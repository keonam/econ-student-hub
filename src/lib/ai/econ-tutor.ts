import type { EconTutorAnswerStyle, EconTutorCategory } from "@/types/ai";

export const econTutorAnswerSections = [
  "한 줄 요약",
  "쉬운 설명",
  "경제학적 직관",
  "관련 공식 또는 그래프 설명",
  "현실 사례",
  "시험에 나올 포인트",
  "자주 하는 오해",
  "추가로 공부할 키워드"
] as const;

export const econTutorAnswerStyles = [
  {
    id: "highSchool",
    label: "고등학생도 이해하기 쉽게",
    shortLabel: "고등학생",
    description: "전문용어를 풀어 쓰고 생활 예시를 많이 사용",
    promptInstruction:
      "고등학생도 이해할 수 있게 전문용어를 풀어 쓰고, 직관과 생활 예시를 먼저 설명하세요."
  },
  {
    id: "freshman",
    label: "대학교 1학년 수준",
    shortLabel: "1학년",
    description: "원론 수준 개념과 기본 그래프 중심",
    promptInstruction:
      "경제학원론을 듣는 대학교 1학년 수준으로 기본 개념, 그래프, 용어를 균형 있게 설명하세요."
  },
  {
    id: "examSummary",
    label: "시험 대비 요약",
    shortLabel: "시험 대비",
    description: "정의, 조건, 비교, 함정 위주로 압축",
    promptInstruction:
      "시험 직전 복습용으로 정의, 조건, 비교 포인트, 함정을 간결하게 정리하세요."
  },
  {
    id: "interview",
    label: "면접 답변용",
    shortLabel: "면접",
    description: "구두 답변에 적합한 흐름과 사례 중심",
    promptInstruction:
      "경제/금융/리서치 면접에서 말할 수 있게 30초 답변 구조와 현실 사례를 강조하세요."
  },
  {
    id: "formulaFocused",
    label: "수식 중심 설명",
    shortLabel: "수식",
    description: "변수, 공식, 그래프 이동을 자세히 설명",
    promptInstruction:
      "수식, 변수 의미, 그래프 축과 곡선 이동, 비교정태를 자세히 설명하세요."
  }
] as const satisfies Array<{
  id: EconTutorAnswerStyle;
  label: string;
  shortLabel: string;
  description: string;
  promptInstruction: string;
}>;

export const econTutorCategories = [
  {
    id: "microeconomics",
    label: "미시경제학",
    description: "수요와 공급, 소비자/기업, 시장구조"
  },
  {
    id: "macroeconomics",
    label: "거시경제학",
    description: "GDP, 인플레이션, 실업, IS-LM"
  },
  {
    id: "econometrics",
    label: "계량경제학",
    description: "회귀분석, 추정, 가설검정"
  },
  {
    id: "internationalEconomics",
    label: "국제경제학",
    description: "무역, 환율, 국제수지"
  },
  {
    id: "financialEconomics",
    label: "금융경제학",
    description: "금리, 채권, 위험, 금융시장"
  },
  {
    id: "economicHistory",
    label: "경제사",
    description: "제도, 성장, 위기, 역사적 맥락"
  },
  {
    id: "policyAnalysis",
    label: "정책분석",
    description: "정책 효과, 비용편익, 평가"
  }
] as const satisfies Array<{
  id: EconTutorCategory;
  label: string;
  description: string;
}>;

export const econTutorTopicExamples = [
  "수요와 공급",
  "탄력성",
  "GDP",
  "인플레이션",
  "실업률",
  "IS-LM",
  "필립스곡선",
  "게임이론",
  "회귀분석"
];

export function isEconTutorAnswerStyle(value: unknown): value is EconTutorAnswerStyle {
  return econTutorAnswerStyles.some((style) => style.id === value);
}

export function isEconTutorCategory(value: unknown): value is EconTutorCategory {
  return econTutorCategories.some((category) => category.id === value);
}

export function getEconTutorStyleLabel(styleId?: EconTutorAnswerStyle) {
  return econTutorAnswerStyles.find((style) => style.id === styleId)?.label ?? "";
}

export function getEconTutorStyleInstruction(styleId?: EconTutorAnswerStyle) {
  return econTutorAnswerStyles.find((style) => style.id === styleId)?.promptInstruction ?? "";
}

export function getEconTutorCategoryLabel(categoryId?: EconTutorCategory) {
  return econTutorCategories.find((category) => category.id === categoryId)?.label ?? "";
}
