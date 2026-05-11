export type AssignmentStatus = "대기" | "진행 중" | "완료";

export type CourseAssignment = {
  id: string;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  notes: string;
};

export type CourseExam = {
  id: string;
  title: string;
  date: string;
  type: string;
  notes: string;
};

export type Course = {
  id: string;
  name: string;
  professor: string;
  schedule: string;
  room: string;
  resourceLink: string;
  assignments: CourseAssignment[];
  exams: CourseExam[];
};

export type EconNewsItem = {
  id: string;
  title: string;
  url: string;
  tags: string[];
  summary: string;
  concepts: string;
  note?: string;
  aiAnalysis?: EconNewsAiAnalysis;
  savedAt: string;
};

export type EconNewsAiAnalysis = {
  output: string;
  threeLineSummary: string;
  coreIssue: string;
  concepts: string;
  stakeholders: string;
  shortTermImpact: string;
  longTermImpact: string;
  perspectives: string;
  reportSentence: string;
  interviewAnswer: string;
  recommendedTags: string[];
  analyzedAt: string;
  model: string;
  sourceType: "url" | "text";
};

export type ResearchLogItem = {
  id: string;
  title: string;
  sourceLink: string;
  question: string;
  data: string;
  notes: string;
  createdAt: string;
};

export type PortfolioProject = {
  id: string;
  name: string;
  description: string;
  tools: string;
  resultLink: string;
  githubLink: string;
  updatedAt: string;
};

export type DataProjectPortfolioCard = {
  projectName: string;
  problemDefinition: string;
  data: string;
  method: string;
  keyResult: string;
  visualizationUrl: string;
  githubUrl: string;
  lessons: string;
};

export type DataProjectAiPlan = {
  output: string;
  topicIdeas: string;
  topicDetails: string;
  variables: string;
  methods: string;
  limitations: string;
  portfolioDraft: string;
  nextSteps: string;
  model: string;
  generatedAt: string;
};

export type DataProject = {
  id: string;
  interestArea: string;
  selectedTopic: string;
  researchQuestion: string;
  dataPlan: string;
  independentVariables: string;
  dependentVariable: string;
  controlVariables: string;
  analysisMethod: string;
  limitations: string;
  portfolioCard: DataProjectPortfolioCard;
  aiPlan?: DataProjectAiPlan;
  createdAt: string;
  updatedAt: string;
};

export type CareerPath =
  | "금융권"
  | "공공기관"
  | "컨설팅"
  | "리서치"
  | "데이터분석"
  | "대학원"
  | "일반 기업";

export type CareerAiAnalysis = {
  output: string;
  targetCareer: CareerPath;
  skills: string;
  experiences: string;
  jobPosting: string;
  roadmap: string;
  skillGap: string;
  recommendedProjects: string;
  coverLetterMaterials: string;
  interviewQuestions: string;
  starAnswerDraft: string;
  connectionPoints: string;
  model: string;
  generatedAt: string;
};

export type CareerItem = {
  id: string;
  name: string;
  type: "인턴십" | "공모전" | "자격증" | "대외활동";
  deadline: string;
  status: "관심" | "준비 중" | "지원 완료" | "면접" | "합격" | "보류";
  documents: string;
  notes: string;
  organization?: string;
  role?: string;
  targetCareer?: CareerPath;
  coverLetterDraft?: string;
  interviewReview?: string;
  nextAction?: string;
  aiAnalysis?: CareerAiAnalysis;
};

export type ReportStatus = "아이디어" | "자료조사" | "초안" | "수정" | "제출";

export type ReportTodo = {
  id: string;
  title: string;
  isDone: boolean;
};

export type ReportAiPlan = {
  output: string;
  titleCandidates: string;
  researchQuestion: string;
  hypothesis: string;
  outline: string;
  chapterPlan: string;
  requiredData: string;
  sourceTypes: string;
  analysisMethods: string;
  counterarguments: string;
  conclusionDirection: string;
  presentationSummary: string;
  model: string;
  generatedAt: string;
};

export type ReportProject = {
  id: string;
  courseName: string;
  topic: string;
  length: string;
  dueDate: string;
  requirements: string;
  currentClaim: string;
  dataOrCases: string;
  status: ReportStatus;
  todos: ReportTodo[];
  aiPlan: ReportAiPlan;
  createdAt: string;
  updatedAt: string;
};

export type HubData = {
  courses: Course[];
  news: EconNewsItem[];
  research: ResearchLogItem[];
  portfolio: PortfolioProject[];
  careers: CareerItem[];
  reports: ReportProject[];
  dataProjects: DataProject[];
};
