import JSZip from "jszip";
import { parseImport } from "./parse";
import type { Chat, ImportMode } from "./types";

const PREFERRED_JSON = /(prod-grok-backend|conversations|chats|grok).*\.json$/i;

function isZip(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".zip") ||
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed"
  );
}

async function textsFromZip(file: File): Promise<string[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const jsonEntries = Object.values(zip.files).filter((f) => !f.dir && /\.json$/i.test(f.name));
  const preferred = jsonEntries.filter((f) => PREFERRED_JSON.test(f.name));
  const pick = preferred.length ? preferred : jsonEntries;
  if (pick.length) {
    const chunks: string[] = [];
    for (const entry of pick.slice(0, 8)) {
      chunks.push(await entry.async("string"));
    }
    return chunks;
  }
  const textEntries = Object.values(zip.files).filter((f) => !f.dir && /\.(txt|md|markdown)$/i.test(f.name));
  const chunks: string[] = [];
  for (const entry of textEntries.slice(0, 20)) {
    chunks.push(await entry.async("string"));
  }
  return chunks;
}

export function parseImportMany(texts: string[], mode: ImportMode): Chat[] {
  const seen = new Set<string>();
  const out: Chat[] = [];
  for (const text of texts) {
    for (const chat of parseImport(text, mode)) {
      const key = `${chat.title}::${chat.messages[0]?.content.slice(0, 80) ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(chat);
      if (out.length >= 500) return out;
    }
  }
  return out;
}

export async function parseFiles(files: File[], mode: ImportMode): Promise<Chat[]> {
  const texts: string[] = [];
  for (const file of files) {
    if (isZip(file)) {
      texts.push(...(await textsFromZip(file)));
    } else {
      texts.push(await file.text());
    }
  }
  return parseImportMany(texts, mode);
}
