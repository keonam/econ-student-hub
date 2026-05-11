"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, RotateCcw, Save } from "lucide-react";
import type {
  CareerItem,
  Course,
  DataProject,
  PortfolioProject,
  ResearchLogItem
} from "@/types";
import type { AiRequestContext, CareerCoachDraft } from "@/types/ai";
import { addDays } from "@/lib/date";
import { makeId } from "@/lib/id";
import { careerStatuses, careerTypes } from "@/lib/sample-data";
import { careerPathOptions } from "@/lib/ai/career-coach";
import { CareerApplicationList } from "@/components/ai/CareerApplicationList";
import {
  CareerCoachPanel,
  type CareerExperienceSource
} from "@/components/ai/CareerCoachPanel";
import {
  Button,
  Field,
  Panel,
  SectionHeader,
  Select,
  TextArea,
  TextInput
} from "@/components/ui";

type CareerSectionProps = {
  items: CareerItem[];
  query: string;
  courses: Course[];
  dataProjects: DataProject[];
  portfolioProjects: PortfolioProject[];
  researchItems: ResearchLogItem[];
  onChange: (items: CareerItem[]) => void;
};

type CareerForm = Omit<CareerItem, "id">;

function createCareerForm(): CareerForm {
  return {
    name: "",
    type: "인턴십",
    deadline: addDays(14),
    status: "관심",
    documents: "",
    notes: "",
    organization: "",
    role: "",
    targetCareer: "금융권",
    coverLetterDraft: "",
    interviewReview: "",
    nextAction: ""
  };
}

