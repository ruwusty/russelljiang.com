"use client";

import { useState } from "react";
import { useSiteAuth, LoginRow } from "../../components/site-auth";
import Content from "./content.mdx";

// shown to anyone not logged in — looks unpublished, offers a way in.
function Gate() {
  const { login } = useSiteAuth();
  const [showLogin, setShowLogin] = useState(false);
  return (
    <div>
      <h1 className="display text-[24px] leading-[1.5]" style={{ color: "var(--ink)" }}>
        the tutor that refuses to answer
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        ❯ cat ./this-essay
      </p>

      <div className="hrule my-8" />

      <p className="text-[13px] leading-[1.9] lowercase" style={{ color: "var(--soft)" }}>
        permission denied. this one&apos;s still a draft.
      </p>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        if you&apos;re russell,{" "}
        <button
          onClick={() => setShowLogin((v) => !v)}
          className="tui-btn text-[12px]"
          style={{ color: "var(--green)" }}
        >
          [login]
        </button>{" "}
        to read it.
      </p>
      {showLogin && <LoginRow login={login} onClose={() => setShowLogin(false)} />}
    </div>
  );
}

export function TutorDraft() {
  const { password, ready } = useSiteAuth();

  // first paint (and ssr) renders the gate, never the essay
  if (!ready) {
    return (
      <p className="text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        …
      </p>
    );
  }
  if (!password) return <Gate />;

  return (
    <>
      <div
        className="mb-8 px-3 py-2 text-[11px] lowercase"
        style={{ border: "1px solid var(--line)", color: "var(--soft)" }}
      >
        <span style={{ color: "var(--accent)" }}>draft</span> — unpublished. only you can see this
        while logged in.
      </div>

      <h1 className="display text-[24px] leading-[1.5]" style={{ color: "var(--ink)" }}>
        the tutor that refuses to answer
      </h1>
      <p className="mt-2 text-[12px] lowercase italic" style={{ color: "var(--soft)" }}>
        on ai tutors, the outsourcing trap, and a system that makes me do the work
      </p>
      <p className="mt-1 text-[11px] lowercase" style={{ color: "var(--soft)" }}>
        2026-08-24 · russell jiang
      </p>

      <div className="hrule my-8" />

      <article className="essay">
        <Content />
      </article>

      <p
        className="mt-14 pt-4 text-[11px] lowercase italic leading-[1.7]"
        style={{ borderTop: "1px solid var(--line)", color: "var(--soft)" }}
      >
        a dialogue distillate: my thoughts, drafted with claude.
      </p>
    </>
  );
}
