"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  Database,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  NotebookPen,
  Search,
  Sparkles,
  Target
} from "lucide-react";
import type { CareerItem, CareerPath, HubData } from "@/types";
import { careerStatuses, careerTypes, createInitialData } from "@/lib/sample-data";
import { careerPathOptions } from "@/lib/ai/career-coach";
import { cn } from "@/lib/cn";
import { Badge, Panel, TextInput } from "@/components/ui";
import { Dashboard } from "@/components/Dashboard";
import { CoursesSection } from "@/components/CoursesSection";
import { NewsSection } from "@/components/NewsSection";
import { ResearchSection } from "@/components/ResearchSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { CareerSection } from "@/components/CareerSection";
import { AiEconTutorSection } from "@/components/AiEconTutorSection";
import { AiReportAssistantSection } from "@/components/AiReportAssistantSection";
import { AiDataProjectCoachSection } from "@/components/AiDataProjectCoachSection";

const storageKey = "econ-student-hub:v1";

type SectionId =
  | "dashboard"
  | "courses"
  | "news"
  | "research"
  | "portfolio"
  | "career"
  | "aiTutor"
  | "aiReport"
  | "dataCoach";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "aiTutor", label: "AI Tutor", icon: Sparkles },
  { id: "aiReport", label: "AI Report", icon: FileText },
  { id: "dataCoach", label: "Data Coach", icon: Database },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "news", label: "Econ News", icon: Newspaper },
  { id: "research", label: "Research Log", icon: NotebookPen },
  { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { id: "career", label: "Career Tracker", icon: Target }
] satisfies Array<{
  id: SectionId;
  label: string;
  icon: typeof LayoutDashboard;
}>;

