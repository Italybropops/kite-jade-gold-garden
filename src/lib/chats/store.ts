import { create } from "zustand";
import { persist } from "zustand/middleware";
import { analyzeChats, applyInferredCategories } from "./analyze";
import { DEMO_CHATS } from "./demo";
import { newId } from "./parse";
import { bucketFor } from "./triage";
import type { AiAnalysis, Analysis, Category, Chat, CleanupTab, TriageBucket } from "./types";

export type AppView = "library" | "insights" | "cleanup" | "import";

interface ChatState {
  chats: Chat[];
  usingDemo: boolean;
  selectedId: string | null;
  view: AppView;
  query: string;
  categoryFilter: Category | "All";
  flagFilter: "all" | "duplicates" | "clutter" | "pinned" | "archived";
  cleanupTab: CleanupTab;
  analysis: Analysis | null;
  aiAnalysis: AiAnalysis | null;
  grokChecks: Record<string, boolean>;
  triage: Record<string, TriageBucket>;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setView: (view: AppView) => void;
  setQuery: (query: string) => void;
  setCategoryFilter: (c: Category | "All") => void;
  setFlagFilter: (f: ChatState["flagFilter"]) => void;
  setCleanupTab: (tab: CleanupTab) => void;
  select: (id: string | null) => void;
  refreshAnalysis: () => void;
  importChats: (incoming: Chat[], mode: "append" | "replace") => void;
  loadDemo: () => void;
  clearLibrary: () => void;
  removeChats: (ids: string[]) => void;
  restoreChat: (id: string) => void;
  mergeChats: (ids: string[], title?: string) => void;
  recategorize: (id: string, category: Category) => void;
  togglePin: (id: string) => void;
  pinWorkingSet: () => void;
  setArchived: (ids: string[], archived: boolean) => void;
  applyRenames: (ids?: string[]) => void;
  setAiAnalysis: (ai: AiAnalysis | null) => void;
  applyAiSummaries: () => void;
  patchSummary: (id: string, summary: string) => void;
  toggleGrokCheck: (key: string) => void;
  setTriage: (id: string, bucket: TriageBucket) => void;
  applyTriagePlan: () => void;
}

function normalize(chat: Chat): Chat {
  return {
    ...chat,
    archived: Boolean(chat.archived),
    pinned: Boolean(chat.pinned),
    status: chat.status ?? "active",
    summary: chat.summary || "",
  };
}