export function CareerSection({
  courses,
  dataProjects,
  items,
  onChange,
  portfolioProjects,
  query,
  researchItems
}: CareerSectionProps) {
  const [form, setForm] = useState<CareerForm>(createCareerForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [analysisSeed, setAnalysisSeed] = useState<CareerItem | null>(null);

  const experienceSources = useMemo(
    () =>
      buildExperienceSources({
        courses,
        dataProjects,
        items,
        portfolioProjects,
        researchItems
      }),
    [courses, dataProjects, items, portfolioProjects, researchItems]
  );

  const aiContext = useMemo<AiRequestContext>(
    () => ({
      courses: courses.map((course) => ({
        id: course.id,
        name: course.name,
        professor: course.professor
      })),
      researchIdeas: researchItems.map((item) => ({
        id: item.id,
        title: item.title,
        question: item.question,
        data: item.data
      })),
      portfolioProjects: portfolioProjects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        tools: project.tools
      })),
      careerItems: items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
        deadline: item.deadline,
        organization: item.organization,
        role: item.role,
        documents: item.documents,
        notes: item.notes
      }))
    }),
    [courses, items, portfolioProjects, researchItems]
  );

  function resetForm() {
    setForm(createCareerForm());
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextItem: Omit<CareerItem, "id"> = {
      name: form.name.trim(),
      type: form.type,
      deadline: form.deadline,
      status: form.status,
      documents: form.documents.trim(),
      notes: form.notes.trim(),
      organization: form.organization?.trim(),
      role: form.role?.trim(),
      targetCareer: form.targetCareer,
      coverLetterDraft: form.coverLetterDraft?.trim(),
      interviewReview: form.interviewReview?.trim(),
      nextAction: form.nextAction?.trim(),
      aiAnalysis: form.aiAnalysis
    };

    if (!nextItem.name) {
      return;
    }

    if (editingId) {
      onChange(
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...nextItem
              }
            : item
        )
      );
    } else {
      onChange([
        {
          id: makeId("career"),
          ...nextItem
        },
        ...items
      ]);
    }

    resetForm();
  }

  function handleEdit(item: CareerItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      type: item.type,
      deadline: item.deadline,
      status: item.status,
      documents: item.documents,
      notes: item.notes,
      organization: item.organization ?? "",
      role: item.role ?? "",
      targetCareer: item.targetCareer ?? "금융권",
      coverLetterDraft: item.coverLetterDraft ?? "",
      interviewReview: item.interviewReview ?? "",
      nextAction: item.nextAction ?? "",
      aiAnalysis: item.aiAnalysis
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(itemId: string) {
    onChange(items.filter((item) => item.id !== itemId));
  }

  function handleAnalyze(item: CareerItem) {
    setAnalysisSeed(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyCareerCoachDraft(draft: CareerCoachDraft) {
    setForm({
      name: buildCareerName(draft),
      type: "인턴십",
      deadline: draft.deadline || addDays(14),
      status: "준비 중",
      documents: "이력서, 자기소개서, 포트폴리오",
      notes: draft.aiAnalysis.connectionPoints,
      organization: draft.organization.trim(),
      role: draft.role.trim(),
      targetCareer: draft.targetCareer,
      coverLetterDraft: draft.coverLetterDraft,
      interviewReview: draft.interviewReview,
      nextAction: draft.nextAction,
      aiAnalysis: draft.aiAnalysis
    });
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveCareerCoachDraft(draft: CareerCoachDraft, targetId?: string) {
    if (targetId) {
      onChange(
        items.map((item) =>
          item.id === targetId
            ? {
                ...item,
                organization: draft.organization.trim() || item.organization,
                role: draft.role.trim() || item.role,
                targetCareer: draft.targetCareer,
                coverLetterDraft: draft.coverLetterDraft,
                interviewReview: draft.interviewReview,
                nextAction: draft.nextAction,
                aiAnalysis: draft.aiAnalysis
              }
            : item
        )
      );
      return;
    }

    onChange([
      {
        id: makeId("career"),
        name: buildCareerName(draft),
        type: "인턴십",
        deadline: draft.deadline || addDays(14),
        status: "준비 중",
        documents: "이력서, 자기소개서, 포트폴리오",
        notes: draft.aiAnalysis.connectionPoints,
        organization: draft.organization.trim(),
        role: draft.role.trim(),
        targetCareer: draft.targetCareer,
        coverLetterDraft: draft.coverLetterDraft,
        interviewReview: draft.interviewReview,
        nextAction: draft.nextAction,
        aiAnalysis: draft.aiAnalysis
      },
      ...items
    ]);
  }

  return (
    <div className="grid gap-5">
      <SectionHeader
        title="Career Tracker"
        description="지원 현황을 관리하고, 공고별 AI 분석으로 자기소개서·면접 준비까지 연결합니다."
      />

      <CareerCoachPanel
        aiContext={aiContext}
        experienceSources={experienceSources}
        seed={analysisSeed}
        onApplyToForm={applyCareerCoachDraft}
        onSave={saveCareerCoachDraft}
      />

      <Panel>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-ink">
              {editingId ? "지원 항목 수정" : "지원 항목 추가"}
            </h3>
            {editingId ? (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                취소
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="지원명" className="xl:col-span-2">
              <TextInput
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="예: 리서치 인턴"
                required
              />
            </Field>
            <Field label="지원 회사/기관">
              <TextInput
                value={form.organization ?? ""}
                onChange={(event) =>
                  setForm({ ...form, organization: event.target.value })
                }
                placeholder="예: 한국은행"
              />
            </Field>
            <Field label="직무">
              <TextInput
                value={form.role ?? ""}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                placeholder="예: 데이터 분석 인턴"
              />
            </Field>
            <Field label="유형">
              <Select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value as CareerItem["type"] })
                }
              >
                {careerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="마감일">
              <TextInput
                value={form.deadline}
                onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                type="date"
                required
              />
            </Field>
            <Field label="상태">
              <Select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as CareerItem["status"] })
                }
              >
                {careerStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="관심 진로">
              <Select
                value={form.targetCareer ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    targetCareer: event.target.value as CareerItem["targetCareer"]
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
            <Field label="제출 서류" className="md:col-span-2">
              <TextArea
                value={form.documents}
                onChange={(event) => setForm({ ...form, documents: event.target.value })}
                placeholder="이력서, 자기소개서, 포트폴리오"
              />
            </Field>
            <Field label="메모" className="md:col-span-2">
              <TextArea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="지원 전략, 준비할 내용, 연락 이력"
              />
            </Field>
            <Field label="자기소개서 초안" className="md:col-span-2">
              <TextArea
                value={form.coverLetterDraft ?? ""}
                onChange={(event) =>
                  setForm({ ...form, coverLetterDraft: event.target.value })
                }
                placeholder="AI 분석 또는 직접 작성한 자기소개서 소재"
              />
            </Field>
            <Field label="면접 질문 복기" className="md:col-span-2">
              <TextArea
                value={form.interviewReview ?? ""}
                onChange={(event) =>
                  setForm({ ...form, interviewReview: event.target.value })
                }
                placeholder="예상 질문, 실제 질문, 답변 개선점"
              />
            </Field>
            <Field label="다음 액션" className="md:col-span-2">
              <TextArea
                value={form.nextAction ?? ""}
                onChange={(event) => setForm({ ...form, nextAction: event.target.value })}
                placeholder="오늘 할 일, 추가 자료 준비, 포트폴리오 보완"
              />
            </Field>
          </div>
          <div>
            <Button type="submit">
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "저장" : "추가"}
            </Button>
          </div>
        </form>
      </Panel>

      <CareerApplicationList
        items={items}
        query={query}
        onAnalyze={handleAnalyze}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}

function buildExperienceSources({
  courses,
  dataProjects,
  items,
  portfolioProjects,
  researchItems
}: {
  courses: Course[];
  dataProjects: DataProject[];
  items: CareerItem[];
  portfolioProjects: PortfolioProject[];
  researchItems: ResearchLogItem[];
}): CareerExperienceSource[] {
  const portfolioSources = portfolioProjects.map((project) => ({
    id: `portfolio-${project.id}`,
    source: "Portfolio",
    title: project.name,
    detail: [project.description, project.tools].filter(Boolean).join("\n")
  }));

  const dataProjectSources = dataProjects.map((project) => ({
    id: `data-${project.id}`,
    source: "Data Project",
    title: project.selectedTopic || project.portfolioCard.projectName,
    detail: [project.researchQuestion, project.dataPlan, project.analysisMethod]
      .filter(Boolean)
      .join("\n")
  }));

  const researchSources = researchItems.map((item) => ({
    id: `research-${item.id}`,
    source: "Research",
    title: item.title,
    detail: [item.question, item.data, item.notes].filter(Boolean).join("\n")
  }));

  const courseSources = courses.flatMap((course) =>
    course.assignments.map((assignment) => ({
      id: `course-${course.id}-${assignment.id}`,
      source: "Course",
      title: `${course.name} · ${assignment.title}`,
      detail: [assignment.status, assignment.notes].filter(Boolean).join("\n")
    }))
  );

  const careerSources = items
    .filter((item) => item.notes || item.documents || item.coverLetterDraft)
    .map((item) => ({
      id: `career-${item.id}`,
      source: "Career",
      title: item.name,
      detail: [item.type, item.status, item.documents, item.notes, item.coverLetterDraft]
        .filter(Boolean)
        .join("\n")
    }));

  return [
    ...portfolioSources,
    ...dataProjectSources,
    ...researchSources,
    ...courseSources,
    ...careerSources
  ].filter((source) => source.title && source.detail);
}

function buildCareerName(draft: CareerCoachDraft) {
  return (
    [draft.organization.trim(), draft.role.trim()].filter(Boolean).join(" · ") ||
    `${draft.targetCareer} 지원 준비`
  );
}
