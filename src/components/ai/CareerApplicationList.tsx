"use client";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Filter,
  Pencil,
  Sparkles,
  Trash2,
  UserRoundCheck,
  WandSparkles
} from "lucide-react";
import type { CareerItem } from "@/types";
import { compareDate, formatDate } from "@/lib/date";
import { careerTypes } from "@/lib/sample-data";
import { cn } from "@/lib/cn";
import { Badge, Button, EmptyState, IconButton, Panel } from "@/components/ui";

type CareerApplicationListProps = {
  items: CareerItem[];
  query: string;
  onAnalyze: (item: CareerItem) => void;
  onDelete: (id: string) => void;
  onEdit: (item: CareerItem) => void;
};

export function CareerApplicationList({
  items,
  onAnalyze,
  onDelete,
  onEdit,
  query
}: CareerApplicationListProps) {
  const [selectedType, setSelectedType] = useState("전체");
  const [expandedAnalysisIds, setExpandedAnalysisIds] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...items]
      .filter((item) => {
        const matchesType = selectedType === "전체" || item.type === selectedType;
        const matchesQuery = normalizedQuery
          ? [
              item.name,
              item.type,
              item.deadline,
              item.status,
              item.documents,
              item.notes,
              item.organization,
              item.role,
              item.targetCareer,
              item.coverLetterDraft,
              item.interviewReview,
              item.nextAction,
              item.aiAnalysis?.output
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
          : true;

        return matchesType && matchesQuery;
      })
      .sort((a, b) => compareDate(a.deadline, b.deadline));
  }, [items, query, selectedType]);

  function toggleAnalysis(itemId: string) {
    setExpandedAnalysisIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  }

  return (
    <Panel>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <h3 className="font-bold text-ink">유형 필터</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {["전체", ...careerTypes].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold ring-1 transition",
                selectedType === type
                  ? "bg-ink text-white ring-ink"
                  : "bg-white text-zinc-700 ring-line hover:bg-zinc-100"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <article key={item.id} className="min-w-0 rounded-lg border border-line bg-paper/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge tone="teal">
                      <BriefcaseBusiness className="mr-1 h-3.5 w-3.5" />
                      {item.type}
                    </Badge>
                    <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                    {item.targetCareer ? <Badge tone="neutral">{item.targetCareer}</Badge> : null}
                  </div>
                  <h3 className="break-words text-lg font-bold leading-6 text-ink">{item.name}</h3>
                </div>
                <div className="flex shrink-0 gap-2">
                  <IconButton label="지원 항목 수정" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label="지원 항목 삭제"
                    variant="danger"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm font-bold text-ink sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(item.deadline)}
                </div>
                {item.organization || item.role ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="break-words">
                      {[item.organization, item.role].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                ) : null}
              </div>

              {item.documents ? (
                <div className="mt-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
                    <FileCheck2 className="h-4 w-4" />
                    제출 서류
                  </div>
                  <p className="break-words text-sm leading-6 text-zinc-600">{item.documents}</p>
                </div>
              ) : null}
              {item.notes ? (
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-600">
                  {item.notes}
                </p>
              ) : null}
              {item.nextAction ? (
                <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50 p-3">
                  <div className="mb-1 flex items-center gap-2 text-sm font-bold text-teal-700">
                    <UserRoundCheck className="h-4 w-4" />
                    다음 액션
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-teal-700">
                    {item.nextAction}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => onAnalyze(item)}>
                  <WandSparkles className="h-4 w-4" />
                  AI 분석
                </Button>
                {item.aiAnalysis ? (
                  <Button variant="secondary" size="sm" onClick={() => toggleAnalysis(item.id)}>
                    {expandedAnalysisIds.includes(item.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    분석 {expandedAnalysisIds.includes(item.id) ? "접기" : "펼치기"}
                  </Button>
                ) : null}
              </div>

              {item.aiAnalysis && expandedAnalysisIds.includes(item.id) ? (
                <CareerAnalysisDetails item={item} />
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>조건에 맞는 지원 항목이 없습니다.</EmptyState>
      )}
    </Panel>
  );
}

function CareerAnalysisDetails({ item }: { item: CareerItem }) {
  const analysis = item.aiAnalysis;

  if (!analysis) {
    return null;
  }

  const sections = [
    ["진로별 준비 로드맵", analysis.roadmap],
    ["부족한 역량 분석", analysis.skillGap],
    ["추천 프로젝트", analysis.recommendedProjects],
    ["자기소개서 소재 정리", analysis.coverLetterMaterials],
    ["면접 예상 질문", analysis.interviewQuestions],
    ["STAR 방식 답변 초안", analysis.starAnswerDraft],
    ["공고와 경험 연결 포인트", analysis.connectionPoints]
  ];

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone="teal">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          AI Career Coach
        </Badge>
        <Badge tone="neutral">{analysis.targetCareer}</Badge>
        <Badge tone="neutral">{analysis.model}</Badge>
        <Badge tone="gold">{new Date(analysis.generatedAt).toLocaleString("ko-KR")}</Badge>
      </div>
      <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
        {sections.map(([label, value]) =>
          value ? (
            <div key={label}>
              <h4 className="text-sm font-bold text-ink">{label}</h4>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-600">
                {value}
              </p>
            </div>
          ) : null
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        AI 초안은 실제 경험과 공고 내용을 기준으로 검토해 수정하세요. 없는 경험이나 성과를 추가하지 않는 것이 좋습니다.
      </p>
    </div>
  );
}

function statusTone(status: CareerItem["status"]) {
  if (status === "합격") {
    return "teal";
  }

  if (status === "면접" || status === "지원 완료") {
    return "gold";
  }

  if (status === "보류") {
    return "coral";
  }

  return "neutral";
}
