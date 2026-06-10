"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSiteAuth, LoginRow } from "../components/site-auth";

const SAVE_DEBOUNCE_MS = 800;

type CourseType = "core" | "prescribed" | "free" | "gened";

interface Course {
  id: number;
  term: string;
  code: string;
  name: string;
  type: CourseType;
}

type SyncState = "idle" | "saving" | "error";

const TYPE_LABELS: Record<CourseType, string> = {
  core: "core",
  prescribed: "prescribed elective",
  free: "free elective",
  gened: "gen ed",
};

const TYPE_COLORS: Record<CourseType, string> = {
  core: "var(--green)",
  prescribed: "var(--accent)",
  free: "var(--soft)",
  gened: "var(--faint)",
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
  { label: "year 1", index: "01", id: "year-1", terms: ["1-2026", "2-2026", "3-2026"] },
  { label: "year 2", index: "02", id: "year-2", terms: ["1-2027", "2-2027", "3-2027"] },
  { label: "year 3", index: "03", id: "year-3", terms: ["1-2028", "2-2028", "3-2028"] },
];

const DEFAULT_COURSES: Course[] = [
  {
    "id": 1,
    "term": "1-2026",
    "code": "MATH1081",
    "name": "Discrete Mathematics",
    "type": "core"
  },
  {
    "id": 2,
    "term": "1-2026",
    "code": "MATH1131",
    "name": "Mathematics 1A",
    "type": "core"
  },
  {
    "id": 3,
    "term": "1-2026",
    "code": "ECON1101",
    "name": "Microeconomics 1",
    "type": "core"
  },
  {
    "id": 4,
    "term": "2-2026",
    "code": "DATA1001",
    "name": "Intro to Data Science",
    "type": "core"
  },
  {
    "id": 5,
    "term": "2-2026",
    "code": "MATH1231",
    "name": "Mathematics 1B",
    "type": "core"
  },
  {
    "id": 6,
    "term": "3-2026",
    "code": "ECON2112",
    "name": "Game Theory",
    "type": "core"
  },
  {
    "id": 7,
    "term": "3-2026",
    "code": "COMP1511",
    "name": "Programming Fundamentals",
    "type": "core"
  },
  {
    "id": 8,
    "term": "1-2027",
    "code": "COMP2521",
    "name": "Data Structures & Algorithms",
    "type": "core"
  },
  {
    "id": 9,
    "term": "1-2027",
    "code": "???",
    "name": "GenEd TBD",
    "type": "gened"
  },
  {
    "id": 10,
    "term": "1-2027",
    "code": "???",
    "name": "Free elective TBD",
    "type": "free"
  },
  {
    "id": 11,
    "term": "2-2027",
    "code": "MATH2501",
    "name": "Linear Algebra",
    "type": "core"
  },
  {
    "id": 12,
    "term": "2-2027",
    "code": "COMP2041",
    "name": "Software Construction",
    "type": "core"
  },
  {
    "id": 13,
    "term": "2-2027",
    "code": "MATH2801",
    "name": "Theory of Statistics",
    "type": "core"
  },
  {
    "id": 14,
    "term": "3-2027",
    "code": "COMP3121",
    "name": "Algorithm Design & Analysis",
    "type": "core"
  },
  {
    "id": 15,
    "term": "3-2027",
    "code": "???",
    "name": "Free elective TBD",
    "type": "free"
  },
  {
    "id": 16,
    "term": "3-2027",
    "code": "???",
    "name": "Prescribed Elective TBD",
    "type": "prescribed"
  },
  {
    "id": 17,
    "term": "1-2028",
    "code": "COMP3311",
    "name": "Database Systems",
    "type": "core"
  },
  {
    "id": 18,
    "term": "1-2028",
    "code": "COMP9417",
    "name": "Machine Learning",
    "type": "core"
  },
  {
    "id": 19,
    "term": "1-2028",
    "code": "???",
    "name": "Prescribed Elective TBD",
    "type": "prescribed"
  },
  {
    "id": 20,
    "term": "2-2028",
    "code": "COMP9418",
    "name": "Advanced Machine Learning",
    "type": "prescribed"
  },
  {
    "id": 21,
    "term": "2-2028",
    "code": "COMP9313",
    "name": "Big Data Management",
    "type": "core"
  },
  {
    "id": 22,
    "term": "2-2028",
    "code": "???",
    "name": "GenEd TBD",
    "type": "gened"
  },
  {
    "id": 23,
    "term": "3-2028",
    "code": "DATA3001",
    "name": "Data Science in Practice",
    "type": "core"
  },
  {
    "id": 24,
    "term": "3-2028",
    "code": "ECON3203",
    "name": "Econometric Theory & ML",
    "type": "core"
  }
];

