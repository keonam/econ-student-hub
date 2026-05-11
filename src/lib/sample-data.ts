import type { HubData } from "@/types";
import { addDays } from "@/lib/date";

export const newsTagOptions = [
  "금리",
  "환율",
  "물가",
  "고용",
  "무역",
  "부동산",
  "금융시장"
];

export const careerTypes = ["인턴십", "공모전", "자격증", "대외활동"] as const;

export const careerStatuses = [
  "관심",
  "준비 중",
  "지원 완료",
  "면접",
  "합격",
  "보류"
] as const;

export const assignmentStatuses = ["대기", "진행 중", "완료"] as const;

export function createInitialData(): HubData {
  return {
    courses: [
      {
        id: "course-macro",
        name: "거시경제학",
        professor: "김민준",
        schedule: "화/목 10:30",
        room: "경제관 204",
        resourceLink: "https://example.com/macro",
        assignments: [
          {
            id: "assignment-macro-1",
            title: "IS-LM 모형 문제 풀이",
            dueDate: addDays(3),
            status: "진행 중",
            notes: "승수 효과와 이자율 변화 그래프 포함"
          }
        ],
        exams: [
          {
            id: "exam-macro-midterm",
            title: "중간고사",
            date: addDays(15),
            type: "필기",
            notes: "국민소득계정, 화폐시장, 재정정책"
          }
        ]
      },
      {
        id: "course-econometrics",
        name: "계량경제학",
        professor: "이서연",
        schedule: "월/수 14:00",
        room: "사회과학관 B102",
        resourceLink: "",
        assignments: [
          {
            id: "assignment-econ-1",
            title: "회귀분석 과제",
            dueDate: addDays(5),
            status: "대기",
            notes: "CSV 정리 후 OLS 결과표 제출"
          }
        ],
        exams: []
      }
    ],
    news: [
      {
        id: "news-rate",
        title: "중앙은행 기준금리 동결과 채권시장 반응",
        url: "https://example.com/rate-news",
        tags: ["금리", "금융시장"],
        summary: "금리 동결에도 향후 인하 기대가 장기금리 하락으로 반영됨.",
        concepts: "통화정책, 기대가설, 채권가격",
        savedAt: addDays(-1)
      },
      {
        id: "news-fx",
        title: "원화 환율 변동성이 수입물가에 미치는 영향",
        url: "https://example.com/fx-news",
        tags: ["환율", "물가", "무역"],
        summary: "환율 상승이 에너지·원자재 수입 가격을 통해 물가 압력을 높임.",
        concepts: "환율전가, 개방경제, 비용인상 인플레이션",
        savedAt: addDays(-2)
      }
    ],
    research: [
      {
        id: "research-youth-labor",
        title: "청년 고용률과 지역 산업구조",
        sourceLink: "https://example.com/labor-data",
        question: "지역별 산업 비중은 청년 고용률 차이를 얼마나 설명하는가?",
        data: "통계청 지역고용조사, 산업별 취업자 수",
        notes: "패널 고정효과 모형으로 확장 가능",
        createdAt: addDays(-4)
      }
    ],
    portfolio: [
      {
        id: "portfolio-inflation-dashboard",
        name: "물가 지표 대시보드",
        description: "CPI, 기대인플레이션, 유가 데이터를 묶어 월별 추이를 시각화",
        tools: "Python, pandas, Tableau",
        resultLink: "https://example.com/inflation-dashboard",
        githubLink: "https://github.com/example/inflation-dashboard",
        updatedAt: addDays(-5)
      }
    ],
    careers: [
      {
        id: "career-competition",
        name: "대학생 경제정책 논문 공모전",
        type: "공모전",
        deadline: addDays(21),
        status: "준비 중",
        documents: "초록, 재학증명서, 개인정보 동의서",
        notes: "연구 질문을 노동시장 쪽으로 좁히기",
        organization: "경제정책 공모전",
        role: "논문 제출",
        targetCareer: "공공기관",
        nextAction: "연구 질문과 데이터 출처를 1페이지로 정리"
      },
      {
        id: "career-intern",
        name: "리서치 어시스턴트 인턴",
        type: "인턴십",
        deadline: addDays(10),
        status: "관심",
        documents: "이력서, 성적표, 프로젝트 포트폴리오",
        notes: "계량 프로젝트 카드 업데이트 후 지원",
        organization: "리서치 센터",
        role: "RA 인턴",
        targetCareer: "리서치",
        nextAction: "회귀분석 프로젝트 결과표와 GitHub 링크 점검"
      }
    ],
    reports: [],
    dataProjects: []
  };
}
