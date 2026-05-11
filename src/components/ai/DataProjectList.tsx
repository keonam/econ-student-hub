"use client";

import { useState } from "react";
import { BarChart3, ChevronDown, ChevronUp, Github, Image, Plus } from "lucide-react";
import type { DataProject } from "@/types";
import { getSafeExternalUrl } from "@/lib/url";
import { Badge, Button, EmptyState, Panel } from "@/components/ui";

type DataProjectListProps = {
  projects: DataProject[];
  onAddToPortfolio: (project: DataProject) => void;
};

export function DataProjectList({ onAddToPortfolio, projects }: DataProjectListProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  function toggle(projectId: string) {
    setExpandedIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId]
    );
  }

  return (
    <Panel className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-ink">저장된 데이터 프로젝트</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            분석 설계와 포트폴리오 카드 초안을 함께 보관합니다.
          </p>
        </div>
        <Badge tone="neutral">{projects.length} Projects</Badge>
      </div>

      {sortedProjects.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {sortedProjects.map((project) => {
            const safeVisualizationUrl = getSafeExternalUrl(
              project.portfolioCard.visualizationUrl
            );
            const safeGithubUrl = getSafeExternalUrl(project.portfolioCard.githubUrl);

            return (
            <article key={project.id} className="rounded-lg border border-line bg-paper/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge tone="teal">{project.interestArea}</Badge>
                    <Badge tone="gold">{project.analysisMethod || "방법 미정"}</Badge>
                  </div>
                  <h4 className="font-bold leading-6 text-ink">
                    {project.portfolioCard.projectName || project.selectedTopic}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {project.researchQuestion}
                  </p>
                </div>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-ink">
                  <BarChart3 className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => toggle(project.id)}>
                  {expandedIds.includes(project.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  설계 {expandedIds.includes(project.id) ? "접기" : "펼치기"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onAddToPortfolio(project)}>
                  <Plus className="h-4 w-4" />
                  Portfolio 추가
                </Button>
              </div>

              {expandedIds.includes(project.id) ? (
                <div className="mt-4 grid max-h-[28rem] gap-3 overflow-y-auto border-t border-line pt-4 pr-1 text-sm leading-6 text-zinc-600">
                  <p>
                    <span className="font-bold text-ink">데이터</span> {project.dataPlan}
                  </p>
                  <p>
                    <span className="font-bold text-ink">변수</span> 종속변수:{" "}
                    {project.dependentVariable || "미정"} / 독립변수:{" "}
                    {project.independentVariables || "미정"} / 통제변수:{" "}
                    {project.controlVariables || "미정"}
                  </p>
                  <p>
                    <span className="font-bold text-ink">한계점</span> {project.limitations}
                  </p>
                  <div className="rounded-lg border border-line bg-white p-3">
                    <h5 className="font-bold text-ink">포트폴리오 카드</h5>
                    <p className="mt-2">{project.portfolioCard.problemDefinition}</p>
                    <p className="mt-2">
                      <span className="font-bold text-ink">핵심 결과</span>{" "}
                      {project.portfolioCard.keyResult || "분석 후 작성"}
                    </p>
                    <p className="mt-2">
                      <span className="font-bold text-ink">배운 점</span>{" "}
                      {project.portfolioCard.lessons || "프로젝트 진행 후 작성"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {safeVisualizationUrl ? (
                        <a
                          href={safeVisualizationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700"
                        >
                          <Image className="h-4 w-4" />
                          시각화
                        </a>
                      ) : null}
                      {safeGithubUrl ? (
                        <a
                          href={safeGithubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700"
                        >
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
            );
          })}
        </div>
      ) : (
        <EmptyState>아직 저장된 데이터 프로젝트가 없습니다.</EmptyState>
      )}
    </Panel>
  );
}
