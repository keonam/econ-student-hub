import { ShieldCheck } from "lucide-react";
import { plagiarismChecklist } from "@/lib/ai/report-assistant";
import { Panel } from "@/components/ui";

export function ReportEthicsPanel() {
  return (
    <Panel className="grid gap-3">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-coral-50 text-coral-600">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-bold text-ink">윤리적 사용 안내</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            이 기능은 완성본 대필이 아니라 주제 정리, 개요 설계, 자료 조사 계획을 돕는 초안 도구입니다.
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        {plagiarismChecklist.map((item) => (
          <label key={item} className="flex items-start gap-2 text-sm leading-6 text-zinc-700">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-line accent-teal-600" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </Panel>
  );
}
