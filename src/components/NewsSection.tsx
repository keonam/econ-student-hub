"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Tags,
  Trash2,
  WandSparkles,
  X
} from "lucide-react";
import type { EconNewsItem } from "@/types";
import type { NewsExplainerDraft, NewsExplainerSeed } from "@/types/ai";
import { addDays, compareDate, formatDate } from "@/lib/date";
import { makeId } from "@/lib/id";
import { newsTagOptions } from "@/lib/sample-data";
import { getSafeExternalUrl } from "@/lib/url";
import { NewsExplainerPanel } from "@/components/ai/NewsExplainerPanel";
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
import { cn } from "@/lib/cn";

type NewsSectionProps = {
  items: EconNewsItem[];
  query: string;
  onChange: (items: EconNewsItem[]) => void;
};

type NewsForm = {
  title: string;
  url: string;
  tags: string[];
  summary: string;
  concepts: string;
  note: string;
  aiAnalysis?: EconNewsItem["aiAnalysis"];
};

const emptyNewsForm: NewsForm = {
  title: "",
  url: "",
  tags: [],
  summary: "",
  concepts: "",
  note: ""
};

export function NewsSection({ items, query, onChange }: NewsSectionProps) {
  const [form, setForm] = useState<NewsForm>(emptyNewsForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState("");
  const [selectedTag, setSelectedTag] = useState("전체");
  const [analysisSeed, setAnalysisSeed] = useState<NewsExplainerSeed | null>(null);
  const [expandedAnalysisIds, setExpandedAnalysisIds] = useState<string[]>([]);

  const allTags = useMemo(
    () => Array.from(new Set([...newsTagOptions, ...items.flatMap((item) => item.tags)])),
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...items]
      .filter((item) => {
        const matchesTag = selectedTag === "전체" || item.tags.includes(selectedTag);
        const text = [
          item.title,
          item.url,
          item.summary,
          item.concepts,
          item.note,
          item.aiAnalysis?.output,
          ...item.tags
        ]
          .join(" ")
          .toLowerCase();
        const matchesQuery = normalizedQuery ? text.includes(normalizedQuery) : true;

        return matchesTag && matchesQuery;
      })
      .sort((a, b) => compareDate(b.savedAt, a.savedAt));
  }, [items, query, selectedTag]);

  function resetForm() {
    setForm(emptyNewsForm);
    setEditingId(null);
    setCustomTag("");
  }

  function toggleTag(tag: string) {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag]
    }));
  }

  function addCustomTag() {
    const tag = customTag.trim();

    if (!tag || form.tags.includes(tag)) {
      setCustomTag("");
      return;
    }

    setForm((current) => ({ ...current, tags: [...current.tags, tag] }));
    setCustomTag("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextItem = {
      title: form.title.trim(),
      url: form.url.trim(),
      tags: form.tags,
      summary: form.summary.trim(),
      concepts: form.concepts.trim(),
      note: form.note.trim(),
      aiAnalysis: form.aiAnalysis
    };

    if (!nextItem.title) {
      return;
    }

    if (editingId) {
      onChange(
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...nextItem,
                savedAt: addDays(0)
              }
            : item
        )
      );
    } else {
      onChange([
        {
          id: makeId("news"),
          ...nextItem,
          savedAt: addDays(0)
        },
        ...items
      ]);
    }

    resetForm();
  }

  function handleEdit(item: EconNewsItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      url: item.url,
      tags: item.tags,
      summary: item.summary,
      concepts: item.concepts,
      note: item.note ?? "",
      aiAnalysis: item.aiAnalysis
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(itemId: string) {
    onChange(items.filter((item) => item.id !== itemId));
  }

  function handleAnalyzeCurrentForm() {
    setAnalysisSeed({
      id: makeId("news-seed"),
      title: form.title,
      url: form.url,
      text: [form.summary, form.concepts].filter(Boolean).join("\n\n"),
      note: form.note
    });
  }

  function applyAnalysisDraft(draft: NewsExplainerDraft) {
    setForm({
      title: draft.title,
      url: draft.url,
      tags: draft.tags,
      summary: draft.summary,
      concepts: draft.concepts,
      note: draft.note,
      aiAnalysis: draft.aiAnalysis
    });
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveAnalysisDraft(draft: NewsExplainerDraft) {
    onChange([
      {
        id: makeId("news"),
        title: draft.title,
        url: draft.url,
        tags: draft.tags,
        summary: draft.summary,
        concepts: draft.concepts,
        note: draft.note,
        aiAnalysis: draft.aiAnalysis,
        savedAt: addDays(0)
      },
      ...items
    ]);
  }

  function toggleAnalysis(itemId: string) {
    setExpandedAnalysisIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  }

  return (
    <div className="grid gap-5">
      <SectionHeader
        title="Econ News"
        description="경제 기사 링크와 AI 분석을 개념, 태그, 메모와 함께 저장합니다."
      />

      <NewsExplainerPanel
        seed={analysisSeed}
        onApplyToForm={applyAnalysisDraft}
        onSave={saveAnalysisDraft}
      />

      <Panel>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-ink">
              {editingId ? "뉴스 링크 수정" : "뉴스 링크 저장"}
            </h3>
            {editingId ? (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                취소
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="제목">
              <TextInput
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="기사 제목"
                required
              />
            </Field>
            <Field label="URL">
              <TextInput
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
                placeholder="https://"
                type="url"
              />
            </Field>
            <Field label="한 줄 요약">
              <TextArea
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
                placeholder="기사에서 기억할 핵심 문장"
              />
            </Field>
            <Field label="관련 경제 개념">
              <TextArea
                value={form.concepts}
                onChange={(event) => setForm({ ...form, concepts: event.target.value })}
                placeholder="예: 통화정책, 환율전가, 필립스 곡선"
              />
            </Field>
            <Field label="내 생각 메모" className="md:col-span-2">
              <TextArea
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
                placeholder="리포트, 토론, 면접에서 내가 연결하고 싶은 생각"
              />
            </Field>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <Tags className="h-4 w-4" />
              태그
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-bold ring-1 transition",
                    form.tags.includes(tag)
                      ? "bg-teal-600 text-white ring-teal-600"
                      : "bg-white text-zinc-700 ring-line hover:bg-teal-50"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex max-w-md gap-2">
              <TextInput
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                placeholder="직접 태그 입력"
              />
              <Button variant="secondary" onClick={addCustomTag}>
                <Plus className="h-4 w-4" />
                태그
              </Button>
            </div>
            {form.tags.length ? (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="inline-flex min-h-7 items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-100"
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit">
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "저장" : "추가"}
            </Button>
            <Button variant="secondary" onClick={handleAnalyzeCurrentForm}>
              <WandSparkles className="h-4 w-4" />
              AI 분석
            </Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <h3 className="font-bold text-ink">태그 필터</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["전체", ...allTags].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-bold ring-1 transition",
                  selectedTag === tag
                    ? "bg-ink text-white ring-ink"
                    : "bg-white text-zinc-700 ring-line hover:bg-zinc-100"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {filteredItems.map((item) => {
              const safeUrl = getSafeExternalUrl(item.url);

              return (
              <article key={item.id} className="rounded-lg border border-line bg-paper/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold leading-6 text-ink">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">
                      저장일 {formatDate(item.savedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <IconButton label="뉴스 수정" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="뉴스 삭제"
                      variant="danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
                {item.summary ? (
                  <p className="mt-3 text-sm leading-6 text-zinc-700">{item.summary}</p>
                ) : null}
                {item.concepts ? (
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    <span className="font-bold text-ink">개념</span> {item.concepts}
                  </p>
                ) : null}
                {item.note ? (
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    <span className="font-bold text-ink">내 메모</span> {item.note}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} tone="teal">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {safeUrl ? (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-bold text-ink hover:bg-teal-50"
                    >
                      기사 열기
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                  {item.aiAnalysis ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleAnalysis(item.id)}
                    >
                      {expandedAnalysisIds.includes(item.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      AI 분석 {expandedAnalysisIds.includes(item.id) ? "접기" : "펼치기"}
                    </Button>
                  ) : null}
                </div>
                {item.aiAnalysis && expandedAnalysisIds.includes(item.id) ? (
                  <NewsAnalysisDetails analysis={item.aiAnalysis} />
                ) : null}
              </article>
              );
            })}
          </div>
        ) : (
          <EmptyState>조건에 맞는 경제 뉴스가 없습니다.</EmptyState>
        )}
      </Panel>
    </div>
  );
}

function NewsAnalysisDetails({ analysis }: { analysis: NonNullable<EconNewsItem["aiAnalysis"]> }) {
  const sections = [
    ["3줄 요약", analysis.threeLineSummary],
    ["핵심 경제 이슈", analysis.coreIssue],
    ["관련 경제 개념", analysis.concepts],
    ["주요 이해관계자", analysis.stakeholders],
    ["단기 영향", analysis.shortTermImpact],
    ["장기 영향", analysis.longTermImpact],
    ["찬반 관점", analysis.perspectives],
    ["리포트/토론 문장", analysis.reportSentence],
    ["면접 답변 예시", analysis.interviewAnswer]
  ];

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone="gold">기사 내용 기준</Badge>
        <Badge tone="neutral">{analysis.model}</Badge>
        <Badge tone="neutral">{new Date(analysis.analyzedAt).toLocaleString("ko-KR")}</Badge>
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
      <div className="mt-3 flex flex-wrap gap-2">
        {analysis.recommendedTags.map((tag) => (
          <Badge key={tag} tone="teal">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        기사 내용 기준의 학습용 분석이며 투자 조언이 아닙니다.
      </p>
    </div>
  );
}