function withAnalysis(chats: Chat[]): Pick<ChatState, "chats" | "analysis"> {
  const next = applyInferredCategories(chats.map(normalize));
  return { chats: next, analysis: analyzeChats(next) };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: DEMO_CHATS,
      usingDemo: true,
      selectedId: DEMO_CHATS[0]?.id ?? null,
      view: "insights",
      query: "",
      categoryFilter: "All",
      flagFilter: "all",
      cleanupTab: "delete",
      analysis: analyzeChats(DEMO_CHATS),
      aiAnalysis: null,
      grokChecks: {},
      triage: {},
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setView: (view) => set({ view }),
      setQuery: (query) => set({ query }),
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
      setFlagFilter: (flagFilter) => set({ flagFilter }),
      setCleanupTab: (cleanupTab) => set({ cleanupTab }),
      select: (selectedId) => set({ selectedId }),
      refreshAnalysis: () => set(withAnalysis(get().chats)),
      importChats: (incoming, mode) => {
        if (!incoming.length) return;
        const categorized = applyInferredCategories(incoming.map(normalize));
        const existing = get().usingDemo ? [] : get().chats;
        const next = mode === "replace" ? categorized : [...categorized, ...existing];
        set({
          ...withAnalysis(next),
          usingDemo: false,
          selectedId: categorized[0]?.id ?? null,
          view: "insights",
          aiAnalysis: null,
          triage: mode === "replace" ? {} : get().triage,
        });
      },
      loadDemo: () =>
        set({
          ...withAnalysis(DEMO_CHATS),
          usingDemo: true,
          selectedId: DEMO_CHATS[0]?.id ?? null,
          view: "insights",
          aiAnalysis: null,
          grokChecks: {},
          triage: {},
        }),
      clearLibrary: () =>
        set({
          chats: [],
          analysis: analyzeChats([]),
          usingDemo: false,
          selectedId: null,
          aiAnalysis: null,
          grokChecks: {},
          triage: {},
        }),
      removeChats: (ids) => {
        const setIds = new Set(ids);
        const chats = get().chats.map((c) => (setIds.has(c.id) ? { ...c, status: "removed" as const } : c));
        const selectedId = setIds.has(get().selectedId ?? "")
          ? (chats.find((c) => c.status === "active")?.id ?? null)
          : get().selectedId;
        const triage = { ...get().triage };
        for (const id of ids) delete triage[id];
        set({ ...withAnalysis(chats), selectedId, triage });
      },
      restoreChat: (id) => {
        const chats = get().chats.map((c) =>
          c.id === id && c.status === "removed" ? { ...c, status: "active" as const } : c,
        );
        set(withAnalysis(chats));
      },
      mergeChats: (ids, title) => {
        const setIds = new Set(ids);
        const sources = get()
          .chats.filter((c) => setIds.has(c.id) && c.status === "active")
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        if (sources.length < 2) return;
        const messages = sources.flatMap((c) => c.messages);
        const merged: Chat = {
          id: newId("c"),
          title: title?.trim() || `Merged · ${sources[0].title}`,
          createdAt: sources[0].createdAt,
          updatedAt: new Date().toISOString(),
          messages,
          source: "merged",
          status: "active",
          category: sources[0].category,
          pinned: sources.some((c) => c.pinned),
          archived: false,
          summary: sources
            .map((c) => c.summary)
            .join(" · ")
            .slice(0, 220),
          mergedFrom: sources.map((c) => c.id),
        };
        const chats = [merged, ...get().chats.map((c) => (setIds.has(c.id) ? { ...c, status: "merged" as const } : c))];
        const triage = { ...get().triage };
        for (const id of ids) delete triage[id];
        set({ ...withAnalysis(chats), selectedId: merged.id, view: "library", triage });
      },
      recategorize: (id, category) => {
        const chats = get().chats.map((c) => (c.id === id ? { ...c, category } : c));
        set(withAnalysis(chats));
      },
      togglePin: (id) => {
        const chats = get().chats.map((c) =>
          c.id === id ? { ...c, pinned: !c.pinned, archived: c.pinned ? c.archived : false } : c,
        );
        set(withAnalysis(chats));
      },
      pinWorkingSet: () => {
        const ids = new Set(get().analysis?.workingSetIds ?? []);
        if (!ids.size) return;
        const chats = get().chats.map((c) => (ids.has(c.id) ? { ...c, pinned: true, archived: false } : c));
        set(withAnalysis(chats));
      },
      setArchived: (ids, archived) => {
        const setIds = new Set(ids);
        const chats = get().chats.map((c) =>
          setIds.has(c.id) ? { ...c, archived, pinned: archived ? false : c.pinned } : c,
        );
        set(withAnalysis(chats));
      },
      applyRenames: (ids) => {
        const suggestions = get().analysis?.renameSuggestions ?? [];
        const want = ids ? new Set(ids) : new Set(suggestions.map((s) => s.chatId));
        const map = new Map(
          suggestions.filter((s) => want.has(s.chatId)).map((s) => [s.chatId, s.suggested] as const),
        );
        if (!map.size) return;
        const chats = get().chats.map((c) => (map.has(c.id) ? { ...c, title: map.get(c.id)! } : c));
        set(withAnalysis(chats));
      },
      setAiAnalysis: (aiAnalysis) => set({ aiAnalysis }),
      applyAiSummaries: () => {
        const ai = get().aiAnalysis;
        if (!ai) return;
        const sum = new Map(ai.summaries.map((s) => [s.chatId, s.summary]));
        const cat = new Map(ai.recategorizations.map((s) => [s.chatId, s.category]));
        const chats = get().chats.map((c) => ({
          ...c,
          summary: sum.get(c.id) ?? c.summary,
          category: cat.get(c.id) ?? c.category,
        }));
        set(withAnalysis(chats));
      },
      patchSummary: (id, summary) => {
        const chats = get().chats.map((c) => (c.id === id ? { ...c, summary } : c));
        set(withAnalysis(chats));
      },
      toggleGrokCheck: (key) => set({ grokChecks: { ...get().grokChecks, [key]: !get().grokChecks[key] } }),
      setTriage: (id, bucket) => set({ triage: { ...get().triage, [id]: bucket } }),
      applyTriagePlan: () => {
        const { chats, analysis, triage } = get();
        const next = chats.map((c) => {
          if (c.status !== "active") return c;
          const bucket = bucketFor(c, analysis, triage);
          if (bucket === "drop") return { ...c, status: "removed" as const };
          if (bucket === "keep") return { ...c, pinned: true, archived: false };
          return { ...c, archived: true, pinned: false };
        });
        const selectedId =
          next.find((c) => c.id === get().selectedId && c.status === "active")?.id ??
          next.find((c) => c.status === "active")?.id ??
          null;
        set({ ...withAnalysis(next), triage: {}, selectedId });
      },
    }),
    {
      name: "sift-library-v1",
      partialize: (s) => ({
        chats: s.chats,
        usingDemo: s.usingDemo,
        grokChecks: s.grokChecks,
        aiAnalysis: s.aiAnalysis,
        selectedId: s.selectedId,
        triage: s.triage,
      }),
      skipHydration: true,
    },
  ),
);

export function activeChats(chats: Chat[]): Chat[] {
  return chats.filter((c) => c.status === "active");
}
