"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, ListChecks } from "lucide-react";
import type { ReportProject, ReportStatus } from "@/types";
import { reportStatuses } from "@/lib/ai/report-assistant";
import { Badge, Button, EmptyState, Panel, Select } from "@/components/ui";

type ReportProjectListProps = {
  projects: ReportProject[];
  onStatusChange: (id: string, status: ReportStatus) => void;
  onTodoToggle: (projectId: string, todoId: string) => void;
};

export function ReportProjectList({
  onStatusChange,
  onTodoToggle,
  projects
}: ReportProjectListProps) {
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([]);
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  function togglePlan(projectId: string) {
    setExpandedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId]
    );
  }

  return (
    <Panel className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-ink">저장된 리포트 프로젝트</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            AI가 만든 계획을 프로젝트로 저장하고 상태와 할 일을 관리합니다.
          </p>
        </div>
        <Badge tone="neutral">{projects.length} Projects</Badge>
      </div>

      {sortedProjects.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {sortedProjects.map((project) => {
            const doneCount = project.todos.filter((todo) => todo.isDone).length;

            return (
              <article key={project.id} className="rounded-lg border border-line bg-paper/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {project.courseName ? <Badge tone="teal">{project.courseName}</Badge> : null}
                      <Badge tone="gold">{project.status}</Badge>
                    </div>
                    <h4 className="font-bold leading-6 text-ink">{project.topic}</h4>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      {project.dueDate ? `마감 ${project.dueDate}` : "마감일 미정"}
                    </p>
                  </div>
                  <Select
                    value={project.status}
                    onChange={(event) =>
                      onStatusChange(project.id, event.target.value as ReportStatus)
                    }
                    className="h-8 w-28"
                    aria-label={`${project.topic} 진행 상태`}
                  >
                    {reportStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>

                {project.aiPlan.researchQuestion ? (
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    <span className="font-bold text-ink">질문</span>{" "}
                    {project.aiPlan.researchQuestion}
                  </p>
                ) : null}

                <div className="mt-4 rounded-lg border border-line bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-ink">
                      <ListChecks className="h-4 w-4" />
                      자동 생성 할 일
                    </div>
                    <span className="text-xs font-semibold text-zinc-500">
                      {doneCount}/{project.todos.length}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {project.todos.map((todo) => (
                      <label
                        key={todo.id}
                        className="flex items-start gap-2 text-sm leading-6 text-zinc-700"
                      >
                        <input
                          type="checkbox"
                          checked={todo.isDone}
                          onChange={() => onTodoToggle(project.id, todo.id)}
                          className="mt-1 h-4 w-4 rounded border-line accent-teal-600"
                        />
                        <span className={todo.isDone ? "text-zinc-400 line-through" : ""}>
                          {todo.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  className="mt-3"
                  size="sm"
                  variant="secondary"
                  onClick={() => togglePlan(project.id)}
                >
                  {expandedProjectIds.includes(project.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  AI 계획 {expandedProjectIds.includes(project.id) ? "접기" : "펼치기"}
                </Button>

                {expandedProjectIds.includes(project.id) ? (
                  <div className="mt-3 rounded-lg border border-line bg-white p-3">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge tone="neutral">{project.aiPlan.model}</Badge>
                      <Badge tone="gold">
                        {new Date(project.aiPlan.generatedAt).toLocaleString("ko-KR")}
                      </Badge>
                    </div>
                    <div className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap break-words pr-1 text-sm leading-7 text-zinc-700">
                      {project.aiPlan.output}
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  저장 {new Date(project.createdAt).toLocaleString("ko-KR")}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState>아직 저장된 리포트 프로젝트가 없습니다.</EmptyState>
      )}
    </Panel>
  );
}
