"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "unsw_planner_v2";

type CourseType = "core" | "prescribed" | "free" | "gened";

interface Course {
  id: number;
  term: string;
  code: string;
  name: string;
  type: CourseType;
}

const TYPE_LABELS: Record<CourseType, string> = {
  core: "core",
  prescribed: "prescribed elective",
  free: "free elective",
  gened: "gen ed",
};

const TYPE_COLORS: Record<CourseType, { bg: string; text: string; dot: string }> = {
  core: { bg: "var(--plan-core-bg)", text: "var(--plan-core-text)", dot: "var(--plan-core-dot)" },
  prescribed: { bg: "var(--plan-prescribed-bg)", text: "var(--plan-prescribed-text)", dot: "var(--plan-prescribed-dot)" },
  free: { bg: "var(--plan-free-bg)", text: "var(--plan-free-text)", dot: "var(--plan-free-dot)" },
  gened: { bg: "var(--plan-gened-bg)", text: "var(--plan-gened-text)", dot: "var(--plan-gened-dot)" },
};

const TERMS = [
  { key: "1-2026", label: "T1 2026" },
  { key: "2-2026", label: "T2 2026" },
  { key: "3-2026", label: "T3 2026" },
  { key: "1-2027", label: "T1 2027" },
  { key: "2-2027", label: "T2 2027" },
  { key: "3-2027", label: "T3 2027" },
  { key: "1-2028", label: "T1 2028" },
  { key: "2-2028", label: "T2 2028" },
  { key: "3-2028", label: "T3 2028" },
];

const YEARS = [
  { label: "Year 1", id: "year-1", terms: ["1-2026", "2-2026", "3-2026"] },
  { label: "Year 2", id: "year-2", terms: ["1-2027", "2-2027", "3-2027"] },
  { label: "Year 3", id: "year-3", terms: ["1-2028", "2-2028", "3-2028"] },
];

const DEFAULT_COURSES: Course[] = [
  { id: 1, term: "1-2026", code: "MATH1081", name: "Discrete Mathematics", type: "core" },
  { id: 2, term: "1-2026", code: "MATH1131", name: "Mathematics 1A", type: "core" },
  { id: 3, term: "1-2026", code: "ECON1101", name: "Microeconomics 1", type: "core" },
  { id: 4, term: "2-2026", code: "DATA1001", name: "Intro to Data Science", type: "core" },
  { id: 5, term: "2-2026", code: "MATH1231", name: "Mathematics 1B", type: "core" },
  { id: 6, term: "3-2026", code: "ECON2112", name: "Game Theory", type: "core" },
  { id: 7, term: "3-2026", code: "COMP1511", name: "Programming Fundamentals", type: "core" },
  { id: 8, term: "1-2027", code: "COMP2521", name: "Data Structures & Algorithms", type: "core" },
  { id: 9, term: "1-2027", code: "GENE1500", name: "Creative Entrepreneurship", type: "gened" },
  { id: 10, term: "1-2027", code: "???", name: "Free elective TBD", type: "free" },
  { id: 11, term: "2-2027", code: "MATH2501", name: "Linear Algebra", type: "core" },
  { id: 12, term: "2-2027", code: "COMP2041", name: "Software Construction", type: "core" },
  { id: 13, term: "2-2027", code: "MATH2801", name: "Theory of Statistics", type: "core" },
  { id: 14, term: "3-2027", code: "COMP3121", name: "Algorithm Design & Analysis", type: "core" },
  { id: 15, term: "3-2027", code: "???", name: "Free elective TBD", type: "free" },
  { id: 16, term: "3-2027", code: "ECON2206", name: "Introductory Econometrics", type: "prescribed" },
  { id: 17, term: "1-2028", code: "COMP3311", name: "Database Systems", type: "core" },
  { id: 18, term: "1-2028", code: "COMP9417", name: "Machine Learning", type: "core" },
  { id: 19, term: "1-2028", code: "MARK3054", name: "Marketing Analytics", type: "prescribed" },
  { id: 20, term: "2-2028", code: "COMP9418", name: "Advanced Machine Learning", type: "prescribed" },
  { id: 21, term: "2-2028", code: "COMP9313", name: "Big Data Management", type: "core" },
  { id: 22, term: "2-2028", code: "GENL2033", name: "Big Tech, AI and the Law", type: "gened" },
  { id: 23, term: "3-2028", code: "DATA3001", name: "Data Science in Practice", type: "core" },
  { id: 24, term: "3-2028", code: "ECON3203", name: "Econometric Theory & ML", type: "core" },
];

function loadCourses(): Course[] {
  if (typeof window === "undefined") return DEFAULT_COURSES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_COURSES;
}

