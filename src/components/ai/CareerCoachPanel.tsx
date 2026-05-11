"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Plus,
  Save,
  WandSparkles
} from "lucide-react";
import type { CareerItem } from "@/types";
import type {
  AiRequestContext,
  AiResponsePayload,
  CareerCoachDraft,
  CareerCoachInput
} from "@/types/ai";
import {
  buildCareerCoachDraft,
  buildCareerCoachInput,
  careerExperienceExamples,
  careerPathOptions,
  careerSkillExamples
} from "@/lib/ai/career-coach";
import { requestAiResponse } from "@/lib/ai/client";
import { addDays } from "@/lib/date";
import { AiResponseCard } from "@/components/ai/AiResponseCard";
import {
  Badge,
  Button,
  Field,
  Panel,
  Select,
  TextArea,
  TextInput
} from "@/components/ui";

export type CareerExperienceSource = {
  id: string;
  title: string;
  source: string;
  detail: string;
};

type CareerCoachPanelProps = {
  seed: CareerItem | null;
  aiContext: AiRequestContext;
  experienceSources: CareerExperienceSource[];
  onApplyToForm: (draft: CareerCoachDraft) => void;
  onSave: (draft: CareerCoachDraft, targetId?: string) => void;
};

const emptyInput: CareerCoachInput = {
  targetCareer: "금융권",
  skills: "",
  experiences: "",
  jobPosting: "",
  organization: "",
  role: "",
  deadline: addDays(14)
};

