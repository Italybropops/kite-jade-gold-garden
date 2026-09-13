import type { Analysis, Chat, TriageBucket } from "./types";

export function bucketFor(
  chat: Chat,
  analysis: Analysis | null,
  overrides: Record<string, TriageBucket>,
): TriageBucket {
  if (overrides[chat.id]) return overrides[chat.id];
  if (chat.pinned) return "keep";
  if (chat.archived) return "park";
  if (analysis?.deleteSuggestions.some((d) => d.chatId === chat.id)) return "drop";
  if (analysis?.workingSetIds.includes(chat.id)) return "keep";
  return "park";
}

export function bucketReason(chat: Chat, analysis: Analysis | null, bucket: TriageBucket): string {
  if (bucket === "drop") {
    return analysis?.deleteSuggestions.find((d) => d.chatId === chat.id)?.reason ?? "Marked to delete from Grok.";
  }
  if (bucket === "keep") {
    return chat.pinned
      ? "Pinned — keep this in the Grok sidebar."
      : "Working set. Pin it in Grok so it stays at the top.";
  }
  return "Reference thread. Keep it here; you can drop it from Grok’s list.";
}

export function groupByBucket(
  chats: Chat[],
  analysis: Analysis | null,
  overrides: Record<string, TriageBucket>,
): Record<TriageBucket, Chat[]> {
  const groups: Record<TriageBucket, Chat[]> = { keep: [], park: [], drop: [] };
  for (const chat of chats) {
    groups[bucketFor(chat, analysis, overrides)].push(chat);
  }
  return groups;
}
