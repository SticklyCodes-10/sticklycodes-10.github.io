import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { loadGithub, peekCache } from "../lib/github";
import type { GhData } from "../lib/types";

interface GhState {
  status: "loading" | "ready";
  data: GhData | null;
  refreshing: boolean;
  reload: () => void;
}

const Ctx = createContext<GhState | null>(null);

export function GithubProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GhData | null>(() => peekCache());
  const [refreshing, setRefreshing] = useState(false);
  const started = useRef(false);

  const run = useCallback((force: boolean) => {
    setRefreshing(true);
    loadGithub(force)
      .then(setData)
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!data) run(false);
  }, [data, run]);

  const value: GhState = { status: data ? "ready" : "loading", data, refreshing, reload: () => run(true) };
  return createElement(Ctx.Provider, { value }, children);
}

export function useGithub() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGithub must be used inside GithubProvider");
  return v;
}
