import { ExternalLink } from "lucide-react";
import { dataProjectSources } from "@/lib/ai/data-project-coach";
import { Panel } from "@/components/ui";

export function DataSourcePanel() {
  return (
    <Panel className="grid gap-4">
      <div>
        <h3 className="font-bold text-ink">데이터 출처 추천</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          경제학 데이터 프로젝트에서 자주 쓰는 공개 데이터 출처입니다.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dataProjectSources.map((source) => (
          <a
            key={source.name}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line bg-paper/40 p-3 transition hover:bg-teal-50"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-bold text-ink">{source.name}</h4>
              <ExternalLink className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{source.description}</p>
          </a>
        ))}
      </div>
    </Panel>
  );
}
