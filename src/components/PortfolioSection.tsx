"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ExternalLink,
  Github,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Wrench
} from "lucide-react";
import type { PortfolioProject } from "@/types";
import { addDays, compareDate, formatDate } from "@/lib/date";
import { makeId } from "@/lib/id";
import { getSafeExternalUrl } from "@/lib/url";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  IconButton,
  Panel,
  SectionHeader,
  TextArea,
  TextInput
} from "@/components/ui";

type PortfolioSectionProps = {
  projects: PortfolioProject[];
  query: string;
  onChange: (projects: PortfolioProject[]) => void;
};

type PortfolioForm = Omit<PortfolioProject, "id" | "updatedAt">;

const emptyPortfolioForm: PortfolioForm = {
  name: "",
  description: "",
  tools: "",
  resultLink: "",
  githubLink: ""
};

export function PortfolioSection({ projects, query, onChange }: PortfolioSectionProps) {
  const [form, setForm] = useState<PortfolioForm>(emptyPortfolioForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...projects]
      .filter((project) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          project.name,
          project.description,
          project.tools,
          project.resultLink,
          project.githubLink
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => compareDate(b.updatedAt, a.updatedAt));
  }, [projects, query]);

  function resetForm() {
    setForm(emptyPortfolioForm);
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextProject = {
      name: form.name.trim(),
      description: form.description.trim(),
      tools: form.tools.trim(),
      resultLink: form.resultLink.trim(),
      githubLink: form.githubLink.trim()
    };

    if (!nextProject.name) {
      return;
    }

    if (editingId) {
      onChange(
        projects.map((project) =>
          project.id === editingId
            ? {
                ...project,
                ...nextProject,
                updatedAt: addDays(0)
              }
            : project
        )
      );
    } else {
      onChange([
        {
          id: makeId("portfolio"),
          ...nextProject,
          updatedAt: addDays(0)
        },
        ...projects
      ]);
    }

    resetForm();
  }

  function handleEdit(project: PortfolioProject) {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description,
      tools: project.tools,
      resultLink: project.resultLink,
      githubLink: project.githubLink
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(projectId: string) {
    onChange(projects.filter((project) => project.id !== projectId));
  }

  return (
    <div className="grid gap-5">
      <SectionHeader
        title="Portfolio"
        description="수업, 리서치, 데이터 분석 프로젝트를 카드로 정리합니다."
      />

      <Panel>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-ink">
              {editingId ? "프로젝트 수정" : "프로젝트 카드 등록"}
            </h3>
            {editingId ? (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                취소
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="프로젝트명">
              <TextInput
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="예: 환율과 수입물가 분석"
                required
              />
            </Field>
            <Field label="사용 도구">
              <TextInput
                value={form.tools}
                onChange={(event) => setForm({ ...form, tools: event.target.value })}
                placeholder="Python, R, Tableau"
              />
            </Field>
            <Field label="결과 링크">
              <TextInput
                value={form.resultLink}
                onChange={(event) => setForm({ ...form, resultLink: event.target.value })}
                placeholder="https://"
                type="url"
              />
            </Field>
            <Field label="GitHub 링크">
              <TextInput
                value={form.githubLink}
                onChange={(event) => setForm({ ...form, githubLink: event.target.value })}
                placeholder="https://github.com/"
                type="url"
              />
            </Field>
            <Field label="설명" className="md:col-span-2">
              <TextArea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="문제 정의, 분석 방법, 결과를 간단히 기록"
              />
            </Field>
          </div>
          <div>
            <Button type="submit">
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "저장" : "등록"}
            </Button>
          </div>
        </form>
      </Panel>

      {filteredProjects.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredProjects.map((project) => {
            const tools = project.tools
              .split(",")
              .map((tool) => tool.trim())
              .filter(Boolean);
            const safeResultLink = getSafeExternalUrl(project.resultLink);
            const safeGithubLink = getSafeExternalUrl(project.githubLink);

            return (
              <Panel key={project.id} className="grid gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-zinc-500">
                      업데이트 {formatDate(project.updatedAt)}
                    </p>
                    <h3 className="text-lg font-bold leading-6 text-ink">{project.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <IconButton label="프로젝트 수정" onClick={() => handleEdit(project)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="프로젝트 삭제"
                      variant="danger"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
                {project.description ? (
                  <p className="text-sm leading-6 text-zinc-700">{project.description}</p>
                ) : null}
                {tools.length ? (
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <Badge key={tool} tone="gold">
                        <Wrench className="mr-1 h-3.5 w-3.5" />
                        {tool}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {safeResultLink ? (
                    <a
                      href={safeResultLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-bold text-ink hover:bg-teal-50"
                    >
                      결과
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                  {safeGithubLink ? (
                    <a
                      href={safeGithubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-bold text-ink hover:bg-teal-50"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  ) : null}
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <EmptyState>검색 결과에 맞는 프로젝트가 없습니다.</EmptyState>
      )}
    </div>
  );
}