export function EconStudentHub() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [query, setQuery] = useState("");
  const [data, setData] = useStoredHubData();

  const counts = useMemo(
    () => ({
      courses: data.courses.length,
      news: data.news.length,
      research: data.research.length,
      portfolio: data.portfolio.length,
      career: data.careers.length,
      aiReport: data.reports.length,
      dataCoach: data.dataProjects.length
    }),
    [data]
  );

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[264px_1fr] lg:px-6 lg:py-6">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Panel className="flex h-full flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                <GraduationCap className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold text-ink">Econ Student Hub</h1>
                <p className="text-xs font-semibold text-zinc-500">Academic · Career</p>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const count =
                  item.id in counts ? counts[item.id as keyof typeof counts] : null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "flex min-w-fit items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-bold transition lg:w-full",
                      isActive
                        ? "bg-ink text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-ink"
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {count !== null ? (
                      <span
                        className={cn(
                          "hidden rounded-md px-1.5 py-0.5 text-xs lg:inline-flex",
                          isActive ? "bg-white/15 text-white" : "bg-white text-zinc-500"
                        )}
                      >
                        {count}
                      </span>
                    ) : item.id === "aiTutor" ? (
                      <span
                        className={cn(
                          "hidden rounded-md px-1.5 py-0.5 text-xs lg:inline-flex",
                          isActive ? "bg-white/15 text-white" : "bg-teal-50 text-teal-700"
                        )}
                      >
                        AI
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto hidden rounded-lg bg-teal-50 p-3 text-sm leading-6 text-teal-700 lg:block">
              <p className="font-bold">localStorage 저장</p>
              <p className="mt-1">브라우저에 기록이 자동 저장됩니다.</p>
            </div>
          </Panel>
        </aside>

        <div className="grid gap-4">
          <Panel className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <TextInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="과목, 뉴스, 연구, 프로젝트, 지원 현황 검색"
                className="pl-9"
                aria-label="전체 검색"
              />
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Badge tone="teal">{counts.courses} Courses</Badge>
              <Badge tone="coral">{counts.news} News</Badge>
              <Badge tone="gold">{counts.career} Career</Badge>
            </div>
          </Panel>

          <section className="pb-10">
            {activeSection === "dashboard" ? (
              <Dashboard data={data} onNavigate={setActiveSection} />
            ) : null}

            {activeSection === "aiTutor" ? <AiEconTutorSection data={data} /> : null}

            {activeSection === "aiReport" ? (
              <AiReportAssistantSection
                reports={data.reports}
                onChange={(reports) => setData((current) => ({ ...current, reports }))}
              />
            ) : null}

            {activeSection === "dataCoach" ? (
              <AiDataProjectCoachSection
                dataProjects={data.dataProjects}
                portfolioProjects={data.portfolio}
                onDataProjectsChange={(dataProjects) =>
                  setData((current) => ({ ...current, dataProjects }))
                }
                onPortfolioChange={(portfolio) =>
                  setData((current) => ({ ...current, portfolio }))
                }
              />
            ) : null}

            {activeSection === "courses" ? (
              <CoursesSection
                courses={data.courses}
                query={query}
                onChange={(courses) => setData((current) => ({ ...current, courses }))}
              />
            ) : null}

            {activeSection === "news" ? (
              <NewsSection
                items={data.news}
                query={query}
                onChange={(news) => setData((current) => ({ ...current, news }))}
              />
            ) : null}

            {activeSection === "research" ? (
              <ResearchSection
                items={data.research}
                query={query}
                onChange={(research) => setData((current) => ({ ...current, research }))}
              />
            ) : null}

            {activeSection === "portfolio" ? (
              <PortfolioSection
                projects={data.portfolio}
                query={query}
                onChange={(portfolio) => setData((current) => ({ ...current, portfolio }))}
              />
            ) : null}

            {activeSection === "career" ? (
              <CareerSection
                courses={data.courses}
                dataProjects={data.dataProjects}
                items={data.careers}
                portfolioProjects={data.portfolio}
                query={query}
                researchItems={data.research}
                onChange={(careers) => setData((current) => ({ ...current, careers }))}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function useStoredHubData() {
  const [data, setData] = useState<HubData>(() => createInitialData());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const savedData = window.localStorage.getItem(storageKey);

      if (savedData) {
        setData(normalizeData(JSON.parse(savedData)));
      }
    } catch {
      window.localStorage.removeItem(storageKey);
      setData(createInitialData());
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, isReady]);

  return [data, setData] as const;
}

function normalizeData(value: Partial<HubData> | null): HubData {
  const initialData = createInitialData();

  return {
    courses: Array.isArray(value?.courses) ? value.courses : initialData.courses,
    news: Array.isArray(value?.news) ? value.news : initialData.news,
    research: Array.isArray(value?.research) ? value.research : initialData.research,
    portfolio: Array.isArray(value?.portfolio) ? value.portfolio : initialData.portfolio,
    careers: normalizeCareerItems(value?.careers, initialData.careers),
    reports: Array.isArray(value?.reports) ? value.reports : initialData.reports,
    dataProjects: Array.isArray(value?.dataProjects)
      ? value.dataProjects
      : initialData.dataProjects
  };
}

function normalizeCareerItems(value: unknown, fallback: CareerItem[]): CareerItem[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .filter((item): item is Partial<CareerItem> => Boolean(item && typeof item === "object"))
    .map((item, index) => ({
      id: stringOrFallback(item.id, `career-${index}`),
      name: stringOrFallback(item.name, "지원 항목"),
      type: isCareerType(item.type) ? item.type : "인턴십",
      deadline: stringOrFallback(item.deadline, fallback[index]?.deadline ?? ""),
      status: isCareerStatus(item.status) ? item.status : "관심",
      documents: stringOrFallback(item.documents, ""),
      notes: stringOrFallback(item.notes, ""),
      organization: optionalString(item.organization),
      role: optionalString(item.role),
      targetCareer: isCareerPath(item.targetCareer) ? item.targetCareer : undefined,
      coverLetterDraft: optionalString(item.coverLetterDraft),
      interviewReview: optionalString(item.interviewReview),
      nextAction: optionalString(item.nextAction),
      aiAnalysis: isCareerAiAnalysis(item.aiAnalysis) ? item.aiAnalysis : undefined
    }));
}

function isCareerType(value: unknown): value is CareerItem["type"] {
  return typeof value === "string" && careerTypes.includes(value as CareerItem["type"]);
}

function isCareerStatus(value: unknown): value is CareerItem["status"] {
  return typeof value === "string" && careerStatuses.includes(value as CareerItem["status"]);
}

function isCareerPath(value: unknown): value is CareerPath {
  return typeof value === "string" && careerPathOptions.includes(value as CareerPath);
}

function isCareerAiAnalysis(value: unknown): value is NonNullable<CareerItem["aiAnalysis"]> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const analysis = value as Partial<NonNullable<CareerItem["aiAnalysis"]>>;

  return Boolean(
    typeof analysis.output === "string" &&
      typeof analysis.model === "string" &&
      typeof analysis.generatedAt === "string" &&
      isCareerPath(analysis.targetCareer)
  );
}

function stringOrFallback(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