const inputStyle = {
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  fontFamily: "inherit",
} as const;

export function ProgramPlanner() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [mounted, setMounted] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const { password, ready: authReady, login, logout, dropSession } = useSiteAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [dragOverTerm, setDragOverTerm] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mode: "edit" | "add"; id?: number; term?: string } | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<CourseType>("core");
  const dragIdRef = useRef<number | null>(null);
  const nextIdRef = useRef(25);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordRef = useRef<string | null>(null);
  passwordRef.current = password;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let loaded: Course[] = DEFAULT_COURSES;
      try {
        const res = await fetch("/api/plan", { cache: "no-store" });
        const json = await res.json();
        if (Array.isArray(json.courses)) loaded = json.courses;
      } catch {}
      if (cancelled) return;
      setCourses(loaded);
      nextIdRef.current = Math.max(...loaded.map((c) => c.id), 0) + 1;
      setMounted(true);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushToServer = useCallback((next: Course[]) => {
    const pw = passwordRef.current;
    if (!pw) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSyncState("saving");
    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/plan", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "x-site-password": pw,
          },
          body: JSON.stringify(next),
        });
        if (res.status === 401) {
          // password rotated out from under us — drop the session
          dropSession();
          setSyncState("idle");
          return;
        }
        setSyncState(res.ok ? "idle" : "error");
      } catch {
        setSyncState("error");
      }
    }, SAVE_DEBOUNCE_MS);
  }, [dropSession]);

  const updateCourses = useCallback(
    (next: Course[]) => {
      setCourses(next);
      pushToServer(next);
    },
    [pushToServer]
  );

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

  if (!mounted) {
    return (
      <p className="text-[12px] lowercase" style={{ color: "var(--faint)" }}>
        loading plan…
      </p>
    );
  }

  return (
    <>
      {/* counters + io */}
      <div className="flex items-baseline gap-x-5 gap-y-1 flex-wrap text-[12px]" style={{ color: "var(--soft)" }}>
        <Counter label="/144 uoc" value={totalUoc} ok={totalUoc >= 144} />
        <Counter label="/18 prescribed" value={countByType("prescribed")} />
        <Counter label="/12 free" value={countByType("free")} />
        <Counter label="/12 gen ed" value={countByType("gened")} />
        <span className="ml-auto flex gap-3">
          <button onClick={exportPlan} className="tui-btn text-[12px]">
            [export]
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="tui-btn text-[12px]">
            [import]
          </button>
          {password ? (
            <button onClick={logout} className="tui-btn text-[12px]">
              [logout]
            </button>
          ) : (
            <button
              onClick={() => setLoginOpen((v) => !v)}
              className="tui-btn text-[12px]"
              style={{ color: "var(--green)" }}
            >
              [login]
            </button>
          )}
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importPlan} />
        </span>
      </div>

      {/* login prompt */}
      {loginOpen && !password && (
        <LoginRow login={login} onClose={() => setLoginOpen(false)} />
      )}

      {/* legend */}
      <div className="mt-3 flex items-baseline gap-4 flex-wrap text-[11px] lowercase" style={{ color: "var(--soft)" }}>
        {(Object.entries(TYPE_LABELS) as [CourseType, string][]).map(([type, label]) => (
          <span key={type} className="flex items-baseline gap-1.5">
            <span style={{ color: TYPE_COLORS[type] }}>■</span>
            {label}
          </span>
        ))}
        <span className="ml-auto hidden sm:inline" style={{ color: "var(--faint)" }}>
          drag courses between terms
        </span>
      </div>

      {/* grid */}
      {YEARS.map((year) => (
        <div key={year.id} id={year.id} className="mt-12">
          <h3 className="text-[13px] lowercase tracking-[0.15em]" style={{ color: "var(--ink)" }}>
            <span style={{ color: "var(--faint)" }}>{year.index}</span> {year.label}
          </h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {year.terms.map((termKey) => {
              const termCourses = courses.filter((c) => c.term === termKey);
              const termLabel = TERMS.find((t) => t.key === termKey)!.label;
              const isOver = dragOverTerm === termKey;
              return (
                <div
                  key={termKey}
                  className="p-3 min-h-[120px]"
                  style={{
                    border: `1px solid ${isOver ? "var(--accent)" : "var(--line)"}`,
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverTerm(termKey); }}
                  onDragLeave={() => setDragOverTerm(null)}
                  onDrop={(e) => { e.preventDefault(); onDrop(termKey); }}
                >
                  <div className="flex justify-between text-[11px] lowercase mb-2" style={{ color: "var(--soft)" }}>
                    <span>{termLabel}</span>
                    <span style={{ color: "var(--faint)" }}>{termCourses.length * 6} uoc</span>
                  </div>
                  {termCourses.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => onDragStart(c.id)}
                      className="mb-2 cursor-grab active:cursor-grabbing select-none group flex items-baseline gap-2"
                    >
                      <span className="text-[10px]" style={{ color: TYPE_COLORS[c.type] }}>
                        ■
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[12px]" style={{ color: "var(--ink)" }}>
                            {c.code}
                          </span>
                          <button
                            onClick={() => openEdit(c.id)}
                            className="tui-btn text-[11px] opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            [e]
                          </button>
                        </div>
                        <div className="text-[11px] leading-[1.6]" style={{ color: "var(--soft)" }}>
                          {c.name}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openAdd(termKey)}
                    className="tui-btn block text-left text-[11px] mt-1"
                    style={{ color: "var(--faint)" }}
                  >
                    + add course
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p
        className="text-[11px] text-center mt-8 lowercase"
        style={{ color: syncState === "error" ? "var(--accent)" : "var(--faint)" }}
        aria-live="polite"
      >
        {!authReady
          ? "loading…"
          : syncState === "saving"
            ? "saving…"
            : syncState === "error"
              ? "save failed — retrying on next change"
              : password
                ? "synced"
                : "edits stay local until you log in"}
      </p>

      {/* modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--ink) 30%, transparent)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div
            className="p-5 w-[340px] max-w-[90vw]"
            style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
          >
            <h3 className="text-[13px] lowercase tracking-[0.15em] mb-4" style={{ color: "var(--ink)" }}>
              {modal.mode === "edit"
                ? "edit course"
                : `add course — ${TERMS.find((t) => t.key === modal.term)?.label.toLowerCase()}`}
            </h3>
            <div className="mb-3">
              <label className="block text-[11px] lowercase mb-1" style={{ color: "var(--soft)" }}>
                course code
              </label>
              <input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. COMP9444"
                className="w-full px-2.5 py-1.5 text-[13px] outline-none"
                style={inputStyle}
              />
            </div>
            <div className="mb-3">
              <label className="block text-[11px] lowercase mb-1" style={{ color: "var(--soft)" }}>
                course name
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Neural Networks"
                className="w-full px-2.5 py-1.5 text-[13px] outline-none"
                style={inputStyle}
              />
            </div>
            <div className="mb-3">
              <label className="block text-[11px] lowercase mb-1" style={{ color: "var(--soft)" }}>
                type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as CourseType)}
                className="w-full px-2.5 py-1.5 text-[13px] outline-none"
                style={inputStyle}
              >
                <option value="core">core</option>
                <option value="prescribed">prescribed elective</option>
                <option value="free">free elective</option>
                <option value="gened">gen ed</option>
              </select>
            </div>
            <div className="flex justify-between gap-3 mt-5 text-[12px]">
              {modal.mode === "edit" ? (
                <button onClick={deleteFromModal} className="tui-btn" style={{ color: "var(--accent)" }}>
                  [remove]
                </button>
              ) : (
                <span />
              )}
              <span className="flex gap-3">
                <button onClick={() => setModal(null)} className="tui-btn">
                  [cancel]
                </button>
                <button onClick={saveModal} className="tui-btn" style={{ color: "var(--green)" }}>
                  [save]
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Counter({ label, value, ok }: { label: string; value: number; ok?: boolean }) {
  return (
    <span>
      <span
        style={{
          color: ok === true ? "var(--green)" : ok === false ? "var(--accent)" : "var(--ink)",
        }}
      >
        {value}
      </span>
      <span style={{ color: "var(--faint)" }}>{label}</span>
    </span>
  );
}
