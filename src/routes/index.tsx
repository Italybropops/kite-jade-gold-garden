import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, Wordmark } from "@/components/app-shell";
import { CleanupView } from "@/components/cleanup-view";
import { ImportView } from "@/components/import-view";
import { InsightsView } from "@/components/insights-view";
import { LibraryView } from "@/components/library-view";
import { Button } from "@/components/ui/button";
import { deepAnalyze, type CompactChat } from "@/lib/ai/deep-analyze";
import { flagsFor } from "@/lib/chats/format";
import { userText } from "@/lib/chats/parse";
import { activeChats, useChatStore } from "@/lib/chats/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const view = useChatStore((s) => s.view);
  const hydrated = useChatStore((s) => s.hydrated);

  useEffect(() => {
    const finish = () => {
      useChatStore.getState().setHydrated(true);
      useChatStore.getState().refreshAnalysis();
    };
    const unsub = useChatStore.persist.onFinishHydration(finish);
    void useChatStore.persist.rehydrate();
    if (useChatStore.persist.hasHydrated()) finish();
    const timeout = window.setTimeout(finish, 1600);
    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <Wordmark />
      </div>
    );
  }

  return (
    <AppShell actions={<AskGrokButton />}>
      {view === "insights" && <InsightsView />}
      {view === "library" && <LibraryView />}
      {view === "cleanup" && <CleanupView />}
      {view === "import" && <ImportView />}
    </AppShell>
  );
}

function AskGrokButton() {
  const [busy, setBusy] = useState(false);
  const chats = useChatStore((s) => s.chats);
  const analysis = useChatStore((s) => s.analysis);
  const setAi = useChatStore((s) => s.setAiAnalysis);
  const applyAi = useChatStore((s) => s.applyAiSummaries);
  const setView = useChatStore((s) => s.setView);

  async function run() {
    const active = activeChats(chats);
    if (!active.length) {
      toast.message("Import some chats first.");
      return;
    }
    setBusy(true);
    try {
      const compact: CompactChat[] = active.slice(0, 40).map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        createdAt: c.createdAt,
        messageCount: c.messages.length,
        userChars: userText(c).length,
        firstUser: c.messages.find((m) => m.role === "user")?.content ?? "",
        flags: flagsFor(c, analysis),
      }));
      const result = await deepAnalyze({ data: { chats: compact } });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setAi(result.analysis);
      applyAi();
      setView("insights");
      toast.success("Grok finished the deep pass.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deep analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={() => void run()} disabled={busy} size="sm" aria-busy={busy}>
      <Sparkles className="size-4" strokeWidth={1.75} />
      {busy ? "Asking Grok…" : "Ask Grok"}
    </Button>
  );
}
