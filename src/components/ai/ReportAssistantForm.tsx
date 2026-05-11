"use client";

import { FormEvent } from "react";
import { FileText, LoaderCircle, WandSparkles } from "lucide-react";
import type { ReportAssistantInput } from "@/types/ai";
import { Button, Field, Panel, TextArea, TextInput } from "@/components/ui";

type ReportAssistantFormProps = {
  form: ReportAssistantInput;
  isLoading: boolean;
  onChange: (form: ReportAssistantInput) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ReportAssistantForm({
  form,
  isLoading,
  onChange,
  onSubmit
}: ReportAssistantFormProps) {
  return (
    <Panel className="grid gap-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-bold text-ink">리포트 정보 입력</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            과목, 주제, 요구사항, 가설, 데이터 아이디어를 넣으면 구조화된 조사 계획을 만듭니다.
          </p>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="과목명">
            <TextInput
              value={form.courseName}
              onChange={(event) => onChange({ ...form, courseName: event.target.value })}
              placeholder="예: 거시경제학"
            />
          </Field>
          <Field label="리포트 주제">
            <TextInput
              value={form.topic}
              onChange={(event) => onChange({ ...form, topic: event.target.value })}
              placeholder="예: 청년 실업과 경기변동"
              required
            />
          </Field>
          <Field label="분량">
            <TextInput
              value={form.length}
              onChange={(event) => onChange({ ...form, length: event.target.value })}
              placeholder="예: A4 5쪽, 3000자"
            />
          </Field>
          <Field label="마감일">
            <TextInput
              value={form.dueDate}
              onChange={(event) => onChange({ ...form, dueDate: event.target.value })}
              type="date"
            />
          </Field>
        </div>

        <Field label="교수님 요구사항">
          <TextArea
            value={form.requirements}
            onChange={(event) => onChange({ ...form, requirements: event.target.value })}
            placeholder="인용 형식, 필수 자료, 분석 방법, 발표 여부 등"
          />
        </Field>

        <Field label="현재 생각한 주장 또는 가설">
          <TextArea
            value={form.currentClaim}
            onChange={(event) => onChange({ ...form, currentClaim: event.target.value })}
            placeholder="예: 청년 실업률은 경기 요인보다 산업 구조 변화의 영향을 더 크게 받는다."
          />
        </Field>

        <Field label="사용하고 싶은 데이터 또는 사례">
          <TextArea
            value={form.dataOrCases}
            onChange={(event) => onChange({ ...form, dataOrCases: event.target.value })}
            placeholder="통계청 자료, 한국은행 경제통계, OECD 데이터, 특정 정책 사례 등"
          />
        </Field>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <WandSparkles className="h-4 w-4" />
          )}
          {isLoading ? "계획 생성 중" : "리포트 계획 생성"}
        </Button>
      </form>
    </Panel>
  );
}
