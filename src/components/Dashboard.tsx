import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Newspaper,
  NotebookPen
} from "lucide-react";
import type { HubData } from "@/types";
import {
  compareDate,
  formatDate,
  formatFullDate,
  isFutureOrToday,
  isUpcomingWithin
} from "@/lib/date";
import { Badge, Button, EmptyState, Panel, SectionHeader } from "@/components/ui";

type DashboardProps = {
  data: HubData;
  onNavigate: (section: "courses" | "news" | "research" | "portfolio" | "career") => void;
};

export function Dashboard({ data, onNavigate }: DashboardProps) {
  const weekAssignments = data.courses
    .flatMap((course) =>
      course.assignments.map((assignment) => ({
        ...assignment,
        courseName: course.name
      }))
    )
    .filter((assignment) => isUpcomingWithin(assignment.dueDate, 7))
    .sort((a, b) => compareDate(a.dueDate, b.dueDate));

  const upcomingEvents = [
    ...data.courses.flatMap((course) =>
      course.exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        label: course.name,
        date: exam.date,
        kind: "시험"
      }))
    ),
    ...data.careers.map((item) => ({
      id: item.id,
      title: item.name,
      label: item.type,
      date: item.deadline,
      kind: "마감"
    }))
  ]
    .filter((item) => isFutureOrToday(item.date))
    .sort((a, b) => compareDate(a.date, b.date))
    .slice(0, 6);

  const recentNews = [...data.news]
    .sort((a, b) => compareDate(b.savedAt, a.savedAt))
    .slice(0, 4);

  const stats = [
    {
      label: "이번 주 과제",
      value: weekAssignments.length,
      icon: CheckCircle2,
      tone: "teal" as const
    },
    {
      label: "다가오는 일정",
      value: upcomingEvents.length,
      icon: CalendarDays,
      tone: "gold" as const
    },
    {
      label: "저장한 뉴스",
      value: data.news.length,
      icon: Newspaper,
      tone: "coral" as const
    },
    {
      label: "포트폴리오",
      value: data.portfolio.length,
      icon: BriefcaseBusiness,
      tone: "neutral" as const
    }
  ];

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <SectionHeader title="Dashboard" description={formatFullDate()} />
        <Button variant="secondary" onClick={() => onNavigate("courses")}>
          <BookOpen className="h-4 w-4" />
          과목 정리
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Panel key={stat.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-ink">{stat.value}</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-paper text-ink">
                <Icon className="h-5 w-5" />
              </span>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink">이번 주 과제</h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("courses")}>
              과목 보기
            </Button>
          </div>
          {weekAssignments.length ? (
            <div className="grid gap-3">
              {weekAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg border border-line bg-paper/50 p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{assignment.title}</p>
                      <p className="mt-1 text-sm text-zinc-600">{assignment.courseName}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="teal">{formatDate(assignment.dueDate)}</Badge>
                      <Badge tone={assignment.status === "완료" ? "neutral" : "gold"}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                  {assignment.notes ? (
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{assignment.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>이번 주 과제가 없습니다.</EmptyState>
          )}
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink">다가오는 시험/마감</h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("career")}>
              지원 현황
            </Button>
          </div>
          {upcomingEvents.length ? (
            <div className="grid gap-3">
              {upcomingEvents.map((event) => (
                <div
                  key={`${event.kind}-${event.id}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-line bg-white p-3"
                >
                  <div>
                    <p className="font-semibold text-ink">{event.title}</p>
                    <p className="mt-1 text-sm text-zinc-600">{event.label}</p>
                  </div>
                  <div className="grid justify-items-end gap-2">
                    <Badge tone={event.kind === "시험" ? "coral" : "gold"}>
                      {event.kind}
                    </Badge>
                    <span className="text-xs font-semibold text-zinc-500">
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>다가오는 시험이나 마감이 없습니다.</EmptyState>
          )}
        </Panel>
      </div>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-ink">최근 저장한 경제 뉴스</h3>
          <Button size="sm" variant="ghost" onClick={() => onNavigate("news")}>
            뉴스 관리
          </Button>
        </div>
        {recentNews.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recentNews.map((item) => (
              <article key={item.id} className="rounded-lg border border-line bg-paper/50 p-3">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <Newspaper className="h-4 w-4" />
                  {formatDate(item.savedAt)}
                </div>
                <h4 className="font-bold leading-6 text-ink">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{item.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} tone="teal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>저장한 경제 뉴스가 없습니다.</EmptyState>
        )}
      </Panel>

      <Panel className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <NotebookPen className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">리서치 아이디어와 커리어 기록을 한곳에</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              수업에서 나온 질문을 연구 로그로 저장하고, 프로젝트 카드와 지원 마감을 함께 관리하세요.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => onNavigate("research")}>
            연구 로그
          </Button>
          <Button variant="secondary" onClick={() => onNavigate("portfolio")}>
            포트폴리오
          </Button>
        </div>
      </Panel>
    </div>
  );
}