function saveCourses(courses: Course[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

export function ProgramPlanner() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dragOverTerm, setDragOverTerm] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mode: "edit" | "add"; id?: number; term?: string } | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<CourseType>("core");
  const dragIdRef = useRef<number | null>(null);
  const nextIdRef = useRef(25);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadCourses();
    setCourses(loaded);
    nextIdRef.current = Math.max(...loaded.map((c) => c.id), 0) + 1;
    setMounted(true);
  }, []);

  const updateCourses = useCallback((next: Course[]) => {
    setCourses(next);
    saveCourses(next);
  }, []);

  const countByType = (type: CourseType) => courses.filter((c) => c.type === type).length * 6;
  const totalUoc = courses.length * 6;

  const openEdit = (id: number) => {
    const c = courses.find((x) => x.id === id);
    if (!c) return;
    setFormCode(c.code === "???" ? "" : c.code);
    setFormName(c.name);
    setFormType(c.type);
    setModal({ mode: "edit", id });
  };

  const openAdd = (term: string) => {
    setFormCode("");
    setFormName("");
    setFormType("core");
    setModal({ mode: "add", term });
  };

  const saveModal = () => {
    if (!modal) return;
    const code = formCode.trim() || "???";
    const name = formName.trim() || "Unnamed";
    if (modal.mode === "edit" && modal.id !== undefined) {
      updateCourses(courses.map((c) => (c.id === modal.id ? { ...c, code, name, type: formType } : c)));
    } else if (modal.mode === "add" && modal.term) {
      const id = nextIdRef.current++;
      updateCourses([...courses, { id, term: modal.term, code, name, type: formType }]);
    }
    setModal(null);
  };

  const deleteFromModal = () => {
    if (modal?.mode === "edit" && modal.id !== undefined) {
      updateCourses(courses.filter((c) => c.id !== modal.id));
    }
    setModal(null);
  };

  const exportPlan = () => {
    const blob = new Blob([JSON.stringify(courses, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "unsw_plan.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importPlan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          nextIdRef.current = Math.max(...data.map((c: Course) => c.id), 0) + 1;
          updateCourses(data);
        }
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const onDragStart = (id: number) => {
    dragIdRef.current = id;
  };

  const onDrop = (term: string) => {
    const id = dragIdRef.current;
    if (id === null) return;
    updateCourses(courses.map((c) => (c.id === id ? { ...c, term } : c)));
    dragIdRef.current = null;
    setDragOverTerm(null);
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        :root {
          --plan-core-bg: #e8f0fb; --plan-core-text: #1a4a8a; --plan-core-dot: #3a72d0;
          --plan-prescribed-bg: #e6f7ed; --plan-prescribed-text: #1a6b3a; --plan-prescribed-dot: #2ea855;
          --plan-free-bg: #f0e8f8; --plan-free-text: #5a2a8a; --plan-free-dot: #8844cc;
          --plan-gened-bg: #fef3e2; --plan-gened-text: #7a4010; --plan-gened-dot: #d4720a;
        }
        .dark {
          --plan-core-bg: #1a2a4a; --plan-core-text: #90b8f0; --plan-core-dot: #5090e0;
          --plan-prescribed-bg: #1a3a2a; --plan-prescribed-text: #80d0a0; --plan-prescribed-dot: #40b870;
          --plan-free-bg: #2a1a4a; --plan-free-text: #c090f0; --plan-free-dot: #a060e0;
          --plan-gened-bg: #3a2a10; --plan-gened-text: #f0c080; --plan-gened-dot: #e09030;
        }
      `}</style>

      {/* Counters + IO */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <Counter label="/ 144 UOC" value={totalUoc} ok={totalUoc >= 144} />
        <Counter label="/ 18 prescribed" value={countByType("prescribed")} />
        <Counter label="/ 12 free" value={countByType("free")} />
        <Counter label="/ 12 gen ed" value={countByType("gened")} />
        <div className="ml-auto flex gap-2">
          <button onClick={exportPlan} className="plan-io-btn">export</button>
          <button onClick={() => fileInputRef.current?.click()} className="plan-io-btn">import</button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importPlan} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap mb-6 text-[11px]" style={{ color: "var(--muted)" }}>
        {(Object.entries(TYPE_LABELS) as [CourseType, string][]).map(([type, label]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[type].dot }} />
            {label}
          </span>
        ))}
        <span className="ml-auto hidden sm:inline" style={{ color: "var(--muted)" }}>
          drag courses between terms
        </span>
      </div>

      {/* Grid */}
      {YEARS.map((year) => (
        <div key={year.id} id={year.id} className="mb-8">
          <h3
            className="text-[11px] font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--muted)", fontFamily: mono }}
          >
            {year.label}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {year.terms.map((termKey) => {
              const termCourses = courses.filter((c) => c.term === termKey);
              const termLabel = TERMS.find((t) => t.key === termKey)!.label;
              const isOver = dragOverTerm === termKey;
              return (
                <div
                  key={termKey}
                  className="rounded-xl p-3 min-h-[120px] transition-colors"
                  style={{
                    background: isOver ? "var(--plan-core-bg)" : "var(--bg)",
                    border: `1px solid ${isOver ? "var(--plan-core-dot)" : "var(--border)"}`,
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverTerm(termKey); }}
                  onDragLeave={() => setDragOverTerm(null)}
                  onDrop={(e) => { e.preventDefault(); onDrop(termKey); }}
                >
                  <div className="flex justify-between text-[11px] mb-2.5" style={{ color: "var(--muted)", fontFamily: mono }}>
                    <span>{termLabel}</span>
                    <span className="font-medium">{termCourses.length * 6} UOC</span>
                  </div>
                  {termCourses.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => onDragStart(c.id)}
                      className="rounded-lg p-2 mb-1.5 cursor-grab active:cursor-grabbing select-none group"
                      style={{ background: TYPE_COLORS[c.type].bg }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold" style={{ color: TYPE_COLORS[c.type].text }}>
                          {c.code}
                        </span>
                        <button
                          onClick={() => openEdit(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-[11px] transition-opacity"
                          style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}
                        >
                          ✎
                        </button>
                      </div>
                      <div className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--muted)" }}>
                        {c.name}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: TYPE_COLORS[c.type].dot }}>
                        {TYPE_LABELS[c.type]}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openAdd(termKey)}
                    className="w-full text-left px-2 py-1 rounded-md text-[11px] mt-1 transition-colors"
                    style={{
                      border: "1px dashed var(--border)",
                      color: "var(--muted)",
                      background: "none",
                    }}
                  >
                    + add course
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-[11px] text-center mt-4" style={{ color: "var(--muted)" }}>
        changes are saved automatically in your browser
      </p>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div
            className="rounded-xl p-5 w-[340px] max-w-[90vw]"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
              {modal.mode === "edit"
                ? "Edit course"
                : `Add course to ${TERMS.find((t) => t.key === modal.term)?.label}`}
            </h3>
            <div className="mb-3">
              <label className="block text-[11px] mb-1" style={{ color: "var(--muted)" }}>Course code</label>
              <input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. COMP9444"
                className="w-full px-2.5 py-1.5 text-sm rounded-lg outline-none"
                style={{ background: "color-mix(in srgb, var(--border) 30%, var(--bg))", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-[11px] mb-1" style={{ color: "var(--muted)" }}>Course name</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Neural Networks"
                className="w-full px-2.5 py-1.5 text-sm rounded-lg outline-none"
                style={{ background: "color-mix(in srgb, var(--border) 30%, var(--bg))", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-[11px] mb-1" style={{ color: "var(--muted)" }}>Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as CourseType)}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg outline-none"
                style={{ background: "color-mix(in srgb, var(--border) 30%, var(--bg))", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                <option value="core">Core</option>
                <option value="prescribed">Prescribed elective</option>
                <option value="free">Free elective</option>
                <option value="gened">Gen ed</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              {modal.mode === "edit" && (
                <button
                  onClick={deleteFromModal}
                  className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{ border: "1px solid #c0392b", color: "#c0392b", background: "none" }}
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ border: "1px solid var(--border)", color: "var(--text)", background: "none" }}
              >
                Cancel
              </button>
              <button
                onClick={saveModal}
                className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ background: "var(--text)", color: "var(--bg)", border: "1px solid var(--text)" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .plan-io-btn {
          padding: 4px 10px;
          font-size: 12px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: none;
          color: var(--muted);
          cursor: pointer;
          transition: background 0.1s, color 0.1s;
          font-family: ${mono};
        }
        .plan-io-btn:hover {
          background: color-mix(in srgb, var(--border) 30%, var(--bg));
          color: var(--text);
        }
      `}</style>
    </>
  );
}

function Counter({ label, value, ok }: { label: string; value: number; ok?: boolean }) {
  return (
    <div
      className="rounded-lg px-3 py-1.5 text-xs"
      style={{ background: "color-mix(in srgb, var(--border) 30%, var(--bg))" }}
    >
      <strong className="text-base font-semibold block" style={{ color: ok === true ? "#2ea855" : ok === false ? "#d4720a" : "var(--text)" }}>
        {value}
      </strong>
      <span style={{ color: "var(--muted)" }}>{label}</span>
    </div>
  );
}
