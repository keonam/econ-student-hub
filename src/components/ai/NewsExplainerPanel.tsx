"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Newspaper, Plus, Save, WandSparkles } from "lucide-react";
import type { AiResponsePayload, NewsExplainerDraft, NewsExplainerSeed } from "@/types/ai";
import {
  buildNewsExplainerDraft,
  buildNewsExplainerInput
} from "@/lib/ai/news-explainer";
import { requestAiResponse } from "@/lib/ai/client";
import { cn } from "@/lib/cn";
import { AiResponseCard } from "@/components/ai/AiResponseCard";
import { Badge, Button, Field, Panel, TextArea, TextInput } from "@/components/ui";

type NewsExplainerPanelProps = {
  seed: NewsExplainerSeed | null;
  onApplyToForm: (draft: NewsExplainerDraft) => void;
  onSave: (draft: NewsExplainerDraft) => void;
};

export function NewsExplainerPanel({ onApplyToForm, onSave, seed }: NewsExplainerPanelProps) {
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [articleText, setArticleText] = useState("");
  const [note, setNote] = useState("");
  const [sourceType, setSourceType] = useState<"url" | "text">("url");
  const [response, setResponse] = useState<AiResponsePayload | null>(null);
  const [draft, setDraft] = useState<NewsExplainerDraft | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!seed) {
      return;
    }

    const nextSourceType = seed.text.trim() ? "text" : "url";
    setTitle(seed.title);
    setSourceUrl(seed.url);
    setArticleText(seed.text);
    setNote(seed.note ?? "");
    setSourceType(nextSourceType);
    void analyzeNews({
      nextArticleText: seed.text,
      nextNote: seed.note ?? "",
      nextSourceType,
      nextSourceUrl: seed.url,
      nextTitle: seed.title
    });
  }, [seed]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await analyzeNews();
  }

  async function analyzeNews(override?: {
    nextArticleText: string;
    nextNote: string;
    nextSourceType: "url" | "text";
    nextSourceUrl: string;
    nextTitle: string;
  }) {
    const nextTitle = override?.nextTitle ?? title;
    const nextSourceUrl = override?.nextSourceUrl ?? sourceUrl;
    const nextArticleText = override?.nextArticleText ?? articleText;
    const nextNote = override?.nextNote ?? note;
    const nextSourceType = override?.nextSourceType ?? sourceType;

    if (!nextSourceUrl.trim() && !nextArticleText.trim()) {
      setError("뉴스 URL 또는 기사 본문을 입력해주세요.");
      setResponse(null);
      setDraft(null);
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse(null);
    setDraft(null);

    try {
      const input = buildNewsExplainerInput({
        articleText: nextArticleText,
        sourceType: nextSourceType,
        sourceUrl: nextSourceUrl,
        title: nextTitle
      });

      const result = await requestAiResponse(
        {
          feature: "newsExplainer",
          input,
          sourceType: nextSourceType,
          sourceUrl: nextSourceUrl,
          articleTitle: nextTitle,
          promptVariables: {
            sourceType: nextSourceType,
            articleTitle: nextTitle,
            sourceUrl: nextSourceUrl,
            articleText: nextArticleText
          }
        },
        "AI 뉴스 분석에 실패했습니다."
      );

      const nextDraft = buildNewsExplainerDraft({
        response: result,
        title: nextTitle,
        url: nextSourceUrl,
        note: nextNote,
        sourceType: nextSourceType
      });

      setResponse(result);
      setDraft(nextDraft);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI 뉴스 분석 중 문제가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function applyDraftToForm() {
    if (!draft) {
      return;
    }

    onApplyToForm(draft);
  }

  function saveDraft() {
    if (!draft) {
      return;
    }

    onSave(draft);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel className="grid gap-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Newspaper className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">AI News Explainer</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              URL 또는 기사 본문을 입력하면 기사 내용 기준으로 경제 이슈와 토론 포인트를 정리합니다.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gold-100 bg-gold-50 p-3 text-sm leading-6 text-gold-600">
          URL만 입력하면 AI가 원문을 직접 읽었다고 가정하지 않습니다. 더 정확한 분석이 필요하면 기사 본문을 붙여넣어 주세요. 이 기능은 학습용이며 투자 조언이 아닙니다.
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <p className="text-sm font-bold text-zinc-700">입력 방식</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { id: "url", label: "뉴스 URL", description: "링크 중심으로 저장" },
                { id: "text", label: "기사 텍스트", description: "본문 기준으로 분석" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSourceType(item.id as "url" | "text")}
                  className={cn(
                    "rounded-lg border p-3 text-left transition",
                    sourceType === item.id
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink hover:bg-teal-50"
                  )}
                >
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span
                    className={cn(
                      "mt-1 block text-xs leading-5",
                      sourceType === item.id ? "text-white/75" : "text-zinc-500"
                    )}
                  >
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="제목">
              <TextInput
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="기사 제목 또는 저장할 제목"
              />
            </Field>
            <Field label="원문 URL">
              <TextInput
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://"
                type="url"
              />
            </Field>
          </div>

          <Field label="기사 본문 또는 핵심 문단">
            <TextArea
              value={articleText}
              onChange={(event) => setArticleText(event.target.value)}
              placeholder="URL 내용을 직접 가져올 수 없는 경우 기사 본문을 여기에 붙여넣어 주세요."
              className="min-h-36"
            />
          </Field>

          <Field label="내 생각 메모">
            <TextArea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="수업, 리포트, 토론에서 내가 연결하고 싶은 생각"
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
              {isLoading ? "분석 중" : "AI 분석"}
            </Button>
            <Button variant="secondary" disabled={!draft} onClick={applyDraftToForm}>
              <Plus className="h-4 w-4" />
              저장 폼에 반영
            </Button>
            <Button variant="secondary" disabled={!draft} onClick={saveDraft}>
              <Save className="h-4 w-4" />
              분석 결과 저장
            </Button>
          </div>
        </form>
      </Panel>

      <AiResponseCard
        title="뉴스 분석 결과"
        description="분석은 기사 내용 기준으로 표시되며, 투자 조언으로 사용하면 안 됩니다."
        response={response}
        isLoading={isLoading}
        error={error}
        emptyMessage="뉴스 URL 또는 본문을 입력하고 AI 분석을 실행하면 결과가 표시됩니다."
        metadata={[
          {
            label: sourceType === "url" ? "URL 기준" : "본문 기준",
            tone: "teal"
          }
        ]}
      />

      {draft ? (
        <Panel className="xl:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="teal">저장 미리보기</Badge>
            {draft.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>
          <h4 className="mt-3 font-bold text-ink">{draft.title}</h4>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{draft.summary}</p>
        </Panel>
      ) : null}
    </div>
  );
}
