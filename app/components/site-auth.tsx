"use client";

import { useCallback, useEffect, useState } from "react";

const SESSION_KEY = "site_pw";

const inputStyle = {
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  fontFamily: "inherit",
} as const;

export interface SiteAuth {
  password: string | null;
  ready: boolean;
  login: (attempt: string) => Promise<string | null>;
  logout: () => void;
  dropSession: () => void;
}

export function useSiteAuth(): SiteAuth {
  const [password, setPassword] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPassword(sessionStorage.getItem(SESSION_KEY));
    setReady(true);
  }, []);

  const login = useCallback(async (attempt: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: attempt }),
      });
      if (!res.ok) {
        return res.status === 401 ? "wrong password" : "login unavailable";
      }
      sessionStorage.setItem(SESSION_KEY, attempt);
      setPassword(attempt);
      return null;
    } catch {
      return "login unavailable";
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setPassword(null);
  }, []);

  return { password, ready, login, logout, dropSession: logout };
}

interface LoginRowProps {
  login: SiteAuth["login"];
  onClose: () => void;
}

export function LoginRow({ login, onClose }: LoginRowProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!value) return;
    setError(null);
    const err = await login(value);
    if (err) {
      setError(err);
    } else {
      onClose();
    }
  };

  return (
    <div className="mt-3 flex items-baseline gap-2 text-[12px]" style={{ color: "var(--soft)" }}>
      <span style={{ color: "var(--green)" }}>❯</span>
      <span className="shrink-0">password:</span>
      <input
        type="password"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") onClose();
        }}
        className="px-2 py-0.5 text-[12px] outline-none w-[160px]"
        style={inputStyle}
        aria-label="site password"
      />
      <button onClick={submit} className="tui-btn text-[12px]">
        [enter]
      </button>
      {error && <span style={{ color: "var(--accent)" }}>{error}</span>}
    </div>
  );
}
