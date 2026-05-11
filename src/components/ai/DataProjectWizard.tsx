"use client";

import { FormEvent } from "react";
import { BarChart3, Database, LoaderCircle, Save, WandSparkles } from "lucide-react";
import type { DataProjectCoachDraft, DataProjectCoachInput } from "@/types/ai";
import { analysisMethodOptions } from "@/lib/ai/data-project-coach";
import { cn } from "@/lib/cn";
import { Button, Field, Panel, TextArea, TextInput } from "@/components/ui";

type WizardStep = "interest" | "question" | "data" | "method" | "portfolio";

type DataProjectWizardProps = {
  draft: DataProjectCoachDraft | null;
  form: DataProjectCoachInput;
  isLoading: boolean;
  step: WizardStep;
  onDraftChange: (draft: DataProjectCoachDraft) => void;
  onFormChange: (form: DataProjectCoachInput) => void;
  onGenerate: (event: FormEvent<HTMLFormElement>) => void;
  onSave: () => void;
  onStepChange: (step: WizardStep) => void;
};

const steps: Array<{ id: WizardStep; label: string }> = [
  { id: "interest", label: "관심 분야" },
  { id: "question", label: "연구 질문" },
  { id: "data", label: "데이터" },
  { id: "method", label: "분석 방법" },
  { id: "portfolio", label: "포트폴리오 카드" }
];

const interestExamples = ["금융", "노동", "부동산", "무역", "통화정책", "복지", "산업", "AI"];

export function DataProjectWizard({
  draft,
  form,
  isLoading,
  onDraftChange,
  onFormChange,
  onGenerate,
  onSave,
  onStepChange,
  step
}: DataProjectWizardProps) {
  return (
    <Panel className="grid gap-5">
      <div>
        <h3 className="font-bold text-ink">프로젝트 생성 Wizard</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          관심 분야에서 시작해 연구 질문, 데이터, 분석 방법, 포트폴리오 카드까지 이어갑니다.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-5">
        {steps.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onStepChange(item.id)}
            className={cn(
              "rounded-md px-3 py-2 text-xs font-bold ring-1 transition",
              step === item.id
                ? "bg-ink text-white ring-ink"
                : "bg-white text-zinc-600 ring-line hover:bg-teal-50"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form className="grid gap-4" onSubmit={onGenerate}>
        {step === "interest" ? (
          <div className="grid gap-4">
            <Field label="관심 분야">
              <TextInput
                value={form.interestArea}
                onChange={(event) => onFormChange({ ...form, interestArea: event.target.value })}
                placeholder="예: 금융, 노동, 부동산, 무역, 통화정책, AI"
                required
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {interestExamples.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onFormChange({ ...form, interestArea: item })}
                  className="rounded-md bg-paper px-3 py-1.5 text-xs font-bold text-zinc-700 ring-1 ring-line hover:bg-teal-50"
                >
                  {item}
                </button>
              ))}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <WandSparkles className="h-4 w-4" />
              )}
              {isLoading ? "추천 생성 중" : "AI 주제 5개 추천"}
            </Button>
          </div>
        ) : null}

        {step === "question" ? (
          <div className="grid gap-4">
            {draft?.aiPlan.topicIdeas ? (
              <div className="rounded-lg border border-line bg-paper/50 p-3">
                <h4 className="font-bold text-ink">AI 추천 분석 주제 5개</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                  {draft.aiPlan.topicIdeas}
                </p>
              </div>
            ) : null}
            <Field label="선택한 분석 주제">
              <TextInput
                value={form.selectedTopic}
                onChange={(event) => onFormChange({ ...form, selectedTopic: event.target.value })}
                placeholder="추천 주제 중 하나를 고르거나 직접 작성"
              />
            </Field>
            <Field label="연구 질문">
              <TextArea
                value={form.researchQuestion}
                onChange={(event) =>
                  onFormChange({ ...form, researchQuestion: event.target.value })
                }
                placeholder="예: 기준금리 변화는 가계대출 증가율에 어떤 영향을 주는가?"
              />
            </Field>
          </div>
        ) : null}

        {step === "data" ? (
          <div className="grid gap-4">
            <Field label="사용 데이터">
              <TextArea
                value={form.dataPlan}
                onChange={(event) => onFormChange({ ...form, dataPlan: event.target.value })}
                placeholder="예: 한국은행 ECOS 기준금리, KOSIS 가계대출, 지역별 소득 자료"
              />
            </Field>
            {draft ? (
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="독립변수">
                  <TextArea
                    value={draft.independentVariables}
                    onChange={(event) =>
                      onDraftChange({ ...draft, independentVariables: event.target.value })
                    }
                  />
                </Field>
                <Field label="종속변수">
                  <TextArea
                    value={draft.dependentVariable}
                    onChange={(event) =>
                      onDraftChange({ ...draft, dependentVariable: event.target.value })
                    }
                  />
                </Field>
                <Field label="통제변수">
                  <TextArea
                    value={draft.controlVariables}
                    onChange={(event) =>
                      onDraftChange({ ...draft, controlVariables: event.target.value })
                    }
                  />
                </Field>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === "method" ? (
          <div className="grid gap-4">
            <Field label="분석 방법">
              <TextInput
                value={form.analysisMethod}
                onChange={(event) =>
                  onFormChange({ ...form, analysisMethod: event.target.value })
                }
                placeholder="예: 회귀분석, DID, 패널데이터"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {analysisMethodOptions.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => onFormChange({ ...form, analysisMethod: method })}
                  className="inline-flex items-center gap-2 rounded-md bg-paper px-3 py-1.5 text-xs font-bold text-zinc-700 ring-1 ring-line hover:bg-teal-50"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  {method}
                </button>
              ))}
            </div>
            {draft ? (
              <Field label="주의해야 할 한계점">
                <TextArea
                  value={draft.limitations}
                  onChange={(event) => onDraftChange({ ...draft, limitations: event.target.value })}
                />
              </Field>
            ) : null}
          </div>
        ) : null}

        {step === "portfolio" ? (
          draft ? (
            <PortfolioCardEditor draft={draft} onDraftChange={onDraftChange} onSave={onSave} />
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-paper/50 p-6 text-center text-sm text-zinc-500">
              먼저 관심 분야 단계에서 AI 추천을 생성하면 포트폴리오 카드 초안이 표시됩니다.
            </div>
          )
        ) : null}
      </form>
    </Panel>
  );
}

