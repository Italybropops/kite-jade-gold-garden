import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseFiles } from "@/lib/chats/files";
import { downloadText } from "@/lib/chats/format";
import { parseImport } from "@/lib/chats/parse";
import { useChatStore } from "@/lib/chats/store";
import type { ImportMode } from "@/lib/chats/types";
import { cn } from "@/lib/utils";

const MODES: { id: ImportMode; label: string; hint: string }[] = [
  { id: "auto", label: "Auto", hint: "Detect JSON, ZIP export, transcripts, or a title list" },
  { id: "titles", label: "Sidebar titles", hint: "One chat name per line, copied from Grok’s list" },
  { id: "transcripts", label: "Full chats", hint: "Paste threads with You / Grok labels" },
];

export function ImportView() {
  const importChats = useChatStore((s) => s.importChats);
  const loadDemo = useChatStore((s) => s.loadDemo);
  const clearLibrary = useChatStore((s) => s.clearLibrary);
  const usingDemo = useChatStore((s) => s.usingDemo);
  const chats = useChatStore((s) => s.chats);
  const [text, setText] = useState("");
  const [drag, setDrag] = useState(false);
  const [mode, setMode] = useState<ImportMode>("auto");
  const [busy, setBusy] = useState(false);

  function ingestText(raw: string, write: "append" | "replace") {
    const parsed = parseImport(raw, mode);
    if (!parsed.length) {
      toast.error(
        "Couldn’t find a chat in that paste. Drop an xAI export ZIP, add You/Grok labels, or switch to sidebar titles.",
      );
      return;
    }
    importChats(parsed, write);
    setText("");
    toast.success(write === "replace" ? `Replaced library with ${parsed.length} chats.` : `Added ${parsed.length} chats.`);
  }

  async function ingestFiles(files: FileList | null, write: "append" | "replace") {
    if (!files?.length) return;
    setBusy(true);
    try {
      const parsed = await parseFiles([...files], mode);
      if (!parsed.length) {
        toast.error("No chats in those files. Use the xAI data ZIP, JSON, or a title list.");
        return;
      }
      importChats(parsed, write);
      toast.success(write === "replace" ? `Replaced library with ${parsed.length} chats.` : `Added ${parsed.length} chats.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn’t read those files.");
    } finally {
      setBusy(false);
    }
  }

  function exportLibrary() {
    const payload = chats.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      category: c.category,
      pinned: c.pinned,
      archived: c.archived,
      summary: c.summary,
      status: c.status,
      messages: c.messages.map((m) => ({ role: m.role, content: m.content })),
    }));
    downloadText("sift-library.json", JSON.stringify(payload, null, 2), "application/json");
    toast.success("Library JSON downloaded.");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 lg:px-8">
      <header>
        <h1 className="font-display text-4xl leading-tight tracking-tight">Bring chats in</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sift cannot see grok.com or the Grok app on your Mac. Import an official xAI export, or copy from the
          sidebar — Safari, Chrome, or the Dock app you added from Safari. Everything stays on this device.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Best: official xAI export</h2>
        <ol className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">1. Request your data.</span> On this Mac open{" "}
            <span className="text-foreground">accounts.x.ai/data</span> (or grok.com → Settings → Data) and download
            the ZIP.
          </li>
          <li>
            <span className="font-medium text-foreground">2. Drop the ZIP below.</span> Sift reads{" "}
            <span className="text-foreground">prod-grok-backend.json</span> and other conversation JSON inside. Caps
            at 500 chats so this device stays snappy.
          </li>
        </ol>
      </section>

      <section className="rounded-xl border border-border p-5">
        <h2 className="text-sm font-medium">Faster: copy from the Grok sidebar</h2>
        <ol className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">1. Open Grok.</span> grok.com in Safari or Chrome, or the
            Grok app from Safari (File → Add to Dock). Same sidebar either way.
          </li>
          <li>
            <span className="font-medium text-foreground">2. Copy titles or a thread.</span> Click the sidebar,
            Cmd+A, Cmd+C — that’s a title list. Deeper: open a chat, click in the messages, Cmd+A, Cmd+C.
          </li>
          <li>
            <span className="font-medium text-foreground">3. Paste below.</span> Several full chats: put a line with
            only --- between them.
          </li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left transition-colors duration-150",
              mode === m.id ? "border-silver/40 bg-card" : "border-border hover:bg-card/80",
            )}
          >
            <span className="block text-sm font-medium">{m.label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{m.hint}</span>
          </button>
        ))}
      </div>

      <div
        className={cn(
          "rounded-xl border border-dashed px-4 py-6 transition-colors duration-150",
          drag ? "border-silver bg-card" : "border-border",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void ingestFiles(e.dataTransfer.files, usingDemo ? "replace" : "append");
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            mode === "titles"
              ? "Fix TypeScript error in React Query\nWeekend in Kyoto itinerary\nhi\ntest"
              : `You\nHow do I type useQuery in React Query v5?\n\nGrok\nPass a generic…\n\n---\n\nYou\nhi`
          }
          aria-label="Paste Grok chats"
        />
        <p className="mt-3 text-xs text-subtle">Or drop a .zip, .json, .txt, or .md file onto this panel.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => ingestText(text, usingDemo ? "replace" : "append")} disabled={!text.trim() || busy}>
            {usingDemo ? "Replace sample with paste" : "Add to library"}
          </Button>
          <Button variant="outline" onClick={() => ingestText(text, "replace")} disabled={!text.trim() || busy}>
            Replace library
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              accept=".txt,.md,.json,.zip,.markdown,text/plain,application/json,application/zip"
              multiple
              className="sr-only"
              onChange={(e) => {
                void ingestFiles(e.target.files, usingDemo ? "replace" : "append");
                e.target.value = "";
              }}
            />
            <span className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent">
              {busy ? "Reading…" : "Choose files"}
            </span>
          </label>
        </div>
      </div>

      <section className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => loadDemo()}>
          Load sample library
        </Button>
        <Button variant="outline" onClick={exportLibrary} disabled={!chats.length}>
          Export JSON
        </Button>
        <Button variant="ghost" onClick={() => clearLibrary()}>
          Clear library
        </Button>
      </section>
    </div>
  );
}
