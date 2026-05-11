"use client";

import { FormEvent } from "react";
import { Brain, LoaderCircle, Send } from "lucide-react";
import type { EconTutorAnswerStyle, EconTutorCategory } from "@/types/ai";
import {
  econTutorAnswerStyles,
  econTutorCategories,
  econTutorTopicExamples
} from "@/lib/ai/econ-tutor";
import { cn } from "@/lib/cn";
import { Button, Field, Panel, TextArea } from "@/components/ui";

type EconTutorQuestionFormProps = {
  answerStyle: EconTutorAnswerStyle;
  category: EconTutorCategory;
  isLoading: boolean;
  question: string;
  onAnswerStyleChange: (style: EconTutorAnswerStyle) => void;
  onCategoryChange: (category: EconTutorCategory) => void;
  onQuestionChange: (question: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function EconTutorQuestionForm({
  answerStyle,
  category,
  isLoading,
  onAnswerStyleChange,
  onCategoryChange,
  onQuestionChange,
  onSubmit,
  question
}: EconTutorQuestionFormProps) {
  function useTopic(topic: string) {
    onQuestionChange(
      `${topic} 개념을 ${getCategoryPromptLabel(category)} 관점에서 설명해줘. 한 줄 요약, 직관, 공식/그래프, 현실 사례, 시험 포인트, 오해, 추가 키워드까지 정리해줘.`
    );
  }

  return (
    <Panel className="grid gap-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Brain className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-bold text-ink">질문 입력</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            카테고리와 답변 스타일을 선택하면 AI 튜터가 같은 형식으로 답변을 정리합니다.
          </p>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <p className="text-sm font-bold text-zinc-700">주제 카테고리</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {econTutorCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onCategoryChange(item.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition",
                  category === item.id
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-ink hover:bg-teal-50"
                )}
              >
                <span className="block text-sm font-bold">{item.label}</span>
                <span
                  className={cn(
                    "mt-1 block text-xs leading-5",
                    category === item.id ? "text-white/75" : "text-zinc-500"
                  )}
                >
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-bold text-zinc-700">답변 스타일</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {econTutorAnswerStyles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onAnswerStyleChange(item.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition",
                  answerStyle === item.id
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-line bg-white text-ink hover:bg-teal-50"
                )}
              >
                <span className="block text-sm font-bold">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Field label="경제학 질문">
          <TextArea
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="예: IS-LM 모형에서 재정정책이 소득과 이자율에 미치는 효과를 설명해줘."
            className="min-h-40"
          />
        </Field>

        <div className="grid gap-2">
          <p className="text-sm font-bold text-zinc-700">주제 예시</p>
          <div className="flex flex-wrap gap-2">
            {econTutorTopicExamples.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => useTopic(topic)}
                className="rounded-md bg-paper px-3 py-1.5 text-xs font-bold text-zinc-700 ring-1 ring-line hover:bg-teal-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isLoading ? "생성 중" : "AI에게 질문"}
        </Button>
      </form>
    </Panel>
  );
}

function getCategoryPromptLabel(category: EconTutorCategory) {
  return econTutorCategories.find((item) => item.id === category)?.label ?? "경제학";
}