function PortfolioCardEditor({
  draft,
  onDraftChange,
  onSave
}: {
  draft: DataProjectCoachDraft;
  onDraftChange: (draft: DataProjectCoachDraft) => void;
  onSave: () => void;
}) {
  const card = draft.portfolioCard;

  function updateCard(nextCard: typeof card) {
    onDraftChange({ ...draft, portfolioCard: nextCard });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="프로젝트명">
          <TextInput
            value={card.projectName}
            onChange={(event) => updateCard({ ...card, projectName: event.target.value })}
          />
        </Field>
        <Field label="분석 방법">
          <TextInput
            value={card.method}
            onChange={(event) => updateCard({ ...card, method: event.target.value })}
          />
        </Field>
        <Field label="시각화 이미지 링크">
          <TextInput
            value={card.visualizationUrl}
            onChange={(event) => updateCard({ ...card, visualizationUrl: event.target.value })}
            placeholder="https://"
            type="url"
          />
        </Field>
        <Field label="GitHub 링크">
          <TextInput
            value={card.githubUrl}
            onChange={(event) => updateCard({ ...card, githubUrl: event.target.value })}
            placeholder="https://github.com/"
            type="url"
          />
        </Field>
      </div>
      <Field label="문제 정의">
        <TextArea
          value={card.problemDefinition}
          onChange={(event) => updateCard({ ...card, problemDefinition: event.target.value })}
        />
      </Field>
      <Field label="사용 데이터">
        <TextArea value={card.data} onChange={(event) => updateCard({ ...card, data: event.target.value })} />
      </Field>
      <Field label="핵심 결과">
        <TextArea
          value={card.keyResult}
          onChange={(event) => updateCard({ ...card, keyResult: event.target.value })}
          placeholder="실제 분석 후 검증된 결과를 작성하세요."
        />
      </Field>
      <Field label="배운 점">
        <TextArea
          value={card.lessons}
          onChange={(event) => updateCard({ ...card, lessons: event.target.value })}
        />
      </Field>
      <Button onClick={onSave}>
        <Save className="h-4 w-4" />
        데이터 프로젝트 저장
      </Button>
    </div>
  );
}
