"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Link as LinkIcon,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2
} from "lucide-react";
import type { AssignmentStatus, Course, CourseAssignment, CourseExam } from "@/types";
import { assignmentStatuses } from "@/lib/sample-data";
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
  Select,
  TextArea,
  TextInput
} from "@/components/ui";

type CoursesSectionProps = {
  courses: Course[];
  query: string;
  onChange: (courses: Course[]) => void;
};

type CourseForm = Omit<Course, "id" | "assignments" | "exams">;
type AssignmentForm = Omit<CourseAssignment, "id">;
type ExamForm = Omit<CourseExam, "id">;

const emptyCourseForm: CourseForm = {
  name: "",
  professor: "",
  schedule: "",
  room: "",
  resourceLink: ""
};

function createAssignmentForm(): AssignmentForm {
  return {
    title: "",
    dueDate: addDays(3),
    status: "대기",
    notes: ""
  };
}

function createExamForm(): ExamForm {
  return {
    title: "",
    date: addDays(14),
    type: "",
    notes: ""
  };
}

export function CoursesSection({ courses, query, onChange }: CoursesSectionProps) {
  const [form, setForm] = useState<CourseForm>(emptyCourseForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return courses;
    }

    return courses.filter((course) => {
      const text = [
        course.name,
        course.professor,
        course.schedule,
        course.room,
        course.resourceLink,
        ...course.assignments.flatMap((assignment) => [
          assignment.title,
          assignment.dueDate,
          assignment.status,
          assignment.notes
        ]),
        ...course.exams.flatMap((exam) => [exam.title, exam.date, exam.type, exam.notes])
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(normalizedQuery);
    });
  }, [courses, query]);

  function resetForm() {
    setForm(emptyCourseForm);
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextCourse = {
      name: form.name.trim(),
      professor: form.professor.trim(),
      schedule: form.schedule.trim(),
      room: form.room.trim(),
      resourceLink: form.resourceLink.trim()
    };

    if (!nextCourse.name) {
      return;
    }

    if (editingId) {
      onChange(
        courses.map((course) =>
          course.id === editingId
            ? {
                ...course,
                ...nextCourse
              }
            : course
        )
      );
    } else {
      onChange([
        {
          id: makeId("course"),
          ...nextCourse,
          assignments: [],
          exams: []
        },
        ...courses
      ]);
    }

    resetForm();
  }

  function handleEdit(course: Course) {
    setEditingId(course.id);
    setForm({
      name: course.name,
      professor: course.professor,
      schedule: course.schedule,
      room: course.room,
      resourceLink: course.resourceLink
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(courseId: string) {
    if (!window.confirm("이 과목과 연결된 과제/시험 일정을 삭제할까요?")) {
      return;
    }

    onChange(courses.filter((course) => course.id !== courseId));
  }

  function addAssignment(courseId: string, assignment: AssignmentForm) {
    onChange(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              assignments: [
                ...course.assignments,
                {
                  ...assignment,
                  title: assignment.title.trim(),
                  notes: assignment.notes.trim(),
                  id: makeId("assignment")
                }
              ].sort((a, b) => compareDate(a.dueDate, b.dueDate))
            }
          : course
      )
    );
  }

  function updateAssignmentStatus(
    courseId: string,
    assignmentId: string,
    status: AssignmentStatus
  ) {
    onChange(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              assignments: course.assignments.map((assignment) =>
                assignment.id === assignmentId ? { ...assignment, status } : assignment
              )
            }
          : course
      )
    );
  }

  function deleteAssignment(courseId: string, assignmentId: string) {
    onChange(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              assignments: course.assignments.filter(
                (assignment) => assignment.id !== assignmentId
              )
            }
          : course
      )
    );
  }

  function addExam(courseId: string, exam: ExamForm) {
    onChange(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              exams: [
                ...course.exams,
                {
                  ...exam,
                  title: exam.title.trim(),
                  type: exam.type.trim(),
                  notes: exam.notes.trim(),
                  id: makeId("exam")
                }
              ].sort((a, b) => compareDate(a.date, b.date))
            }
          : course
      )
    );
  }

  function deleteExam(courseId: string, examId: string) {
    onChange(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              exams: course.exams.filter((exam) => exam.id !== examId)
            }
          : course
      )
    );
  }

  return (
    <div className="grid gap-5">
      <SectionHeader
        title="Courses"
        description="과목 정보와 수업별 과제, 시험 일정을 함께 관리합니다."
      />

      <Panel>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-ink">{editingId ? "과목 수정" : "과목 추가"}</h3>
            {editingId ? (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                취소
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="과목명">
              <TextInput
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="예: 미시경제학"
                required
              />
            </Field>
            <Field label="교수명">
              <TextInput
                value={form.professor}
                onChange={(event) => setForm({ ...form, professor: event.target.value })}
                placeholder="예: 박지훈"
              />
            </Field>
            <Field label="강의 시간">
              <TextInput
                value={form.schedule}
                onChange={(event) => setForm({ ...form, schedule: event.target.value })}
                placeholder="예: 월/수 13:30"
              />
            </Field>
            <Field label="강의실">
              <TextInput
                value={form.room}
                onChange={(event) => setForm({ ...form, room: event.target.value })}
                placeholder="예: 사회과학관 301"
              />
            </Field>
            <Field label="자료 링크" className="md:col-span-2">
              <TextInput
                value={form.resourceLink}
                onChange={(event) => setForm({ ...form, resourceLink: event.target.value })}
                placeholder="https://"
                type="url"
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

      <div className="grid gap-4">
        {filteredCourses.length ? (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onAddAssignment={addAssignment}
              onAddExam={addExam}
              onDelete={handleDelete}
              onDeleteAssignment={deleteAssignment}
              onDeleteExam={deleteExam}
              onEdit={handleEdit}
              onUpdateAssignmentStatus={updateAssignmentStatus}
            />
          ))
        ) : (
          <EmptyState>검색 결과에 맞는 과목이 없습니다.</EmptyState>
        )}
      </div>
    </div>
  );
}

