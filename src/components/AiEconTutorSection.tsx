"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { HubData } from "@/types";
import type {
  AiResponsePayload,
  EconTutorAnswerStyle,
  EconTutorCategory,
  EconTutorHistoryItem
} from "@/types/ai";
import {
  getEconTutorCategoryLabel,
  getEconTutorStyleLabel,
  isEconTutorAnswerStyle,
  isEconTutorCategory
} from "@/lib/ai/econ-tutor";
import { requestAiResponse } from "@/lib/ai/client";
import { makeId } from "@/lib/id";
import { SectionHeader } from "@/components/ui";
import { AiResponseCard } from "@/components/ai/AiResponseCard";
import { EconTutorHistory } from "@/components/ai/EconTutorHistory";
import { EconTutorQuestionForm } from "@/components/ai/EconTutorQuestionForm";

type AiEconTutorSectionProps = {
  data: HubData;
};

const tutorHistoryStorageKey = "econ-student-hub:ai-tutor-history:v1";

export function AiEconTutorSection({ data }: AiEconTutorSectionProps) {
  const [question, setQuestion] = useState("");
  const [answerStyle, setAnswerStyle] = useState<EconTutorAnswerStyle>("freshman");
  const [category, setCategory] = useState<EconTutorCategory>("macroeconomics");
  const [answer, setAnswer] = useState<AiResponsePayload | null>(null);
  const [answerMeta, setAnswerMeta] = useState<{
    answerStyle: EconTutorAnswerStyle;
    category: EconTutorCategory;
  } | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useStoredTutorHistory();

  const contextSummary = useMemo(
    () => ({
      courses: data.courses.map((course) => ({
        id: course.id,
        name: course.name,
        professor: course.professor
      })),
      recentNews: data.news.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        tags: item.tags,
        summary: item.summary,
        concepts: item.concepts
      })),
      researchIdeas: data.research.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        question: item.question,
        data: item.data
      })),
      portfolioProjects: data.portfolio.slice(0, 4).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        tools: item.tools
      })),
      careerItems: data.careers.slice(0, 4).map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
        deadline: item.deadline
      }))
    }),
    [data]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submittedQuestion = question.trim();

    if (!submittedQuestion) {
      setError("질문을 입력해주세요.");
      setAnswer(null);
      setAnswerMeta(null);
      return;
    }

    setIsLoading(true);
    setError("");
    setAnswer(null);
    setAnswerMeta({ answerStyle, category });

    try {
      const result = await requestAiResponse(
        {
          feature: "econTutor",
          input: submittedQuestion,
          answerStyle,
          category,
          context: contextSummary
        },
        "AI 튜터 답변 생성에 실패했습니다."
      );

      setAnswer(result);
      setHistory((current) =>
        [
          {
            id: makeId("tutor-history"),
            question: submittedQuestion,
            answer: result.output,
            category,
            answerStyle,
            createdAt: result.createdAt,
            isFavorite: false,
            model: result.model
          },
          ...current
        ].slice(0, 50)
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI 응답을 불러오는 중 문제가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function selectHistoryItem(item: EconTutorHistoryItem) {
    setQuestion(item.question);
    setCategory(item.category);
    setAnswerStyle(item.answerStyle);
    setError("");
    setAnswerMeta({
      answerStyle: item.answerStyle,
      category: item.category
    });
    setAnswer({
      feature: "econTutor",
      output: item.answer,
      model: item.model,
      createdAt: item.createdAt
    });
  }

  function toggleFavorite(id: string) {
    setHistory((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  }

  return (
    <div className="grid gap-5">
      <SectionHeader
        title="AI Econ Tutor"
        description="경제학 질문을 정해진 학습 형식으로 답변하고, 질문 기록을 따로 저장합니다."
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <EconTutorQuestionForm
          answerStyle={answerStyle}
          category={category}
          isLoading={isLoading}
          question={question}
          onAnswerStyleChange={setAnswerStyle}
          onCategoryChange={setCategory}
          onQuestionChange={setQuestion}
          onSubmit={handleSubmit}
        />

        <AiResponseCard
          title="튜터 답변"
          description="답변은 한 줄 요약부터 추가 키워드까지 같은 순서로 표시됩니다."
          response={answer}
          isLoading={isLoading}
          error={error}
          emptyMessage="질문을 보내면 AI 튜터 답변이 여기에 표시됩니다."
          metadata={
            answerMeta
              ? [
                  {
                    label: getEconTutorCategoryLabel(answerMeta.category),
                    tone: "teal"
                  },
                  {
                    label: getEconTutorStyleLabel(answerMeta.answerStyle),
                    tone: "gold"
                  }
                ]
              : []
          }
        />
      </div>

      <EconTutorHistory
        items={history}
        onSelect={selectHistoryItem}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}

function useStoredTutorHistory() {
  const [history, setHistory] = useState<EconTutorHistoryItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const savedHistory = window.localStorage.getItem(tutorHistoryStorageKey);

      if (savedHistory) {
        setHistory(normalizeTutorHistory(JSON.parse(savedHistory)));
      }
    } catch {
      window.localStorage.removeItem(tutorHistoryStorageKey);
      setHistory([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(tutorHistoryStorageKey, JSON.stringify(history.slice(0, 50)));
  }, [history, isReady]);

  return [history, setHistory] as const;
}

function normalizeTutorHistory(value: unknown): EconTutorHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is EconTutorHistoryItem => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const candidate = item as Partial<EconTutorHistoryItem>;

      return Boolean(
        candidate.id &&
          candidate.question &&
          candidate.answer &&
          isEconTutorCategory(candidate.category) &&
          isEconTutorAnswerStyle(candidate.answerStyle) &&
          candidate.createdAt
      );
    })
    .slice(0, 50);
}
