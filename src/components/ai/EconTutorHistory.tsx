"use client";

import { Clock, Star } from "lucide-react";
import type { EconTutorHistoryItem } from "@/types/ai";
import { getEconTutorCategoryLabel, getEconTutorStyleLabel } from "@/lib/ai/econ-tutor";
import { Badge, Button, EmptyState, IconButton, Panel } from "@/components/ui";
import { cn } from "@/lib/cn";

type EconTutorHistoryProps = {
  items: EconTutorHistoryItem[];
  onSelect: (item: EconTutorHistoryItem) => void;
  onToggleFavorite: (id: string) => void;
};

export function EconTutorHistory({ items, onSelect, onToggleFavorite }: EconTutorHistoryProps) {
  const sortedItems = [...items].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Panel className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-ink">최근 질문 기록</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            질문, 답변, 카테고리, 답변 스타일, 생성 날짜, 즐겨찾기 여부를 저장합니다.
          </p>
        </div>
        <Badge tone="neutral">{items.length} Records</Badge>
      </div>

      {sortedItems.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {sortedItems.map((item) => (
            <article key={item.id} className="rounded-lg border border-line bg-paper/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge tone="teal">{getEconTutorCategoryLabel(item.category)}</Badge>
                    <Badge tone="gold">{getEconTutorStyleLabel(item.answerStyle)}</Badge>
                    {item.isFavorite ? <Badge tone="coral">즐겨찾기</Badge> : null}
                  </div>
                  <h4 className="line-clamp-2 font-bold leading-6 text-ink">{item.question}</h4>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(item.createdAt).toLocaleString("ko-KR")}
                  </p>
                </button>
                <IconButton
                  label={item.isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
                  variant={item.isFavorite ? "danger" : "secondary"}
                  onClick={() => onToggleFavorite(item.id)}
                  className={cn(item.isFavorite && "bg-coral-50")}
                >
                  <Star className={cn("h-4 w-4", item.isFavorite && "fill-current")} />
                </IconButton>
              </div>
              <Button className="mt-3" size="sm" variant="secondary" onClick={() => onSelect(item)}>
                답변 다시 보기
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>아직 저장된 질문 기록이 없습니다.</EmptyState>
      )}
    </Panel>
  );
}