type CourseCardProps = {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onAddAssignment: (courseId: string, assignment: AssignmentForm) => void;
  onUpdateAssignmentStatus: (
    courseId: string,
    assignmentId: string,
    status: AssignmentStatus
  ) => void;
  onDeleteAssignment: (courseId: string, assignmentId: string) => void;
  onAddExam: (courseId: string, exam: ExamForm) => void;
  onDeleteExam: (courseId: string, examId: string) => void;
};

function CourseCard({
  course,
  onAddAssignment,
  onAddExam,
  onDelete,
  onDeleteAssignment,
  onDeleteExam,
  onEdit,
  onUpdateAssignmentStatus
}: CourseCardProps) {
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>(createAssignmentForm);
  const [examForm, setExamForm] = useState<ExamForm>(createExamForm);
  const safeResourceLink = getSafeExternalUrl(course.resourceLink);

  function handleAssignmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assignmentForm.title.trim()) {
      return;
    }

    onAddAssignment(course.id, assignmentForm);
    setAssignmentForm(createAssignmentForm());
  }

  function handleExamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!examForm.title.trim()) {
      return;
    }

    onAddExam(course.id, examForm);
    setExamForm(createExamForm());
  }

  return (
    <Panel className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-ink">{course.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {course.professor ? <Badge tone="neutral">{course.professor}</Badge> : null}
            {course.schedule ? <Badge tone="teal">{course.schedule}</Badge> : null}
            {course.room ? <Badge tone="gold">{course.room}</Badge> : null}
          </div>
          {safeResourceLink ? (
            <a
              href={safeResourceLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-600"
            >
              <LinkIcon className="h-4 w-4" />
              자료 링크
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
        <div className="flex gap-2">
          <IconButton label="과목 수정" onClick={() => onEdit(course)}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton label="과목 삭제" variant="danger" onClick={() => onDelete(course.id)}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-ink">과제</h4>
            <Badge tone="teal">{course.assignments.length}</Badge>
          </div>
          <form className="grid gap-3 rounded-lg bg-paper/60 p-3" onSubmit={handleAssignmentSubmit}>
            <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
              <Field label="제목">
                <TextInput
                  value={assignmentForm.title}
                  onChange={(event) =>
                    setAssignmentForm({ ...assignmentForm, title: event.target.value })
                  }
                  placeholder="과제명"
                  required
                />
              </Field>
              <Field label="마감일">
                <TextInput
                  value={assignmentForm.dueDate}
                  onChange={(event) =>
                    setAssignmentForm({ ...assignmentForm, dueDate: event.target.value })
                  }
                  type="date"
                  required
                />
              </Field>
              <Field label="상태">
                <Select
                  value={assignmentForm.status}
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      status: event.target.value as AssignmentStatus
                    })
                  }
                >
                  {assignmentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="self-end">
                <IconButton label="과제 추가" type="submit">
                  <Plus className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
            <Field label="메모">
              <TextInput
                value={assignmentForm.notes}
                onChange={(event) =>
                  setAssignmentForm({ ...assignmentForm, notes: event.target.value })
                }
                placeholder="제출 형식, 참고 사항"
              />
            </Field>
          </form>
          {course.assignments.length ? (
            <div className="grid gap-2">
              {course.assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-lg border border-line p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{assignment.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-600">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(assignment.dueDate)}
                      </p>
                      {assignment.notes ? (
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                          {assignment.notes}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={assignment.status}
                        onChange={(event) =>
                          onUpdateAssignmentStatus(
                            course.id,
                            assignment.id,
                            event.target.value as AssignmentStatus
                          )
                        }
                        className="h-8 w-24"
                        aria-label={`${assignment.title} 상태`}
                      >
                        {assignmentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                      <IconButton
                        label="과제 삭제"
                        variant="danger"
                        onClick={() => onDeleteAssignment(course.id, assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>등록된 과제가 없습니다.</EmptyState>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-ink">시험 일정</h4>
            <Badge tone="coral">{course.exams.length}</Badge>
          </div>
          <form className="grid gap-3 rounded-lg bg-paper/60 p-3" onSubmit={handleExamSubmit}>
            <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
              <Field label="제목">
                <TextInput
                  value={examForm.title}
                  onChange={(event) => setExamForm({ ...examForm, title: event.target.value })}
                  placeholder="중간고사"
                  required
                />
              </Field>
              <Field label="일자">
                <TextInput
                  value={examForm.date}
                  onChange={(event) => setExamForm({ ...examForm, date: event.target.value })}
                  type="date"
                  required
                />
              </Field>
              <Field label="유형">
                <TextInput
                  value={examForm.type}
                  onChange={(event) => setExamForm({ ...examForm, type: event.target.value })}
                  placeholder="필기"
                />
              </Field>
              <div className="self-end">
                <IconButton label="시험 추가" type="submit">
                  <Plus className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
            <Field label="메모">
              <TextInput
                value={examForm.notes}
                onChange={(event) => setExamForm({ ...examForm, notes: event.target.value })}
                placeholder="범위, 준비할 자료"
              />
            </Field>
          </form>
          {course.exams.length ? (
            <div className="grid gap-2">
              {course.exams.map((exam) => (
                <div key={exam.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{exam.title}</p>
                      <p className="mt-1 text-sm text-zinc-600">{formatDate(exam.date)}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {exam.type ? <Badge tone="coral">{exam.type}</Badge> : null}
                        {exam.notes ? <Badge tone="neutral">{exam.notes}</Badge> : null}
                      </div>
                    </div>
                    <IconButton
                      label="시험 삭제"
                      variant="danger"
                      onClick={() => onDeleteExam(course.id, exam.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>등록된 시험 일정이 없습니다.</EmptyState>
          )}
        </div>
      </div>
    </Panel>
  );
}