export function CareerCoachPanel({
  aiContext,
  experienceSources,
  onApplyToForm,
  onSave,
  seed
}: CareerCoachPanelProps) {
  const [form, setForm] = useState<CareerCoachInput>(emptyInput);
  const [response, setResponse] = useState<AiResponsePayload | null>(null);
  const [draft, setDraft] = useState<CareerCoachDraft | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [targetId, setTargetId] = useState<string | undefined>();

  useEffect(() => {
    if (!seed) {
      return;
    }

    setTargetId(seed.id);
    setForm({
      targetCareer: seed.targetCareer ?? "리서치",
      skills: seed.aiAnalysis?.skills ?? "",
      experiences: seed.aiAnalysis?.experiences ?? seed.notes,
      jobPosting: [seed.documents, seed.notes].filter(Boolean).join("\n\n"),
      organization: seed.organization ?? seed.name,
      role: seed.role ?? "",
      deadline: seed.deadline
    });
    setResponse(
      seed.aiAnalysis
        ? {
            feature: "careerCoach",
            output: seed.aiAnalysis.output,
            model: seed.aiAnalysis.model,
            createdAt: seed.aiAnalysis.generatedAt
          }
        : null
    );
    setDraft(null);
    setError("");
  }, [seed]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.jobPosting.trim() && !form.organization.trim() && !form.role.trim()) {
      setError("지원하려는 공고 내용이나 회사/직무 정보를 입력해주세요.");
      setResponse(null);
      setDraft(null);
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse(null);
    setDraft(null);

    try {
      const result = await requestAiResponse(
        {
          feature: "careerCoach",
          input: buildCareerCoachInput(form),
          context: aiContext
        },
        "AI 커리어 분석에 실패했습니다."
      );

      setResponse(result);
      setDraft(buildCareerCoachDraft({ input: form, response: result }));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI 커리어 분석 중 문제가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function addSkill(skill: string) {
    setForm((current) => ({
      ...current,
      skills: appendText(current.skills, skill, ", ")
    }));
  }

  function addExperienceExample(example: string) {
    setForm((current) => ({
      ...current,
      experiences: appendText(current.experiences, example, ", ")
    }));
  }

  function addExperienceSource(source: CareerExperienceSource) {
    const text = `[${source.source}] ${source.title}\n${source.detail}`;

    setForm((current) => ({
      ...current,
      experiences: appendText(current.experiences, text, "\n\n")
    }));
  }

  function applyDraft() {
    if (!draft) {
      return;
    }

    onApplyToForm(draft);
  }

  function saveDraft() {
    if (!draft) {
      return;
    }

    onSave(draft, targetId);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel className="grid gap-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">AI Career Coach</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              진로 방향, 보유 역량, 경험, 공고 내용을 바탕으로 지원 전략과 자기소개서·면접 초안을 정리합니다.
            </p>
          </div>
        </div>

        {seed ? (
          <div className="rounded-lg border border-gold-100 bg-gold-50 p-3 text-sm leading-6 text-gold-600">
            현재 분석 대상: <span className="font-bold">{seed.name}</span>. 결과를 저장하면 이 지원 항목에 AI 분석이 연결됩니다.
          </div>
        ) : null}

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="관심 진로">
              <Select
                value={form.targetCareer}
                onChange={(event) =>
                  setForm({
                    ...form,
                    targetCareer: event.target.value as CareerCoachInput["targetCareer"]
                  })
                }
              >
                {careerPathOptions.map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="마감일">
              <TextInput
                value={form.deadline}
                onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                type="date"
              />
            </Field>
            <Field label="지원 회사/기관">
              <TextInput
                value={form.organization}
                onChange={(event) => setForm({ ...form, organization: event.target.value })}
                placeholder="예: 한국은행, 리서치센터, 컨설팅펌"
              />
            </Field>
            <Field label="직무">
              <TextInput
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                placeholder="예: RA, 데이터 분석 인턴, 경제정책 연구"
              />
            </Field>
          </div>

          <Field label="보유 역량">
            <TextArea
              value={form.skills}
              onChange={(event) => setForm({ ...form, skills: event.target.value })}
              placeholder="Python, R, Excel, Stata, SQL, 영어, 자격증 등"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {careerSkillExamples.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 ring-1 ring-line hover:bg-teal-50"
              >
                {skill}
              </button>
            ))}
          </div>

          <Field label="경험">
            <TextArea
              value={form.experiences}
              onChange={(event) => setForm({ ...form, experiences: event.target.value })}
              placeholder="동아리, 공모전, 프로젝트, 인턴, 아르바이트, 수업 프로젝트에서 한 일과 결과"
              className="min-h-32"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {careerExperienceExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => addExperienceExample(example)}
                className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 ring-1 ring-line hover:bg-zinc-100"
              >
                {example}
              </button>
            ))}
          </div>

          {experienceSources.length ? (
            <div className="grid gap-2">
              <p className="text-sm font-bold text-zinc-700">경험 DB에서 소재 불러오기</p>
              <div className="grid max-h-56 gap-2 overflow-y-auto rounded-lg border border-line bg-paper/50 p-2">
                {experienceSources.slice(0, 12).map((source) => (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => addExperienceSource(source)}
                    className="rounded-md bg-white p-3 text-left ring-1 ring-line transition hover:bg-teal-50"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{source.source}</Badge>
                      <span className="text-sm font-bold text-ink">{source.title}</span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-500">
                      {source.detail}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <Field label="지원하려는 공고 내용">
            <TextArea
              value={form.jobPosting}
              onChange={(event) => setForm({ ...form, jobPosting: event.target.value })}
              placeholder="공고의 주요 업무, 자격요건, 우대사항, 제출 서류를 붙여넣어 주세요."
              className="min-h-36"
            />
          </Field>

          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-coral-100 bg-coral-50 p-3 text-sm leading-6 text-coral-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isLoading}>
              <WandSparkles className="h-4 w-4" />
              {isLoading ? "분석 중" : "AI 커리어 분석"}
            </Button>
            <Button variant="secondary" disabled={!draft} onClick={applyDraft}>
              <Plus className="h-4 w-4" />
              지원 폼에 반영
            </Button>
            <Button variant="secondary" disabled={!draft} onClick={saveDraft}>
              <Save className="h-4 w-4" />
              {targetId ? "지원 항목에 저장" : "새 지원 항목 저장"}
            </Button>
          </div>
        </form>
      </Panel>

      <div className="grid gap-4">
        <AiResponseCard
          title="커리어 분석 결과"
          description="공고와 내 경험의 연결점을 찾고 자기소개서·면접 준비 초안을 만듭니다."
          response={response}
          isLoading={isLoading}
          error={error}
          emptyMessage="관심 진로와 공고 내용을 입력하고 AI 분석을 실행하면 결과가 표시됩니다."
          metadata={[
            {
              label: form.targetCareer,
              tone: "teal"
            },
            {
              label: form.role || "직무 미정",
              tone: "neutral"
            }
          ]}
        />

        {draft ? (
          <Panel>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="teal">저장 미리보기</Badge>
              <Badge tone="neutral">{draft.organization || "기관 미정"}</Badge>
              <Badge tone="gold">{draft.role || "직무 미정"}</Badge>
            </div>
            <div className="grid gap-3 text-sm leading-6">
              <PreviewBlock label="자기소개서 초안" value={draft.coverLetterDraft} />
              <PreviewBlock label="면접 질문 복기" value={draft.interviewReview} />
              <PreviewBlock label="다음 액션" value={draft.nextAction} />
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

function PreviewBlock({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <h4 className="font-bold text-ink">{label}</h4>
      <p className="mt-1 whitespace-pre-wrap text-zinc-600">{value}</p>
    </div>
  );
}

function appendText(current: string, addition: string, separator: string) {
  const trimmedCurrent = current.trim();
  const trimmedAddition = addition.trim();

  if (!trimmedAddition || trimmedCurrent.includes(trimmedAddition)) {
    return current;
  }

  return trimmedCurrent ? `${trimmedCurrent}${separator}${trimmedAddition}` : trimmedAddition;
}
