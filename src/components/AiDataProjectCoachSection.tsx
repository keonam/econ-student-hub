"use client";

import { FormEvent, useState } from "react";
import type { DataProject, PortfolioProject } from "@/types";
import type {
  AiResponsePayload,
  DataProjectCoachDraft,
  DataProjectCoachInput
} from "@/types/ai";
import {
  buildDataProjectCoachDraft,
  buildDataProjectCoachInput
} from "@/lib/ai/data-project-coach";
import { requestAiResponse } from "@/lib/ai/client";
import { addDays } from "@/lib/date";
import { makeId } from "@/lib/id";
import { AiResponseCard } from "@/components/ai/AiResponseCard";
import { DataProjectList } from "@/components/ai/DataProjectList";
import { DataProjectWizard } from "@/components/ai/DataProjectWizard";
import { DataSourcePanel } from "@/components/ai/DataSourcePanel";
import { SectionHeader } from "@/components/ui";

type AiDataProjectCoachSectionProps = {
  dataProjects: DataProject[];
  portfolioProjects: PortfolioProject[];
  onDataProjectsChange: (projects: DataProject[]) => void;
  onPortfolioChange: (projects: PortfolioProject[]) => void;
};

type WizardStep = "interest" | "question" | "data" | "method" | "portfolio";

const emptyForm: DataProjectCoachInput = {
  interestArea: "",
  selectedTopic: "",
  researchQuestion: "",
  dataPlan: "",
  analysisMethod: ""
};

export function AiDataProjectCoachSection({
  dataProjects,
  onDataProjectsChange,
  onPortfolioChange,
  portfolioProjects
}: AiDataProjectCoachSectionProps) {
  const [form, setForm] = useState<DataProjectCoachInput>(emptyForm);
  const [draft, setDraft] = useState<DataProjectCoachDraft | null>(null);
  const [response, setResponse] = useState<AiResponsePayload | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<WizardStep>("interest");

  async function generateIdeas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.interestArea.trim()) {
      setError("관심 분야를 입력해주세요.");
      setResponse(null);
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await requestAiResponse(
        {
          feature: "dataProjectCoach",
          input: buildDataProjectCoachInput(form)
        },
        "데이터 프로젝트 추천 생성에 실패했습니다."
      );

      const nextDraft = buildDataProjectCoachDraft({ input: form, response: result });
      setResponse(result);
      setDraft(nextDraft);
      setForm({
        interestArea: nextDraft.interestArea,
        selectedTopic: nextDraft.selectedTopic,
        researchQuestion: nextDraft.researchQuestion,
        dataPlan: nextDraft.dataPlan,
        analysisMethod: nextDraft.analysisMethod
      });
      setStep("question");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "데이터 프로젝트 추천 생성 중 문제가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(nextDraft: DataProjectCoachDraft) {
    setDraft(nextDraft);
    setForm({
      interestArea: nextDraft.interestArea,
      selectedTopic: nextDraft.selectedTopic,
      researchQuestion: nextDraft.researchQuestion,
      dataPlan: nextDraft.dataPlan,
      analysisMethod: nextDraft.analysisMethod
    });
  }

  function updateForm(nextForm: DataProjectCoachInput) {
    setForm(nextForm);
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      ...nextForm
    });
  }

  function saveProject() {
    if (!draft) {
      return;
    }

    const now = new Date().toISOString();
    const project: DataProject = {
      id: makeId("data-project"),
      interestArea: draft.interestArea.trim(),
      selectedTopic: draft.selectedTopic.trim(),
      researchQuestion: draft.researchQuestion.trim(),
      dataPlan: draft.dataPlan.trim(),
      independentVariables: draft.independentVariables.trim(),
      dependentVariable: draft.dependentVariable.trim(),
      controlVariables: draft.controlVariables.trim(),
      analysisMethod: draft.analysisMethod.trim(),
      limitations: draft.limitations.trim(),
      portfolioCard: draft.portfolioCard,
      aiPlan: draft.aiPlan,
      createdAt: now,
      updatedAt: now
    };

    onDataProjectsChange([project, ...dataProjects]);
  }

  function addProjectToPortfolio(project: DataProject) {
    const card = project.portfolioCard;
    const description = [
      `문제 정의: ${card.problemDefinition}`,
      `사용 데이터: ${card.data}`,
      `분석 방법: ${card.method}`,
      card.keyResult ? `핵심 결과: ${card.keyResult}` : "",
      card.lessons ? `배운 점: ${card.lessons}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    onPortfolioChange([
      {
        id: makeId("portfolio"),
        name: card.projectName || project.selectedTopic,
        description,
        tools: card.method,
        resultLink: card.visualizationUrl,
        githubLink: card.githubUrl,
        updatedAt: addDays(0)
      },
      ...portfolioProjects
    ]);
  }

  return (
    <div className="grid gap-5">
      <SectionHeader
        title="Data Project Coach"
        description="경제 데이터 분석 프로젝트를 기획하고 포트폴리오 카드로 정리합니다."
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <DataProjectWizard
          draft={draft}
          form={form}
          isLoading={isLoading}
          step={step}
          onDraftChange={updateDraft}
          onFormChange={updateForm}
          onGenerate={generateIdeas}
          onSave={saveProject}
          onStepChange={setStep}
        />

        <AiResponseCard
          title="AI 설계 제안"
          description="분석 주제 5개, 연구 질문, 데이터, 방법, 한계점, 포트폴리오 카드 초안을 표시합니다."
          response={response}
          isLoading={isLoading}
          error={error}
          emptyMessage="관심 분야를 입력하고 AI 주제 추천을 실행하면 설계 제안이 표시됩니다."
          metadata={[
            {
              label: form.interestArea || "관심 분야 미정",
              tone: "teal"
            }
          ]}
        />
      </div>

      <DataSourcePanel />

      <DataProjectList projects={dataProjects} onAddToPortfolio={addProjectToPortfolio} />
    </div>
  );
}
