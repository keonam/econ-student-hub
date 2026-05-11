"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import type { ReportProject, ReportStatus } from "@/types";
import type {
  AiResponsePayload,
  ReportAssistantDraft,
  ReportAssistantInput
} from "@/types/ai";
import {
  buildReportAssistantDraft,
  buildReportAssistantInput
} from "@/lib/ai/report-assistant";
import { requestAiResponse } from "@/lib/ai/client";
import { makeId } from "@/lib/id";
import { AiResponseCard } from "@/components/ai/AiResponseCard";
import { ReportAssistantForm } from "@/components/ai/ReportAssistantForm";
import { ReportEthicsPanel } from "@/components/ai/ReportEthicsPanel";
import { ReportProjectList } from "@/components/ai/ReportProjectList";
import { Button, Panel, SectionHeader } from "@/components/ui";

type AiReportAssistantSectionProps = {
  reports: ReportProject[];
  onChange: (reports: ReportProject[]) => void;
};

const emptyForm: ReportAssistantInput = {
  courseName: "",
  topic: "",
  length: "",
  dueDate: "",
  requirements: "",
  currentClaim: "",
  dataOrCases: ""
};

export function AiReportAssistantSection({
  onChange,
  reports
}: AiReportAssistantSectionProps) {
  const [form, setForm] = useState<ReportAssistantInput>(emptyForm);
  const [response, setResponse] = useState<AiResponsePayload | null>(null);
  const [draft, setDraft] = useState<ReportAssistantDraft | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.topic.trim()) {
      setError("리포트 주제를 입력해주세요.");
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
          feature: "reportAssistant",
          input: buildReportAssistantInput(form)
        },
        "AI 리포트 계획 생성에 실패했습니다."
      );

      setResponse(result);
      setDraft(buildReportAssistantDraft({ input: form, response: result }));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI 리포트 계획 생성 중 문제가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function saveDraftAsProject() {
    if (!draft) {
      return;
    }

    const now = new Date().toISOString();
    const project: ReportProject = {
      id: makeId("report"),
      courseName: draft.courseName.trim(),
      topic: draft.topic.trim(),
      length: draft.length.trim(),
      dueDate: draft.dueDate,
      requirements: draft.requirements.trim(),
      currentClaim: draft.currentClaim.trim(),
      dataOrCases: draft.dataOrCases.trim(),
      status: "아이디어",
      todos: draft.todoTitles.map((title) => ({
        id: makeId("report-todo"),
        title,
        isDone: false
      })),
      aiPlan: draft.aiPlan,
      createdAt: now,
      updatedAt: now
    };

    onChange([project, ...reports]);
  }

  function updateProjectStatus(id: string, status: ReportStatus) {
    onChange(
      reports.map((project) =>
        project.id === id
          ? {
              ...project,
              status,
              updatedAt: new Date().toISOString()
            }
          : project
      )
    );
  }

  function toggleTodo(projectId: string, todoId: string) {
    onChange(
      reports.map((project) =>
        project.id === projectId
          ? {
              ...project,
              todos: project.todos.map((todo) =>
                todo.id === todoId ? { ...todo, isDone: !todo.isDone } : todo
              ),
              updatedAt: new Date().toISOString()
            }
          : project
      )
    );
  }

  return (
    <div className="grid gap-5">
      <SectionHeader
        title="AI Report Assistant"
        description="경제학 리포트 주제, 개요, 자료 조사 계획, 할 일을 구조화합니다."
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <ReportAssistantForm
          form={form}
          isLoading={isLoading}
          onChange={setForm}
          onSubmit={handleSubmit}
        />

        <div className="grid gap-4">
          <AiResponseCard
            title="리포트 계획"
            description="완성본 대필이 아니라 주제 정리와 조사 계획을 위한 초안입니다."
            response={response}
            isLoading={isLoading}
            error={error}
            emptyMessage="리포트 정보를 입력하고 계획 생성을 실행하면 결과가 표시됩니다."
            metadata={[
              {
                label: form.courseName || "과목 미정",
                tone: "teal"
              }
            ]}
          />

          {draft ? (
            <Panel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-ink">프로젝트로 저장</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  상태는 아이디어로 시작하고, 자료조사부터 제출까지 이동할 수 있습니다.
                </p>
              </div>
              <Button onClick={saveDraftAsProject}>
                <Save className="h-4 w-4" />
                리포트 프로젝트 저장
              </Button>
            </Panel>
          ) : null}
        </div>
      </div>

      <ReportEthicsPanel />

      <ReportProjectList
        projects={reports}
        onStatusChange={updateProjectStatus}
        onTodoToggle={toggleTodo}
      />
    </div>
  );
}
