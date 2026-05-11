"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Database,
  ExternalLink,
  FileText,
  Lightbulb,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2
} from "lucide-react";
import type { ResearchLogItem } from "@/types";
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

type ResearchSectionProps = {
  items: ResearchLogItem[];
  query: string;
  onChange: (items: ResearchLogItem[]) => void;
};

type ResearchForm = Omit<ResearchLogItem, "id" | "createdAt">;

const emptyResearchForm: ResearchForm = {
  title: "",
  sourceLink: "",
  question: "",
  data: "",
  notes: ""
};

export function ResearchSection({ items, query, onChange }: ResearchSectionProps) {
  const [form, setForm] = useState<ResearchForm>(emptyResearchForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...items]
      .filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        return [item.title, item.sourceLink, item.question, item.data, item.notes]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => compareDate(b.createdAt, a.createdAt));
  }, [items, query]);

  function resetForm() {
    setForm(emptyResearchForm);
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextItem = {
      title: form.title.trim(),
      sourceLink: form.sourceLink.trim(),
      question: form.question.trim(),
      data: form.data.trim(),
      notes: form.notes.trim()
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
                ...nextItem
              }
            : item
        )
      );
    } else {
      onChange([
        {
          id: makeId("research"),
          ...nextItem,
          createdAt: addDays(0)
        },
        ...items
      ]);
    }

    resetForm();
  }

  function handleEdit(item: ResearchLogItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      sourceLink: item.sourceLink,
      question: item.question,
      data: item.data,
      notes: item.notes
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(itemId: string) {
    onChange(items.filter((item) => item.id !== itemId));
  }

  return (
    <div className="grid gap-5">
      <SectionHeader
        title="Research Log"
        description="논문, 보고서, 데이터 분석 아이디어를 질문 중심으로 기록합니다."
      />

      <Panel>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-ink">{editingId ? "연구 기록 수정" : "연구 기록 추가"}</h3>
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
                placeholder="예: 환율 변동과 수입물가"
                required
              />
            </Field>
            <Field label="출처 링크">
              <TextInput
                value={form.sourceLink}
                onChange={(event) => setForm({ ...form, sourceLink: event.target.value })}
                placeholder="https://"
                type="url"
              />
            </Field>
            <Field label="핵심 질문">
              <TextArea
                value={form.question}
                onChange={(event) => setForm({ ...form, question: event.target.value })}
                placeholder="무엇을 설명하거나 검증하고 싶은가?"
              />
            </Field>
            <Field label="사용 데이터">
              <TextArea
                value={form.data}
                onChange={(event) => setForm({ ...form, data: event.target.value })}
                placeholder="데이터 출처, 기간, 변수"
              />
            </Field>
            <Field label="메모" className="md:col-span-2">
              <TextArea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="모형, 가설, 다음 액션"
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

      {filteredItems.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredItems.map((item) => {
            const safeSourceLink = getSafeExternalUrl(item.sourceLink);

            return (
            <Panel key={item.id} className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <FileText className="h-4 w-4" />
                    {formatDate(item.createdAt)}
                  </div>
                  <h3 className="text-lg font-bold leading-6 text-ink">{item.title}</h3>
                </div>
                <div className="flex gap-2">
                  <IconButton label="연구 기록 수정" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label="연구 기록 삭제"
                    variant="danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
              {item.question ? (
                <div className="rounded-lg bg-teal-50 p-3">
                  <div className="mb-1 flex items-center gap-2 text-sm font-bold text-teal-700">
                    <Lightbulb className="h-4 w-4" />
                    핵심 질문
                  </div>
                  <p className="text-sm leading-6 text-zinc-700">{item.question}</p>
                </div>
              ) : null}
              {item.data ? (
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
                    <Database className="h-4 w-4" />
                    사용 데이터
                  </div>
                  <p className="text-sm leading-6 text-zinc-600">{item.data}</p>
                </div>
              ) : null}
              {item.notes ? (
                <p className="text-sm leading-6 text-zinc-600">{item.notes}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">Research</Badge>
                {safeSourceLink ? (
                  <a
                    href={safeSourceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-600"
                  >
                    출처 열기
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </Panel>
            );
          })}
        </div>
      ) : (
        <EmptyState>검색 결과에 맞는 연구 기록이 없습니다.</EmptyState>
      )}
    </div>
  );
}
