import type {
  CareerAiAnalysis,
  CareerItem,
  CareerPath,
  Course,
  DataProjectAiPlan,
  DataProjectPortfolioCard,
  EconNewsAiAnalysis,
  EconNewsItem,
  PortfolioProject,
  ReportAiPlan,
  ResearchLogItem
} from "@/types";

export type AiFeature =
  | "econTutor"
  | "newsExplainer"
  | "researchAssistant"
  | "careerCoach"
  | "reportAssistant"
  | "dataProjectCoach";

export type EconTutorMode = "easy" | "formula" | "exam";

export type EconTutorAnswerStyle =
  | "highSchool"
  | "freshman"
  | "examSummary"
  | "interview"
  | "formulaFocused";

export type EconTutorCategory =
  | "microeconomics"
  | "macroeconomics"
  | "econometrics"
  | "internationalEconomics"
  | "financialEconomics"
  | "economicHistory"
  | "policyAnalysis";

export type AiRequestContext = {
  courses?: Pick<Course, "id" | "name" | "professor">[];
  recentNews?: Pick<EconNewsItem, "id" | "title" | "tags" | "summary" | "concepts">[];
  researchIdeas?: Pick<ResearchLogItem, "id" | "title" | "question" | "data">[];
  portfolioProjects?: Pick<PortfolioProject, "id" | "name" | "description" | "tools">[];
  careerItems?: Array<
    Pick<CareerItem, "id" | "name" | "type" | "status" | "deadline"> &
      Partial<Pick<CareerItem, "organization" | "role" | "documents" | "notes">>
  >;
};

export type AiRequestPayload = {
  feature: AiFeature;
  input: string;
  mode?: EconTutorMode;
  answerStyle?: EconTutorAnswerStyle;
  category?: EconTutorCategory;
  sourceType?: "url" | "text";
  sourceUrl?: string;
  articleTitle?: string;
  promptVariables?: Record<string, string>;
  context?: AiRequestContext;
};

export type AiResponsePayload = {
  feature: AiFeature;
  output: string;
  suggestedTags?: string[];
  model: string;
  createdAt: string;
};

export type AiErrorPayload = {
  error: string;
  details?: string;
};

export type AiFeatureDefinition = {
  id: AiFeature;
  label: string;
  description: string;
  systemPrompt: string;
};

export type AiInteractionRecord = {
  id: string;
  feature: AiFeature;
  input: string;
  output: string;
  mode?: EconTutorMode;
  answerStyle?: EconTutorAnswerStyle;
  category?: EconTutorCategory;
  model: string;
  createdAt: string;
  userId?: string;
};

export type EconTutorHistoryItem = {
  id: string;
  question: string;
  answer: string;
  category: EconTutorCategory;
  answerStyle: EconTutorAnswerStyle;
  createdAt: string;
  isFavorite: boolean;
  model: string;
};

export type NewsExplainerDraft = {
  title: string;
  url: string;
  summary: string;
  concepts: string;
  tags: string[];
  note: string;
  aiAnalysis: EconNewsAiAnalysis;
};

export type NewsExplainerSeed = {
  id: string;
  title: string;
  url: string;
  text: string;
  note?: string;
};

export type ReportAssistantInput = {
  courseName: string;
  topic: string;
  length: string;
  dueDate: string;
  requirements: string;
  currentClaim: string;
  dataOrCases: string;
};

export type ReportAssistantDraft = ReportAssistantInput & {
  aiPlan: ReportAiPlan;
  todoTitles: string[];
};

export type DataProjectCoachInput = {
  interestArea: string;
  selectedTopic: string;
  researchQuestion: string;
  dataPlan: string;
  analysisMethod: string;
};

export type DataProjectCoachDraft = DataProjectCoachInput & {
  aiPlan: DataProjectAiPlan;
  independentVariables: string;
  dependentVariable: string;
  controlVariables: string;
  limitations: string;
  portfolioCard: DataProjectPortfolioCard;
};

export type CareerCoachInput = {
  targetCareer: CareerPath;
  skills: string;
  experiences: string;
  jobPosting: string;
  organization: string;
  role: string;
  deadline: string;
};

export type CareerCoachDraft = CareerCoachInput & {
  aiAnalysis: CareerAiAnalysis;
  coverLetterDraft: string;
  interviewReview: string;
  nextAction: string;
};
