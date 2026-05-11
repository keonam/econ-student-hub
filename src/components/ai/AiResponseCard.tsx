"use client";

import { useState } from "react";
import { AlertCircle, BookOpenCheck, Check, Clipboard, Sparkles } from "lucide-react";
import type { AiResponsePayload } from "@/types/ai";
import { Badge, Button, EmptyState, Panel } from "@/components/ui";

type AiResponseCardProps = {
  title: string;
  description: string;
  response: AiResponsePayload | null;
  isLoading: boolean;
  error?: string;
  emptyMessage: string;
  metadata?: Array<{
    label: string;
    tone?: "teal" | "gold" | "coral" | "neutral";
  }>;
};

export function AiResponseCard({
  description,
  emptyMessage,
  error,
  isLoading,
  metadata = [],
  response,
  title
}: AiResponseCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyAnswer() {
    if (!response?.output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(response.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Panel className="grid min-h-[24rem] min-w-0 content-start gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-gold-600">
            <BookOpenCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
          </div>
        </div>
        <Badge tone="teal">AI</Badge>
      </div>

      {isLoading ? <AiResponseSkeleton /> : null}

      {!isLoading && error ? (
        <div className="flex items-start gap-2 rounded-lg border border-coral-100 bg-coral-50 p-4 text-sm leading-6 text-coral-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && response ? (
        <article className="min-w-0 rounded-lg border border-line bg-paper/50 p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">{response.model}</Badge>
              <Badge tone="gold">{new Date(response.createdAt).toLocaleString("ko-KR")}</Badge>
              {metadata.map((item) => (
                <Badge key={item.label} tone={item.tone ?? "neutral"}>
                  <span className="max-w-44 truncate">{item.label}</span>
                </Badge>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={copyAnswer}>
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "복사됨" : "복사"}
            </Button>
          </div>
          <div className="max-h-[min(62vh,48rem)] overflow-y-auto whitespace-pre-wrap break-words pr-1 text-sm leading-7 text-zinc-800">
            {response.output}
          </div>
        </article>
      ) : null}

      {!isLoading && !error && !response ? (
        <EmptyState>
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-teal-700" />
          {emptyMessage}
        </EmptyState>
      ) : null}
    </Panel>
  );
}

function AiResponseSkeleton() {
  return (
    <div className="grid gap-4 rounded-lg border border-line bg-paper/60 p-4" aria-label="AI 응답 생성 중">
      <div className="flex flex-wrap gap-2">
        <div className="h-7 w-24 animate-pulse rounded-md bg-zinc-200" />
        <div className="h-7 w-32 animate-pulse rounded-md bg-zinc-200" />
      </div>
      <div className="grid gap-3">
        <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="grid gap-3">
        <div className="h-5 w-1/4 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="grid gap-3">
        <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-10/12 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
      </div>
    </div>
  );
}
