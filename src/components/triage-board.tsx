import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bucketFor, bucketReason, groupByBucket } from "@/lib/chats/triage";
import { activeChats, useChatStore } from "@/lib/chats/store";
import type { Chat, TriageBucket } from "@/lib/chats/types";
import { cn } from "@/lib/utils";

const COLUMNS: { id: TriageBucket; label: string; hint: string }[] = [
  { id: "keep", label: "Keep in Grok", hint: "Short working set in the sidebar" },
  { id: "park", label: "Park in Sift", hint: "Reference only — drop from Grok" },
  { id: "drop", label: "Delete", hint: "Clutter, weaker copies, stale one-offs" },
];

export function TriageBoard() {
  const chats = useChatStore((s) => s.chats);
  const analysis = useChatStore((s) => s.analysis);
  const triage = useChatStore((s) => s.triage);
  const setTriage = useChatStore((s) => s.setTriage);
  const applyTriagePlan = useChatStore((s) => s.applyTriagePlan);
  const select = useChatStore((s) => s.select);
  const setView = useChatStore((s) => s.setView);

  const active = activeChats(chats);
  const groups = groupByBucket(active, analysis, triage);
  const dirty = Object.keys(triage).length > 0;

  function apply() {
    applyTriagePlan();
    toast.success("Applied in Sift. Tick the same titles in Grok’s sidebar.");
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Hybrid triage</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            A short list lives in grok.com or the Safari Dock app. The rest stays here. Delete the noise so both
            places can breathe.
          </p>
        </div>
        <Button onClick={apply} variant={dirty ? "default" : "outline"}>
          Apply plan in Sift
        </Button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.id} className="rounded-lg bg-muted/70 p-3">
            <div className="flex items-baseline justify-between gap-2 px-1">
              <h3 className="text-sm font-medium">{col.label}</h3>
              <span className="text-xs tabular-nums text-subtle">{groups[col.id].length}</span>
            </div>
            <p className="mt-0.5 px-1 text-xs text-muted-foreground">{col.hint}</p>
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {groups[col.id].length === 0 ? (
                <li className="px-1 py-6 text-center text-xs text-subtle">Nothing here.</li>
              ) : (
                groups[col.id].map((chat) => (
                  <TriageCard
                    key={chat.id}
                    chat={chat}
                    bucket={col.id}
                    reason={bucketReason(chat, analysis, bucketFor(chat, analysis, triage))}
                    onMove={setTriage}
                    onOpen={() => {
                      select(chat.id);
                      setView("library");
                    }}
                  />
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function TriageCard({
  chat,
  bucket,
  reason,
  onMove,
  onOpen,
}: {
  chat: Chat;
  bucket: TriageBucket;
  reason: string;
  onMove: (id: string, bucket: TriageBucket) => void;
  onOpen: () => void;
}) {
  return (
    <li className="rounded-md border border-border bg-card px-3 py-2.5">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <p className="text-sm leading-snug font-medium">{chat.title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{reason}</p>
      </button>
      <div className="mt-2 flex flex-wrap gap-1">
        {COLUMNS.map((col) => (
          <button
            key={col.id}
            type="button"
            onClick={() => onMove(chat.id, col.id)}
            className={cn(
              "h-9 rounded-sm px-2.5 text-xs font-medium transition-colors duration-150",
              bucket === col.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {col.id === "keep" ? "Keep" : col.id === "park" ? "Park" : "Delete"}
          </button>
        ))}
      </div>
    </li>
  );
}
