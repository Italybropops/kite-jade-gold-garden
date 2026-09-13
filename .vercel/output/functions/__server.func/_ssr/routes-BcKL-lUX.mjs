import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as Slot, m as require_jsx_runtime, n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as CATEGORIES } from "./types-CeBp-iFm.mjs";
import { a as Search, c as Library, d as Copy, f as Check, i as Sparkles, l as Layers, n as Upload, o as Pin, s as PinOff, t as X, u as FolderOpen } from "../_libs/lucide-react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as cn } from "./router-Bssnee-T.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { n as formatDistanceToNowStrict, t as parseISO } from "../_libs/date-fns.mjs";
import { t as require_lib } from "../_libs/jszip+[...].mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
import { i as Viewport, n as ScrollAreaScrollbar, r as ScrollAreaThumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
import { t as Root$1 } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BcKL-lUX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
var STOP = /* @__PURE__ */ new Set([
	"the",
	"and",
	"for",
	"that",
	"this",
	"with",
	"from",
	"your",
	"have",
	"are",
	"was",
	"were",
	"you",
	"but",
	"not",
	"can",
	"just",
	"about",
	"what",
	"when",
	"how",
	"why",
	"who",
	"please",
	"like",
	"need",
	"want",
	"make",
	"help"
]);
function tokenize(text) {
	return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}
function newId(prefix = "c") {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function asCategory(value) {
	if (typeof value === "string" && CATEGORIES.includes(value)) return value;
	return "Other";
}
function titleFrom(text) {
	const line = text.replace(/\s+/g, " ").trim();
	if (!line) return "Untitled chat";
	const cut = line.slice(0, 72);
	return cut.length < line.length ? `${cut.replace(/[,:;.\s]+$/, "")}…` : cut;
}
function firstSentence(text, max = 140) {
	const compact = text.replace(/\s+/g, " ").trim();
	if (!compact) return "";
	const sentence = (compact.match(/^(.+?[.!?])(?:\s|$)/)?.[1] ?? compact).trim();
	return sentence.length > max ? `${sentence.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : sentence;
}
function summaryFrom(messages) {
	const user = messages.find((m) => m.role === "user")?.content ?? "";
	const lastAsst = [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
	const asked = firstSentence(user, 110);
	const outcome = firstSentence(lastAsst, 90);
	if (asked && outcome) {
		const joined = `${asked} → ${outcome}`;
		return joined.length > 220 ? `${joined.slice(0, 217)}…` : joined;
	}
	if (asked) return asked.length > 180 ? `${asked.slice(0, 177)}…` : asked;
	if (outcome) return outcome;
	return "Empty chat";
}
function toChat(partial) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const messages = (partial.messages.length ? partial.messages : [{
		id: newId("m"),
		role: "user",
		content: ""
	}]).map((m) => ({
		...m,
		content: m.content.length > 12e3 ? `${m.content.slice(0, 12e3)}\n…[truncated]` : m.content
	}));
	return {
		id: newId("c"),
		title: partial.title?.trim() || titleFrom(messages[0]?.content ?? ""),
		createdAt: partial.createdAt ?? now,
		updatedAt: partial.updatedAt ?? partial.createdAt ?? now,
		messages,
		source: partial.source ?? "import",
		status: "active",
		category: partial.category ?? "Other",
		pinned: false,
		archived: false,
		summary: summaryFrom(messages)
	};
}
var SPEAKER = /^(user|you|human|me|grok|assistant|model|chatgpt|ai)\s*[:.\-–]?\s*$/i;
var SPEAKER_INLINE = /^(user|you|human|me|grok|assistant|model)\s*[:.\-–]\s*(.*)$/i;
var TIME_ONLY = /^(?:\d{1,2}:\d{2}(?:\s*[ap]m)?|\d{1,2}\s*[ap]m|just now|yesterday|today|\d+\s*(?:s|m|h|d|sec|min|hr|hour|day)s?\s*ago)$/i;
function stripDecor(line) {
	return line.trim().replace(/^\*+|\*+$/g, "").replace(/^_+|_+$/g, "").replace(/^#+\s+/, "").trim();
}
function parseTranscript(block) {
	const lines = block.replace(/\r\n/g, "\n").split("\n");
	const messages = [];
	let role = null;
	let buf = [];
	let inferredTitle;
	const flush = () => {
		const content = buf.join("\n").trim();
		if (role && content) messages.push({
			id: newId("m"),
			role,
			content
		});
		buf = [];
	};
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = stripDecor(line);
		if (!trimmed) {
			if (role) buf.push("");
			continue;
		}
		if (TIME_ONLY.test(trimmed)) continue;
		if (SPEAKER.test(trimmed)) {
			flush();
			const key = trimmed.toLowerCase();
			role = key.startsWith("user") || key === "you" || key === "human" || key === "me" ? "user" : "assistant";
			continue;
		}
		const inline = trimmed.match(SPEAKER_INLINE);
		if (inline) {
			flush();
			const key = inline[1].toLowerCase();
			role = key === "you" || key === "human" || key === "me" || key === "user" ? "user" : "assistant";
			buf = [inline[2]];
			continue;
		}
		if (!role && messages.length === 0 && buf.length === 0 && trimmed.length <= 80) {
			const next = lines.slice(i + 1).map(stripDecor).find((l) => l.length > 0);
			if (next && (SPEAKER.test(next) || SPEAKER_INLINE.test(next))) {
				inferredTitle = trimmed;
				continue;
			}
		}
		if (role) buf.push(line.trimEnd());
		else buf.push(line.trimEnd());
	}
	if (!role && buf.some((l) => l.trim())) role = "user";
	flush();
	return {
		title: inferredTitle,
		messages
	};
}
function splitBlocks(text) {
	const trimmed = text.trim();
	if (!trimmed) return [];
	const blocks = trimmed.split(/^\s*(?:-{3,}|\*{3,}|={3,}|_{3,})\s*$/m).map((p) => p.trim()).filter(Boolean);
	return blocks.length ? blocks : [trimmed];
}
function mongoDate(value) {
	if (value == null) return void 0;
	if (typeof value === "number" && Number.isFinite(value)) {
		const ms = value > 0 && value < 0xe8d4a51000 ? value * 1e3 : value;
		const d = new Date(ms);
		return Number.isNaN(d.getTime()) ? void 0 : d.toISOString();
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (/^\d{12,}$/.test(trimmed)) {
			const d = new Date(Number(trimmed));
			return Number.isNaN(d.getTime()) ? void 0 : d.toISOString();
		}
		const parsed = Date.parse(trimmed);
		if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
		return;
	}
	if (typeof value === "object") {
		const rec = value;
		if (rec.$numberLong != null) return mongoDate(rec.$numberLong);
		if (rec.$date != null) return mongoDate(rec.$date);
		if (typeof rec.seconds === "number") return mongoDate(rec.seconds * 1e3);
	}
}
function flattenContent(raw) {
	if (typeof raw === "string") return raw;
	if (Array.isArray(raw)) return raw.map((part) => {
		if (typeof part === "string") return part;
		if (part && typeof part === "object") {
			const p = part;
			return String(p.text ?? p.content ?? p.value ?? "");
		}
		return "";
	}).join("");
	if (raw && typeof raw === "object") {
		const p = raw;
		return String(p.text ?? p.content ?? p.value ?? "");
	}
	return "";
}
function messageFromUnknown(m) {
	if (!m || typeof m !== "object") return null;
	const rec = m;
	const nested = rec.message;
	const src = nested && typeof nested === "object" && !Array.isArray(nested) && !("content" in rec && typeof rec.content === "string") ? {
		...nested,
		...rec
	} : rec;
	const content = flattenContent(src.content ?? src.message ?? src.text ?? src.prompt ?? src.body ?? src.input ?? src.output).trim();
	if (!content) return null;
	const roleRaw = String(src.role ?? src.sender ?? src.author ?? src.from ?? rec.role ?? "user").toLowerCase();
	if (roleRaw.includes("system") && !roleRaw.includes("assistant")) return null;
	const role = /assistant|grok|model|bot/.test(roleRaw) && !roleRaw.includes("user") ? "assistant" : "user";
	if (roleRaw === "human" || roleRaw === "you" || roleRaw === "me") return {
		id: newId("m"),
		role: "user",
		content
	};
	return {
		id: newId("m"),
		role,
		content
	};
}
function chatFromRecord(row) {
	const nested = row.conversation;
	const conv = nested && typeof nested === "object" && !Array.isArray(nested) ? nested : row;
	const rawMessages = row.messages ?? row.responses ?? row.turns ?? row.history ?? conv.messages ?? conv.responses ?? conv.turns;
	const messages = Array.isArray(rawMessages) ? rawMessages.map(messageFromUnknown).filter((m) => Boolean(m)) : [];
	if (!messages.length) {
		const text = flattenContent(row.content ?? row.text ?? row.prompt ?? conv.content).trim();
		if (text) messages.push({
			id: newId("m"),
			role: "user",
			content: text
		});
	}
	if (!messages.length) return null;
	const title = typeof conv.title === "string" && conv.title || typeof row.title === "string" && row.title || typeof row.name === "string" && row.name || void 0;
	const createdAt = mongoDate(conv.createdAt ?? conv.created_at ?? conv.create_time ?? conv.created ?? row.createdAt ?? row.created_at ?? row.create_time);
	return toChat({
		title,
		createdAt,
		updatedAt: mongoDate(conv.updatedAt ?? conv.updated_at ?? conv.update_time ?? row.updatedAt ?? row.updated_at ?? row.update_time) ?? createdAt,
		messages,
		category: asCategory(conv.category ?? row.category)
	});
}
function parseJsonChats(data) {
	const out = [];
	collectChats(data, out, 0);
	const unique = /* @__PURE__ */ new Map();
	for (const chat of out) {
		const key = `${chat.title}::${chat.messages.map((m) => m.content.slice(0, 40)).join("|")}`.slice(0, 240);
		if (!unique.has(key)) unique.set(key, chat);
	}
	const chats = [...unique.values()].slice(0, 500);
	return chats.length ? chats : null;
}
function collectChats(data, out, depth) {
	if (depth > 8 || out.length >= 500 || data == null) return;
	if (Array.isArray(data)) {
		const mapped = data.map((row) => row && typeof row === "object" ? chatFromRecord(row) : null).filter((c) => Boolean(c));
		const objectCount = data.filter((x) => x && typeof x === "object").length;
		if (mapped.length && mapped.length >= Math.max(1, objectCount * .5)) {
			out.push(...mapped);
			return;
		}
		for (const item of data) collectChats(item, out, depth + 1);
		return;
	}
	if (typeof data !== "object") return;
	const rec = data;
	for (const key of [
		"conversations",
		"chats",
		"threads",
		"items",
		"data",
		"history",
		"grok_conversations"
	]) if (rec[key] != null) {
		const before = out.length;
		collectChats(rec[key], out, depth + 1);
		if (out.length > before) return;
	}
	const one = chatFromRecord(rec);
	if (one && (Array.isArray(rec.messages) || Array.isArray(rec.responses) || Array.isArray(rec.turns) || rec.conversation)) {
		out.push(one);
		return;
	}
	for (const [key, value] of Object.entries(rec)) {
		if (key === "account" || key === "user" || key === "profile") continue;
		if (value && typeof value === "object") collectChats(value, out, depth + 1);
		if (out.length >= 500) return;
	}
}
function nonEmptyLines(text) {
	return text.replace(/\r\n/g, "\n").split("\n").map((l) => stripDecor(l)).filter((l) => l.length > 0 && !TIME_ONLY.test(l));
}
function looksLikeTitleList(text) {
	if (/^\s*(?:-{3,}|\*{3,}|={3,})/m.test(text) && splitBlocks(text).length > 1) return false;
	const lines = nonEmptyLines(text);
	if (lines.length < 8) return false;
	if (lines.some((l) => SPEAKER.test(l) || SPEAKER_INLINE.test(l))) return false;
	if (lines.some((l) => l.length > 80)) return false;
	return lines.reduce((n, l) => n + l.length, 0) / lines.length <= 48;
}
function parseTitleList(text) {
	return nonEmptyLines(text).filter((line) => line.length >= 2).map((line) => toChat({
		title: titleFrom(line),
		messages: [{
			id: newId("m"),
			role: "user",
			content: line
		}]
	}));
}
function parseTranscripts(text) {
	return splitBlocks(text).map((block) => {
		const heading = block.match(/^\s{0,3}#{1,3}\s+(.+)$/m);
		const title = heading?.[1]?.trim();
		const body = heading ? block.replace(heading[0], "").trim() : block;
		const parsed = parseTranscript(body);
		const messages = parsed.messages.length ? parsed.messages : [{
			id: newId("m"),
			role: "user",
			content: body
		}];
		return toChat({
			title: title || parsed.title,
			messages
		});
	});
}
function parseImport(raw, mode = "auto") {
	const text = raw.replace(/^\uFEFF/, "").trim();
	if (!text) return [];
	if (mode === "titles") return parseTitleList(text);
	if (mode === "transcripts") return parseTranscripts(text);
	if (text.startsWith("{") || text.startsWith("[")) try {
		const fromJson = parseJsonChats(JSON.parse(text));
		if (fromJson?.length) return fromJson;
	} catch {}
	const jsonl = parseJsonLines(text);
	if (jsonl.length >= 2) return jsonl;
	if (looksLikeTitleList(text)) return parseTitleList(text);
	return parseTranscripts(text);
}
function parseJsonLines(text) {
	const lines = text.split(/\n+/).map((l) => l.trim()).filter((l) => l.startsWith("{") || l.startsWith("["));
	if (lines.length < 2) return [];
	const chats = [];
	for (const line of lines) try {
		const parsed = parseJsonChats(JSON.parse(line));
		if (parsed) chats.push(...parsed);
	} catch {}
	return chats.slice(0, 500);
}
function userText(chat) {
	return chat.messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
}
function allText(chat) {
	return `${chat.title}\n${chat.messages.map((m) => m.content).join("\n")}`;
}
function charCount(chat) {
	return chat.messages.reduce((n, m) => n + m.content.length, 0);
}
var CATEGORY_KEYWORDS = {
	Code: [
		"typescript",
		"javascript",
		"python",
		"react",
		"query",
		"error",
		"debug",
		"vite",
		"function",
		"swift",
		"docker",
		"pandas",
		"code",
		"hook",
		"compile",
		"hmr",
		"stack",
		"github",
		"npm",
		"sql",
		"api",
		"bug",
		"css",
		"html",
		"terminal"
	],
	Writing: [
		"email",
		"letter",
		"rewrite",
		"tone",
		"draft",
		"resignation",
		"warmer",
		"professional",
		"copy",
		"headline",
		"bio"
	],
	Research: [
		"hypothesis",
		"history",
		"compare",
		"briefing",
		"versus",
		"vs",
		"paper",
		"sources",
		"cite"
	],
	Creative: [
		"image",
		"prompt",
		"cinematic",
		"illustration",
		"story",
		"poem",
		"character",
		"scene",
		"midjourney"
	],
	Travel: [
		"itinerary",
		"trip",
		"temple",
		"flight",
		"hotel",
		"weekend",
		"airport",
		"visa",
		"packing",
		"kyoto",
		"tokyo"
	],
	Lifestyle: [
		"protein",
		"meal",
		"espresso",
		"gym",
		"recipe",
		"coffee",
		"diet",
		"sleep",
		"workout"
	],
	Learning: [
		"explain",
		"transformer",
		"quantum",
		"entanglement",
		"attention",
		"tutorial",
		"concept"
	],
	Planning: [
		"plan",
		"spec",
		"habit",
		"budget",
		"tracker",
		"roadmap",
		"checklist"
	],
	Support: [
		"macos",
		"safari",
		"pwa",
		"desktop",
		"install",
		"stuck",
		"crash",
		"settings",
		"m2",
		"macbook"
	],
	Other: []
};
var CLUTTER_TITLES = /^(hi|hey|hello|test|ok|okay|thanks|thank you|asdf|yo|sup|hmm+|lol)$/i;
var GENERIC_PHRASES = /* @__PURE__ */ new Set([
	"let me",
	"not sure",
	"one more",
	"next step",
	"make sure",
	"looks like",
	"something else"
]);
function cosine(a, b) {
	let dot = 0;
	let na = 0;
	let nb = 0;
	a.forEach((v, k) => {
		na += v * v;
		const bv = b.get(k);
		if (bv) dot += v * bv;
	});
	b.forEach((v) => {
		nb += v * v;
	});
	if (!na || !nb) return 0;
	return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
function jaccard(a, b) {
	const sa = new Set(a);
	const sb = new Set(b);
	let inter = 0;
	sa.forEach((t) => {
		if (sb.has(t)) inter += 1;
	});
	const union = sa.size + sb.size - inter;
	return union ? inter / union : 0;
}
function vector(text) {
	const counts = /* @__PURE__ */ new Map();
	for (const t of tokenize(text)) counts.set(t, (counts.get(t) ?? 0) + 1);
	return counts;
}
function ngrams(tokens, n) {
	if (tokens.length < n) return [];
	const out = [];
	for (let i = 0; i <= tokens.length - n; i++) out.push(tokens.slice(i, i + n).join(" "));
	return out;
}
function titleCase(phrase) {
	return phrase.replace(/\b[a-z0-9]+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}
function inferCategory(chat) {
	const text = allText(chat).toLowerCase();
	let best = "Other";
	let bestScore = 0;
	for (const cat of CATEGORIES) {
		if (cat === "Other") continue;
		let score = 0;
		for (const kw of CATEGORY_KEYWORDS[cat]) if (text.includes(kw)) score += 1;
		if (score > bestScore) {
			bestScore = score;
			best = cat;
		}
	}
	return bestScore >= 1 ? best : "Other";
}
function isClutter(chat) {
	const user = userText(chat).trim();
	const title = chat.title.trim();
	if (CLUTTER_TITLES.test(title) || CLUTTER_TITLES.test(user)) return true;
	if (!title && user.length < 12) return true;
	if (charCount(chat) < 12 && title.length < 12) return true;
	return false;
}
function daysAgo(iso) {
	return (Date.now() - new Date(iso).getTime()) / 864e5;
}
function unionFind(pairs) {
	const parent = /* @__PURE__ */ new Map();
	const ensure = (id) => {
		if (!parent.has(id)) parent.set(id, id);
	};
	const find = (id) => {
		ensure(id);
		if (parent.get(id) !== id) parent.set(id, find(parent.get(id)));
		return parent.get(id);
	};
	const union = (a, b) => {
		const pa = find(a);
		const pb = find(b);
		if (pa !== pb) parent.set(pa, pb);
	};
	for (const [a, b] of pairs) union(a, b);
	const groups = /* @__PURE__ */ new Map();
	for (const id of parent.keys()) {
		const root = find(id);
		const list = groups.get(root) ?? [];
		list.push(id);
		groups.set(root, list);
	}
	return [...groups.values()].filter((g) => g.length > 1);
}
function extractRepeatTopics(active) {
	const phraseToIds = /* @__PURE__ */ new Map();
	for (const c of active) {
		if (isClutter(c)) continue;
		const titleToks = tokenize(c.title);
		const phrases = /* @__PURE__ */ new Set([...ngrams(titleToks, 2), ...ngrams(titleToks, 3)]);
		for (const p of phrases) {
			if (GENERIC_PHRASES.has(p)) continue;
			const set = phraseToIds.get(p) ?? /* @__PURE__ */ new Set();
			set.add(c.id);
			phraseToIds.set(p, set);
		}
	}
	const ranked = [...phraseToIds.entries()].filter(([, ids]) => ids.size >= 2).sort((a, b) => b[1].size - a[1].size || b[0].length - a[0].length);
	const covered = /* @__PURE__ */ new Set();
	const topics = [];
	const byId = new Map(active.map((c) => [c.id, c]));
	for (const [label, ids] of ranked) {
		const chatIds = [...ids];
		if (chatIds.every((id) => covered.has(id))) continue;
		const tally = /* @__PURE__ */ new Map();
		for (const id of chatIds) {
			const cat = byId.get(id)?.category ?? "Other";
			tally.set(cat, (tally.get(cat) ?? 0) + 1);
		}
		const category = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Other";
		topics.push({
			label: titleCase(label),
			chatIds,
			category
		});
		chatIds.forEach((id) => covered.add(id));
		if (topics.length >= 8) break;
	}
	if (topics.length === 0) {
		const topicMap = /* @__PURE__ */ new Map();
		for (const c of active) {
			if (isClutter(c)) continue;
			const existing = topicMap.get(c.category);
			if (existing) existing.chatIds.push(c.id);
			else topicMap.set(c.category, {
				label: c.category,
				chatIds: [c.id],
				category: c.category
			});
		}
		return [...topicMap.values()].filter((t) => t.chatIds.length >= 2).sort((a, b) => b.chatIds.length - a.chatIds.length);
	}
	return topics;
}
function suggestTitle(chat) {
	const raw = chat.title.trim();
	const user = userText(chat).replace(/\s+/g, " ").trim();
	let core = (raw.length >= 8 && !CLUTTER_TITLES.test(raw) ? raw : user).replace(/\s+/g, " ").trim().replace(/[?.!]+$/, "");
	if (core.length > 46) core = `${core.slice(0, 46).replace(/\s+\S*$/, "")}…`;
	if (!core) return `${chat.category} · Untitled`;
	if (core.toLowerCase().startsWith(chat.category.toLowerCase())) return core;
	if (core.includes(" · ")) return core;
	return `${chat.category} · ${core}`;
}
function analyzeChats(chats) {
	const active = chats.filter((c) => c.status === "active");
	const clutterIds = active.filter(isClutter).map((c) => c.id);
	const vecs = /* @__PURE__ */ new Map();
	const titleToks = /* @__PURE__ */ new Map();
	for (const c of active) {
		vecs.set(c.id, vector(`${c.title}\n${userText(c)}`));
		titleToks.set(c.id, tokenize(c.title));
	}
	const dupPairs = [];
	const near = [];
	for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
		const a = active[i];
		const b = active[j];
		const cos = cosine(vecs.get(a.id), vecs.get(b.id));
		const jac = jaccard(titleToks.get(a.id), titleToks.get(b.id));
		const score = cos * .72 + jac * .28;
		if (score >= .46) {
			near.push({
				a: a.id,
				b: b.id,
				score
			});
			if (score >= .58) dupPairs.push([a.id, b.id]);
		}
	}
	const byId = new Map(active.map((c) => [c.id, c]));
	const dupGroups = unionFind(dupPairs).map((chatIds, i) => {
		const ranked = [...chatIds].sort((x, y) => charCount(byId.get(y)) - charCount(byId.get(x)));
		const keepId = ranked[0];
		const avg = near.filter((n) => chatIds.includes(n.a) && chatIds.includes(n.b)).reduce((s, n) => s + n.score, 0) / Math.max(1, chatIds.length - 1);
		return {
			id: `dup-${i + 1}`,
			chatIds: ranked,
			score: avg,
			keepId,
			reason: `Nearly the same question across ${ranked.length} chats. Keep the longest thread and drop the rest.`
		};
	});
	const covered = new Set(dupGroups.flatMap((g) => g.chatIds));
	const mergeSuggestions = [];
	unionFind(near.filter((n) => !covered.has(n.a) || !covered.has(n.b)).filter((n) => n.score >= .46).map((n) => [n.a, n.b])).forEach((chatIds, i) => {
		if (chatIds.some((id) => clutterIds.includes(id))) return;
		const items = chatIds.map((id) => byId.get(id));
		const cats = new Set(items.map((c) => c.category));
		if (cats.size > 2) return;
		const title = items.sort((a, b) => charCount(b) - charCount(a))[0].title;
		mergeSuggestions.push({
			id: `merge-${i + 1}`,
			chatIds,
			score: .5,
			title: `Merge: ${title}`,
			reason: cats.size === 1 ? `Same topic (${[...cats][0]}). Combining keeps one canonical thread.` : "Overlapping questions. One merged thread is easier to find later."
		});
	});
	dupGroups.forEach((g, i) => {
		if (g.chatIds.length < 2) return;
		if (mergeSuggestions.some((m) => m.chatIds.join() === g.chatIds.join())) return;
		mergeSuggestions.unshift({
			id: `merge-dup-${i + 1}`,
			chatIds: g.chatIds,
			score: g.score,
			title: `Merge duplicates: ${byId.get(g.keepId)?.title ?? "thread"}`,
			reason: g.reason
		});
	});
	const deleteSuggestions = [];
	for (const id of clutterIds) deleteSuggestions.push({
		chatId: id,
		reason: "Greeting, test, or too short to be worth keeping in Grok.",
		severity: "clutter"
	});
	for (const g of dupGroups) for (const id of g.chatIds) {
		if (id === g.keepId) continue;
		if (deleteSuggestions.some((d) => d.chatId === id)) continue;
		deleteSuggestions.push({
			chatId: id,
			reason: `Weaker copy of “${byId.get(g.keepId)?.title ?? "another chat"}”.`,
			severity: "duplicate"
		});
	}
	for (const c of active) {
		if (clutterIds.includes(c.id)) continue;
		if (deleteSuggestions.some((d) => d.chatId === c.id)) continue;
		if (c.pinned) continue;
		if (c.messages.length <= 2 && charCount(c) < 220 && daysAgo(c.updatedAt) > 60) deleteSuggestions.push({
			chatId: c.id,
			reason: "Short and untouched for two months — likely a one-off.",
			severity: "stale"
		});
	}
	const repeatTopics = extractRepeatTopics(active);
	const workingSetIds = [...active].sort((a, b) => {
		const pin = Number(b.pinned) - Number(a.pinned);
		if (pin) return pin;
		return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
	}).filter((c) => !clutterIds.includes(c.id) && !deleteSuggestions.some((d) => d.chatId === c.id && d.severity !== "stale")).slice(0, 10).map((c) => c.id);
	const archiveIds = active.filter((c) => !workingSetIds.includes(c.id) && !clutterIds.includes(c.id) && !deleteSuggestions.some((d) => d.chatId === c.id)).map((c) => c.id);
	const renameSuggestions = active.filter((c) => !isClutter(c)).map((c) => {
		const suggested = suggestTitle(c);
		if (suggested === c.title) return null;
		return {
			chatId: c.id,
			suggested,
			reason: "Topic first, so the Grok sidebar scans in one glance."
		};
	}).filter((r) => Boolean(r)).slice(0, 16);
	const orgSuggestions = [
		{
			id: "org-folders",
			kind: "folder",
			title: "Prefix titles if Grok has no folders",
			detail: repeatTopics.length ? `Use topic-first names so the sidebar clusters: ${repeatTopics.slice(0, 5).map((t) => `${t.category} ·`).join(" ")}. Leave one-offs unprefixed.` : "Grok’s sidebar is recency, not folders. Prefix the keepers: Code ·, Travel · — extra prefixes become clutter.",
			chatIds: []
		},
		{
			id: "org-naming",
			kind: "naming",
			title: "Rename with topic first",
			detail: renameSuggestions.length ? `Pattern: Topic · short outcome. ${renameSuggestions.length} chats would scan faster with that shape.` : "Pattern: Topic · short outcome. Example: “Code · React Query types”. Names are how you scan; Grok still sorts by recency.",
			chatIds: renameSuggestions.map((r) => r.chatId)
		},
		{
			id: "org-hybrid",
			kind: "hybrid",
			title: "Hybrid: a short Grok sidebar, the rest in Sift",
			detail: `Keep ${workingSetIds.length} working chats in grok.com or the Safari Dock app (pinned or recently used). Park ${archiveIds.length} reference threads here. Delete ${deleteSuggestions.length} so the list can breathe.`,
			chatIds: workingSetIds
		},
		{
			id: "org-pin",
			kind: "pin",
			title: "Pin the long research threads",
			detail: "Anything you’d reread — trip plans, specs, type history — should be pinned in Grok and here. One-offs don’t get a pin.",
			chatIds: active.filter((c) => c.pinned || c.messages.length >= 4).map((c) => c.id)
		}
	];
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		duplicateGroups: dupGroups,
		mergeSuggestions,
		deleteSuggestions,
		orgSuggestions,
		renameSuggestions,
		repeatTopics,
		clutterIds,
		workingSetIds,
		archiveIds
	};
}
function applyInferredCategories(chats) {
	return chats.map((c) => {
		if (c.source === "import" && c.category === "Other") return {
			...c,
			category: inferCategory(c)
		};
		if (c.source === "demo") return c;
		if (c.category === "Other") return {
			...c,
			category: inferCategory(c)
		};
		return c;
	});
}
function formatChecklist(chats, analysis) {
	const byId = new Map(chats.map((c) => [c.id, c]));
	const lines = [
		"# Sift cleanup plan for Grok",
		"",
		"Work through this in grok.com or the Grok Mac app. Sift cannot delete chats on Grok’s servers — this is your checklist.",
		"",
		"## Delete in Grok",
		""
	];
	for (const d of analysis.deleteSuggestions) {
		const c = byId.get(d.chatId);
		if (!c) continue;
		lines.push(`- [ ] ${c.title} — ${d.reason}`);
	}
	lines.push("", "## Merge (open both, keep one, delete the extra)", "");
	for (const m of analysis.mergeSuggestions) {
		const titles = m.chatIds.map((id) => byId.get(id)?.title).filter(Boolean);
		lines.push(`- [ ] ${titles.join(" + ")}`);
		lines.push(`      ${m.reason}`);
	}
	lines.push("", "## Rename in Grok", "");
	for (const r of analysis.renameSuggestions) {
		const c = byId.get(r.chatId);
		if (!c) continue;
		lines.push(`- [ ] ${c.title} → ${r.suggested}`);
	}
	lines.push("", "## Keep in the Grok sidebar (working set)", "");
	for (const id of analysis.workingSetIds) {
		const c = byId.get(id);
		if (c) lines.push(`- ${c.title}`);
	}
	lines.push("", "## Hybrid organization", "");
	for (const o of analysis.orgSuggestions) lines.push(`- ${o.title}: ${o.detail}`);
	lines.push("");
	return lines.join("\n");
}
function msg(role, content, i) {
	return {
		id: `m-${i}`,
		role,
		content
	};
}
function chat(opts) {
	const messages = [];
	let i = 0;
	for (const turn of opts.turns) {
		messages.push(msg("user", turn[0], ++i));
		if (turn[1]) messages.push(msg("assistant", turn[1], ++i));
	}
	if (opts.extraUser) messages.push(msg("user", opts.extraUser, ++i));
	const blob = messages.filter((m) => m.role === "user").map((m) => m.content).join(" ");
	const summary = blob.replace(/\s+/g, " ").trim().slice(0, 180) + (blob.length > 180 ? "…" : "");
	return {
		id: `demo-${opts.n}`,
		title: opts.title,
		createdAt: opts.created,
		updatedAt: opts.updated ?? opts.created,
		messages,
		source: "demo",
		status: "active",
		category: opts.category,
		pinned: Boolean(opts.pinned),
		archived: false,
		summary
	};
}
/** Sample Grok library so analysis is immediately visible. */
var DEMO_CHATS = [
	chat({
		n: "01",
		title: "Fix TypeScript error in React Query",
		created: "2026-08-18T14:12:00.000Z",
		updated: "2026-08-18T14:40:00.000Z",
		category: "Code",
		pinned: true,
		turns: [["I'm getting a TypeScript error with useQuery in React Query v5. The data type is unknown and TError is leaking into my component. Here's the hook: useQuery({ queryKey: ['todos'], queryFn: fetchTodos }). How do I type this cleanly?", "Pass a type param to useQuery: useQuery<Todo[]>({ queryKey: ['todos'], queryFn: fetchTodos }). Better: type the queryFn return and let inference work. Also set queryKey as a const tuple. staleTime is independent of gcTime — staleTime controls refetch, gcTime controls cache garbage collection."], ["Still seeing 'Property data does not exist on type {}'. Is my QueryClient missing a default?", "That usually means the QueryClient generic defaults were overridden or you're importing useQuery from the wrong path. Register the default error type on QueryClient and avoid wrapping the hook in a custom function without forwarding type params."]]
	}),
	chat({
		n: "02",
		title: "React Query staleTime vs gcTime",
		created: "2026-08-19T09:04:00.000Z",
		category: "Code",
		turns: [["Can you explain React Query staleTime vs gcTime? I keep refetching todos with useQuery and TypeScript is also complaining about the data type being unknown.", "staleTime: how long data is considered fresh. gcTime: how long inactive cache lives. For todos, staleTime of 30s is common. Type useQuery with the data generic so data is Todo[] instead of unknown."]]
	}),
	chat({
		n: "03",
		title: "Help with useQuery TypeScript",
		created: "2026-08-20T11:22:00.000Z",
		category: "Code",
		turns: [["useQuery typescript error data unknown. React Query v5. queryKey todos queryFn fetchTodos. Please fix.", "Add a generic: useQuery<Todo[]>({ queryKey: ['todos'], queryFn: fetchTodos })."]]
	}),
	chat({
		n: "04",
		title: "hi",
		created: "2026-07-02T08:01:00.000Z",
		category: "Other",
		turns: [["hi"]]
	}),
	chat({
		n: "05",
		title: "test",
		created: "2026-07-02T08:02:00.000Z",
		category: "Other",
		turns: [["test"]]
	}),
	chat({
		n: "06",
		title: "Weekend in Kyoto itinerary",
		created: "2026-08-01T16:00:00.000Z",
		updated: "2026-08-03T10:12:00.000Z",
		category: "Travel",
		pinned: true,
		turns: [["Plan a 3-day weekend in Kyoto for two people who like temples, walking, and food. Mid-range budget. We land Friday afternoon and leave Monday morning. Avoid the most overcrowded hours at Fushimi Inari.", "Friday: check in near Gion, walk the Shirakawa canal, dinner in Pontocho. Saturday: Arashiyama bamboo early, then Kinkaku-ji, afternoon at Nishiki. Sunday: Fushimi Inari at 6:30am, then Nara if you have energy, or Philosopher's Path. Monday: coffee in a machiya and train to the airport. I'll list restaurants next."], ["Swap Nara for more food in Kyoto. Also a rainy-day backup.", "Rainy day: Kyoto Railway Museum or a tea ceremony in a machiya, then Nishiki covered arcade. Food: Gyoza no Ohsho for a cheap dinner, Kikunoi if you want one splurge kaiseki, and a breakfast at % Arabica only if the line is short — otherwise a kissaten near your hotel."]]
	}),
	chat({
		n: "07",
		title: "Kyoto 3-day trip food",
		created: "2026-08-04T19:40:00.000Z",
		category: "Travel",
		turns: [["Need food recs for a 3-day Kyoto trip. Temples and walking too. Mid-range. Fushimi Inari early to skip crowds. Any kaiseki that's not insane?", "Kikunoi is the splurge. For casual: Nishiki stalls, ramen at Menbaka, and a tofu lunch in Arashiyama. Go to Fushimi Inari at dawn."]]
	}),
	chat({
		n: "08",
		title: "Explain transformers like I'm 12",
		created: "2026-06-12T13:00:00.000Z",
		category: "Learning",
		turns: [["Explain transformers (the neural net, not robots) like I'm 12. I keep seeing attention is all you need.", "Imagine reading a sentence and highlighting the words that help you understand the current word. That's attention. A transformer does that in parallel for every word, stacked in layers, which is why it can write and translate so well."]]
	}),
	chat({
		n: "09",
		title: "Write a resignation letter",
		created: "2026-08-11T07:55:00.000Z",
		category: "Writing",
		turns: [["Write a short, warm resignation letter. Two weeks notice. I'm leaving for a role with more design systems work. Keep it gracious, no drama, 180 words max.", "Here's a draft: Dear [Manager], I'm writing to resign from my position, effective [date]. I'm grateful for the last [n] years — especially the chance to ship [project]. I've accepted a role focused on design systems. I'll document handoff this week. Thank you. [Name]"]]
	}),
	chat({
		n: "10",
		title: "Debug Docker Desktop on M2 Mac",
		created: "2026-08-15T21:10:00.000Z",
		category: "Support",
		turns: [["Docker Desktop on my MacBook Pro M2 is stuck on 'starting' after the latest macOS update. VirtioFS, 8 CPU, 8 GB RAM. Any known fix?", "Common after a macOS bump: reset the Docker VM, not the whole app. Quit Docker, then: `rm -rf ~/Library/Group\\ Containers/group.com.docker/settings-store.json` is too aggressive — instead, uncheck VirtioFS, switch to osxfs temporarily, start once, then switch back. Also check that Rosetta is installed if you pull amd64 images. Activity Monitor: if com.docker.virtualization is crashed, reboot once, then 'Troubleshoot → Clean / Purge data' as last resort."]]
	}),
	chat({
		n: "11",
		title: "Safari PWA — Grok in the Dock",
		created: "2026-08-21T18:05:00.000Z",
		category: "Support",
		turns: [["I added Grok to the Dock from Safari on macOS. Is that a real app or a PWA? Can I copy a whole chat out of it?", "It's a Safari web app wrapping grok.com. Copy works like the browser: click in the transcript, Cmd+A, Cmd+C. The sidebar is the same as grok.com. There isn't a bulk export yet, so paste chats one at a time or separate them with a line of --- when you drop them into an organizer."]]
	}),
	chat({
		n: "12",
		title: "Image prompt: misty forest cabin",
		created: "2026-08-08T12:00:00.000Z",
		category: "Creative",
		turns: [["Write a tight image prompt: a misty forest cabin at dusk, warm window light, no people, cinematic, still, 35mm.", "A small timber cabin in a fog-heavy pine forest at dusk, one window glowing warm tungsten, wet ferns in the foreground, 35mm still photograph, shallow depth of field, no people, quiet cinematic color."]]
	}),
	chat({
		n: "13",
		title: "Image prompt misty forest cabin dusk",
		created: "2026-08-08T12:18:00.000Z",
		category: "Creative",
		turns: [["Need another version of the misty forest cabin at dusk prompt. Warm window light, cinematic 35mm, no people.", "Fog between black pines, a cabin with a single lit window, dusk, 35mm, cinematic, no people."]]
	}),
	chat({
		n: "14",
		title: "Meal prep high protein",
		created: "2026-08-09T15:33:00.000Z",
		category: "Lifestyle",
		turns: [["High protein meal prep for a week, I have a job and an M2 laptop, not a lot of kitchen time. No shakes as meals. ~140g protein/day.", "Batch: oven chicken thighs, a pot of lentils, Greek yogurt cups, eggs, and a tray of roasted broccoli. Rotate rice and tortillas. That's four dinners and lunches with almost no weeknight cooking."]]
	}),
	chat({
		n: "15",
		title: "What is the Riemann hypothesis",
		created: "2026-05-20T10:00:00.000Z",
		category: "Research",
		turns: [["What is the Riemann hypothesis, in plain language, and why do people care?", "It's a claim about where the zeros of the Riemann zeta function sit. If it's true, we get a precise map of how prime numbers are spaced. It's one of the Clay Millennium Problems. The interesting part isn't the prize — it's that a lot of number theory is already written in a form that assumes it's true."]]
	}),
	chat({
		n: "16",
		title: "ok",
		created: "2026-07-14T22:11:00.000Z",
		category: "Other",
		turns: [["ok"]]
	}),
	chat({
		n: "17",
		title: "Python pandas merge vs join",
		created: "2026-08-16T17:44:00.000Z",
		category: "Code",
		turns: [["pandas merge vs join — when do I use each? I have two dataframes of user events and I keep duplicating rows.", "join is merge with the index. Prefer merge with explicit on= keys. Duplicated rows mean a many-to-many match — check uniqueness with df.duplicated(subset=['user_id']). Use how='left' and validate='many_to_one' to fail loud."]]
	}),
	chat({
		n: "18",
		title: "History of typefaces — research notes",
		created: "2026-04-03T09:00:00.000Z",
		updated: "2026-04-11T19:20:00.000Z",
		category: "Research",
		pinned: true,
		turns: [["I want a long, structured briefing on the history of typefaces from Gutenberg through Swiss modernism to variable fonts. I care about why certain faces feel 'serious' vs 'friendly', and what to steal for a product UI in 2026.", "Start with blackletter vs roman as cultural signals, then Caslon/Baskerville as Enlightenment clarity, then Didot/Bodoni as fashion, then grotesques (Akzidenz, Helvetica) as industrial neutrality. UI in 2026 still borrows that neutrality, then softens it with optical sizes and humanist grotesks (like Figtree or San Francisco). Serif display is back as a way to not look like every SaaS dashboard. I'll go era by era with examples and a short 'steal this' for each."], ["Go deeper on grotesque vs humanist sans, and where Instrument Serif sits.", "Grotesque: low contrast, closed apertures, 'industrial'. Humanist: some calligraphy in the curves, more friendly. Instrument Serif is a contemporary old-style with sharp digital edges — it reads as editorial, not costume-period. Pair it with a neo-grotesk or geometric-humanist body, keep the serif for titles only."]]
	}),
	chat({
		n: "19",
		title: "Plan a home gym on a budget",
		created: "2026-08-05T06:30:00.000Z",
		category: "Planning",
		turns: [["Home gym on a budget, apartment, MacBook desk in the same room. Don't wreck the floor. Barbell optional.", "Adjustable dumbbells, a compact bench, a pull-up bar if the door frame is solid, and a thick mat. Skip the rack until you have a garage. Program: full body 3x/week."]]
	}),
	chat({
		n: "20",
		title: "Rewrite this email to be warmer",
		created: "2026-08-12T08:10:00.000Z",
		category: "Writing",
		turns: [["Rewrite this email to be warmer but still clear. Original: 'Per my last email, I still need the files by Friday or we will miss the launch.' Don't make it fake-cheerful.", "Hi — circling back on the files. Friday is the last day we can take them and still hit launch. If anything's blocking you, tell me and I'll help. Thanks."]]
	}),
	chat({
		n: "21",
		title: "Rewrite this email more professional",
		created: "2026-08-12T08:16:00.000Z",
		category: "Writing",
		turns: [["Make this email more professional: 'Per my last email, I still need the files by Friday or we will miss the launch.' Warmer too if possible.", "Following up on the files. We need them by Friday to keep the launch date. Happy to help if you're blocked."]]
	}),
	chat({
		n: "22",
		title: "SwiftUI list performance",
		created: "2026-08-17T13:05:00.000Z",
		category: "Code",
		turns: [["SwiftUI List with 2k rows is janky on my M2 Pro. I'm using ForEach with identifiable models. Any real fixes?", "Don't nest heavy views in every row. Use List (UITableView-backed) not a VStack in a ScrollView. Equatable rows, avoid AnyView, and load images lazily. Instruments: look for attribute graph invalidation on each scroll tick."]]
	}),
	chat({
		n: "23",
		title: "Best espresso machine under 500",
		created: "2026-08-06T11:48:00.000Z",
		category: "Lifestyle",
		turns: [["Best espresso machine under $500 for a small kitchen. I already have a decent grinder.", "Look at a used Gaggia Classic or a new Breville Bambino Plus. The grinder matters more than the boiler. Skip capsules if you already grind."]]
	}),
	chat({
		n: "24",
		title: "thanks",
		created: "2026-08-18T14:41:00.000Z",
		category: "Other",
		turns: [["thanks"]]
	}),
	chat({
		n: "25",
		title: "Compare Grok vs ChatGPT for coding",
		created: "2026-08-14T20:00:00.000Z",
		category: "Research",
		turns: [["Compare Grok vs ChatGPT for coding help. I write TypeScript and some Swift. I care about being current and not overly agreeable.", "Grok tends to be more direct and current; ChatGPT is more structured with tools. For TypeScript, both are strong. For 'tell me I'm wrong', Grok is less sycophantic. Use both when the answer is high-stakes."]]
	}),
	chat({
		n: "26",
		title: "Build a habit tracker spec",
		created: "2026-08-13T09:27:00.000Z",
		category: "Planning",
		turns: [["Write a tight product spec for a personal habit tracker. Local first, no account, Mac + phone. I don't want streaks that shame me.", "Entities: Habit, Checkin, Note. Views: today, week, archive. No public social. Streaks optional and muted. Data in local storage with a JSON export. That's the whole v1."]]
	}),
	chat({
		n: "27",
		title: "Vite HMR not updating",
		created: "2026-08-19T16:02:00.000Z",
		category: "Code",
		turns: [["Vite HMR isn't updating a TanStack Start route. I change a component and nothing happens until a full reload. Mac, Node 22.", "Usually a default export mismatch, or the file isn't part of the graph because of a wrong import path. Also check you're not running Vite directly instead of the project's npm run dev wrapper. Full reload on route files can be expected if the route module itself changed."]]
	}),
	chat({
		n: "28",
		title: "Explain quantum entanglement",
		created: "2026-03-22T18:40:00.000Z",
		category: "Learning",
		turns: [["Explain quantum entanglement without the usual pop-science handwaving. I know basic linear algebra.", "A composite system in a state that cannot be written as a tensor product of subsystem states. Measurement correlations are stronger than any local hidden variable model allows (Bell). No faster-than-light signaling: reduced density matrices look mixed, and you can't choose the outcome."]]
	})
];
function bucketFor(chat, analysis, overrides) {
	if (overrides[chat.id]) return overrides[chat.id];
	if (chat.pinned) return "keep";
	if (chat.archived) return "park";
	if (analysis?.deleteSuggestions.some((d) => d.chatId === chat.id)) return "drop";
	if (analysis?.workingSetIds.includes(chat.id)) return "keep";
	return "park";
}
function bucketReason(chat, analysis, bucket) {
	if (bucket === "drop") return analysis?.deleteSuggestions.find((d) => d.chatId === chat.id)?.reason ?? "Marked to delete from Grok.";
	if (bucket === "keep") return chat.pinned ? "Pinned — keep this in the Grok sidebar." : "Working set. Pin it in Grok so it stays at the top.";
	return "Reference thread. Keep it here; you can drop it from Grok’s list.";
}
function groupByBucket(chats, analysis, overrides) {
	const groups = {
		keep: [],
		park: [],
		drop: []
	};
	for (const chat of chats) groups[bucketFor(chat, analysis, overrides)].push(chat);
	return groups;
}
function normalize(chat) {
	return {
		...chat,
		archived: Boolean(chat.archived),
		pinned: Boolean(chat.pinned),
		status: chat.status ?? "active",
		summary: chat.summary || ""
	};
}
function withAnalysis(chats) {
	const next = applyInferredCategories(chats.map(normalize));
	return {
		chats: next,
		analysis: analyzeChats(next)
	};
}
var useChatStore = create()(persist((set, get) => ({
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
		set({
			...withAnalysis(mode === "replace" ? categorized : [...categorized, ...existing]),
			usingDemo: false,
			selectedId: categorized[0]?.id ?? null,
			view: "insights",
			aiAnalysis: null,
			triage: mode === "replace" ? {} : get().triage
		});
	},
	loadDemo: () => set({
		...withAnalysis(DEMO_CHATS),
		usingDemo: true,
		selectedId: DEMO_CHATS[0]?.id ?? null,
		view: "insights",
		aiAnalysis: null,
		grokChecks: {},
		triage: {}
	}),
	clearLibrary: () => set({
		chats: [],
		analysis: analyzeChats([]),
		usingDemo: false,
		selectedId: null,
		aiAnalysis: null,
		grokChecks: {},
		triage: {}
	}),
	removeChats: (ids) => {
		const setIds = new Set(ids);
		const chats = get().chats.map((c) => setIds.has(c.id) ? {
			...c,
			status: "removed"
		} : c);
		const selectedId = setIds.has(get().selectedId ?? "") ? chats.find((c) => c.status === "active")?.id ?? null : get().selectedId;
		const triage = { ...get().triage };
		for (const id of ids) delete triage[id];
		set({
			...withAnalysis(chats),
			selectedId,
			triage
		});
	},
	restoreChat: (id) => {
		set(withAnalysis(get().chats.map((c) => c.id === id && c.status === "removed" ? {
			...c,
			status: "active"
		} : c)));
	},
	mergeChats: (ids, title) => {
		const setIds = new Set(ids);
		const sources = get().chats.filter((c) => setIds.has(c.id) && c.status === "active").sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		if (sources.length < 2) return;
		const messages = sources.flatMap((c) => c.messages);
		const merged = {
			id: newId("c"),
			title: title?.trim() || `Merged · ${sources[0].title}`,
			createdAt: sources[0].createdAt,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			messages,
			source: "merged",
			status: "active",
			category: sources[0].category,
			pinned: sources.some((c) => c.pinned),
			archived: false,
			summary: sources.map((c) => c.summary).join(" · ").slice(0, 220),
			mergedFrom: sources.map((c) => c.id)
		};
		const chats = [merged, ...get().chats.map((c) => setIds.has(c.id) ? {
			...c,
			status: "merged"
		} : c)];
		const triage = { ...get().triage };
		for (const id of ids) delete triage[id];
		set({
			...withAnalysis(chats),
			selectedId: merged.id,
			view: "library",
			triage
		});
	},
	recategorize: (id, category) => {
		set(withAnalysis(get().chats.map((c) => c.id === id ? {
			...c,
			category
		} : c)));
	},
	togglePin: (id) => {
		set(withAnalysis(get().chats.map((c) => c.id === id ? {
			...c,
			pinned: !c.pinned,
			archived: c.pinned ? c.archived : false
		} : c)));
	},
	pinWorkingSet: () => {
		const ids = new Set(get().analysis?.workingSetIds ?? []);
		if (!ids.size) return;
		set(withAnalysis(get().chats.map((c) => ids.has(c.id) ? {
			...c,
			pinned: true,
			archived: false
		} : c)));
	},
	setArchived: (ids, archived) => {
		const setIds = new Set(ids);
		set(withAnalysis(get().chats.map((c) => setIds.has(c.id) ? {
			...c,
			archived,
			pinned: archived ? false : c.pinned
		} : c)));
	},
	applyRenames: (ids) => {
		const suggestions = get().analysis?.renameSuggestions ?? [];
		const want = ids ? new Set(ids) : new Set(suggestions.map((s) => s.chatId));
		const map = new Map(suggestions.filter((s) => want.has(s.chatId)).map((s) => [s.chatId, s.suggested]));
		if (!map.size) return;
		set(withAnalysis(get().chats.map((c) => map.has(c.id) ? {
			...c,
			title: map.get(c.id)
		} : c)));
	},
	setAiAnalysis: (aiAnalysis) => set({ aiAnalysis }),
	applyAiSummaries: () => {
		const ai = get().aiAnalysis;
		if (!ai) return;
		const sum = new Map(ai.summaries.map((s) => [s.chatId, s.summary]));
		const cat = new Map(ai.recategorizations.map((s) => [s.chatId, s.category]));
		set(withAnalysis(get().chats.map((c) => ({
			...c,
			summary: sum.get(c.id) ?? c.summary,
			category: cat.get(c.id) ?? c.category
		}))));
	},
	patchSummary: (id, summary) => {
		set(withAnalysis(get().chats.map((c) => c.id === id ? {
			...c,
			summary
		} : c)));
	},
	toggleGrokCheck: (key) => set({ grokChecks: {
		...get().grokChecks,
		[key]: !get().grokChecks[key]
	} }),
	setTriage: (id, bucket) => set({ triage: {
		...get().triage,
		[id]: bucket
	} }),
	applyTriagePlan: () => {
		const { chats, analysis, triage } = get();
		const next = chats.map((c) => {
			if (c.status !== "active") return c;
			const bucket = bucketFor(c, analysis, triage);
			if (bucket === "drop") return {
				...c,
				status: "removed"
			};
			if (bucket === "keep") return {
				...c,
				pinned: true,
				archived: false
			};
			return {
				...c,
				archived: true,
				pinned: false
			};
		});
		const selectedId = next.find((c) => c.id === get().selectedId && c.status === "active")?.id ?? next.find((c) => c.status === "active")?.id ?? null;
		set({
			...withAnalysis(next),
			triage: {},
			selectedId
		});
	}
}), {
	name: "sift-library-v1",
	partialize: (s) => ({
		chats: s.chats,
		usingDemo: s.usingDemo,
		grokChecks: s.grokChecks,
		aiAnalysis: s.aiAnalysis,
		selectedId: s.selectedId,
		triage: s.triage
	}),
	skipHydration: true
}));
function activeChats(chats) {
	return chats.filter((c) => c.status === "active");
}
var NAV = [
	{
		id: "insights",
		label: "Insights",
		icon: Layers
	},
	{
		id: "library",
		label: "Library",
		icon: Library
	},
	{
		id: "cleanup",
		label: "Cleanup",
		icon: FolderOpen
	},
	{
		id: "import",
		label: "Import",
		icon: Upload
	}
];
function Wordmark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-8 items-center justify-center rounded-sm border border-border bg-card",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 32 32",
				className: "size-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "4",
						y: "8",
						width: "24",
						height: "3",
						rx: "0.5",
						fill: "currentColor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "8",
						y: "14.5",
						width: "20",
						height: "3",
						rx: "0.5",
						fill: "currentColor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "4",
						y: "21",
						width: "16",
						height: "3",
						rx: "0.5",
						fill: "currentColor"
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-2xl leading-none tracking-tight",
			children: "Sift"
		})]
	});
}
function AppShell({ children, actions }) {
	const view = useChatStore((s) => s.view);
	const setView = useChatStore((s) => s.setView);
	const usingDemo = useChatStore((s) => s.usingDemo);
	const chats = useChatStore((s) => s.chats);
	const deleteCount = useChatStore((s) => s.analysis)?.deleteSuggestions.length ?? 0;
	const activeCount = activeChats(chats).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col overflow-x-hidden bg-background text-foreground lg:flex-row",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden w-56 shrink-0 flex-col border-r border-border px-4 py-6 lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-relaxed text-muted-foreground",
						children: "Your Grok chats, sorted."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-8 flex flex-col gap-1",
						"aria-label": "Main",
						children: NAV.map((item) => {
							const Icon = item.icon;
							const active = view === item.id;
							const badge = item.id === "cleanup" && deleteCount > 0 ? deleteCount : item.id === "library" ? activeCount : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setView(item.id),
								className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150", active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										strokeWidth: 1.75
									}),
									item.label,
									badge > 0 && item.id !== "insights" && item.id !== "import" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto text-xs tabular-nums text-subtle",
										children: badge
									})
								]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-auto pt-8 text-xs leading-relaxed text-subtle",
						children: "Sift keeps a local copy. It cannot delete chats on grok.com — it writes the plan you run there."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:px-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "lg:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden min-w-0 lg:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-wide text-muted-foreground uppercase",
									children: NAV.find((n) => n.id === view)?.label
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-2",
								children: actions
							})
						]
					}),
					usingDemo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-2.5 text-sm text-muted-foreground lg:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sample Grok library so you can try analysis now. Import your own chats to replace it." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setView("import"),
							className: "text-sm font-medium text-foreground underline-offset-4 hover:underline",
							children: "Import"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 pb-24 lg:pb-0",
						children
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 lg:hidden",
				style: { paddingBottom: "env(safe-area-inset-bottom)" },
				"aria-label": "Main",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4",
					children: NAV.map((item) => {
						const Icon = item.icon;
						const active = view === item.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setView(item.id),
							className: cn("relative flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium", active ? "text-foreground" : "text-muted-foreground"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4",
									strokeWidth: 1.75
								}),
								item.label,
								item.id === "cleanup" && deleteCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 right-[calc(50%-18px)] size-1.5 rounded-full bg-silver" })
							]
						}, item.id);
					})
				})
			})
		]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-muted text-muted-foreground",
		outline: "border-border text-muted-foreground",
		keep: "border-transparent bg-keep/15 text-keep",
		warn: "border-transparent bg-warn/15 text-warn",
		danger: "border-transparent bg-destructive/15 text-destructive",
		silver: "border-transparent bg-silver/15 text-silver"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,opacity,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
			outline: "border border-border bg-transparent hover:bg-accent",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			link: "text-silver underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-lg px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("peer size-5 shrink-0 rounded-xs border border-border bg-card shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: "flex items-center justify-center text-current",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-3.5",
			strokeWidth: 2.5
		})
	})
}));
Checkbox.displayName = "Checkbox";
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-11 items-center gap-1 rounded-lg bg-muted p-1", className),
	...props
}));
TabsList.displayName = "TabsList";
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 data-[state=active]:bg-card data-[state=active]:text-foreground", className),
	...props
}));
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-4 focus-visible:outline-none", className),
	...props
}));
TabsContent.displayName = "TabsContent";
function relDate(iso) {
	try {
		return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
	} catch {
		return "";
	}
}
function msgLabel(n) {
	return n === 1 ? "1 message" : `${n} messages`;
}
function flagsFor(chat, analysis) {
	if (!analysis) return [];
	const out = [];
	if (chat.pinned) out.push("pinned");
	if (chat.archived) out.push("parked");
	if (analysis.clutterIds.includes(chat.id)) out.push("clutter");
	if (analysis.duplicateGroups.some((g) => g.chatIds.includes(chat.id) && g.keepId !== chat.id)) out.push("duplicate");
	else if (analysis.duplicateGroups.some((g) => g.keepId === chat.id && g.chatIds.length > 1)) out.push("canonical");
	if (analysis.workingSetIds.includes(chat.id)) out.push("working");
	return out;
}
function downloadText(filename, text, type = "text/plain") {
	const blob = new Blob([text], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function CleanupView() {
	const chats = useChatStore((s) => s.chats);
	const analysis = useChatStore((s) => s.analysis);
	const ai = useChatStore((s) => s.aiAnalysis);
	const removeChats = useChatStore((s) => s.removeChats);
	const mergeChats = useChatStore((s) => s.mergeChats);
	const restoreChat = useChatStore((s) => s.restoreChat);
	const grokChecks = useChatStore((s) => s.grokChecks);
	const toggleGrokCheck = useChatStore((s) => s.toggleGrokCheck);
	const pinWorkingSet = useChatStore((s) => s.pinWorkingSet);
	const applyRenames = useChatStore((s) => s.applyRenames);
	const cleanupTab = useChatStore((s) => s.cleanupTab);
	const setCleanupTab = useChatStore((s) => s.setCleanupTab);
	const byId = (0, import_react.useMemo)(() => new Map(chats.map((c) => [c.id, c])), [chats]);
	const active = activeChats(chats);
	const removed = chats.filter((c) => c.status === "removed");
	const [deleteSel, setDeleteSel] = (0, import_react.useState)({});
	const [mergeSel, setMergeSel] = (0, import_react.useState)({});
	const [renameSel, setRenameSel] = (0, import_react.useState)({});
	const deletes = analysis?.deleteSuggestions ?? [];
	const merges = analysis?.mergeSuggestions ?? [];
	const renames = analysis?.renameSuggestions ?? [];
	const extraDeletes = (ai?.extraDeletes ?? []).filter((d) => !deletes.some((x) => x.chatId === d.chatId));
	function toggle(map, set, id) {
		set({
			...map,
			[id]: !map[id]
		});
	}
	function applyDeletes() {
		const ids = Object.entries(deleteSel).filter(([, v]) => v).map(([k]) => k);
		if (!ids.length) {
			toast.message("Select at least one chat to remove from Sift.");
			return;
		}
		removeChats(ids);
		toast.success(`Removed ${ids.length} from Sift. Still delete them in Grok.`);
		setDeleteSel({});
	}
	function applyMerges() {
		const groups = merges.filter((m) => mergeSel[m.id]);
		if (!groups.length) {
			toast.message("Select a merge group first.");
			return;
		}
		for (const g of groups) mergeChats(g.chatIds, g.title);
		toast.success("Merged locally. In Grok, keep one thread and delete the extras.");
		setMergeSel({});
	}
	function copyTitles(ids) {
		const titles = ids.map((id) => byId.get(id)?.title).filter(Boolean).join("\n");
		navigator.clipboard.writeText(titles);
		toast.success("Titles copied — search them in Grok’s sidebar.");
	}
	function exportPlan() {
		if (!analysis) return;
		downloadText("sift-grok-cleanup.md", formatChecklist(chats, analysis), "text/markdown");
		toast.success("Checklist downloaded.");
	}
	const grokItems = deletes.length + merges.length;
	const grokDone = Object.values(grokChecks).filter(Boolean).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl leading-tight tracking-tight",
					children: "Cleanup plan"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: "Sift can merge and hide chats in this library. Deleting on grok.com is still on you — use the checklist, then tick items as you finish them in the browser or the Grok Mac app."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: exportPlan,
						disabled: !analysis,
						children: "Download checklist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => copyTitles(deletes.map((d) => d.chatId)),
						disabled: !deletes.length,
						children: "Copy delete titles"
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: cleanupTab,
				onValueChange: (v) => setCleanupTab(v),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full justify-start overflow-x-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "delete",
								children: "Delete"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "merge",
								children: "Merge"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "organize",
								children: "Organize"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "grok",
								children: "Do this in Grok"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "delete",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => {
										const next = {};
										for (const d of deletes) if (d.severity === "clutter") next[d.chatId] = true;
										setDeleteSel(next);
									},
									children: "Select clutter"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => {
										const next = {};
										for (const d of deletes) next[d.chatId] = true;
										setDeleteSel(next);
									},
									children: "Select all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "space-y-2",
								children: [
									deletes.map((d) => {
										const chat = byId.get(d.chatId);
										if (!chat || chat.status !== "active") return null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-3 rounded-xl border border-border px-4 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked: Boolean(deleteSel[d.chatId]),
												onCheckedChange: () => toggle(deleteSel, setDeleteSel, d.chatId),
												className: "mt-0.5",
												"aria-label": `Select ${chat.title}`
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-wrap items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-sm font-medium",
														children: chat.title
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: d.severity === "clutter" ? "danger" : d.severity === "duplicate" ? "warn" : "outline",
														children: d.severity
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-sm text-muted-foreground",
													children: d.reason
												})]
											})]
										}, d.chatId);
									}),
									extraDeletes.map((d) => {
										const chat = byId.get(d.chatId);
										if (!chat || chat.status !== "active") return null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-3 rounded-xl border border-border px-4 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked: Boolean(deleteSel[d.chatId]),
												onCheckedChange: () => toggle(deleteSel, setDeleteSel, d.chatId),
												className: "mt-0.5"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-medium",
													children: chat.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "silver",
													children: "Grok"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm text-muted-foreground",
												children: d.reason
											})] })]
										}, `ai-${d.chatId}`);
									}),
									!deletes.length && !extraDeletes.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "text-sm text-muted-foreground",
										children: "No delete suggestions. Lucky you."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								onClick: applyDeletes,
								children: "Remove selected from Sift"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "merge",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "space-y-3",
							children: [
								merges.map((m) => {
									const titles = m.chatIds.map((id) => byId.get(id)).filter((c) => c && c.status === "active");
									if (titles.length < 2) return null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "rounded-xl border border-border px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-start gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked: Boolean(mergeSel[m.id]),
												onCheckedChange: () => toggle(mergeSel, setMergeSel, m.id),
												className: "mt-0.5"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-sm font-medium",
													children: m.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-1 block text-sm text-muted-foreground",
													children: m.reason
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-2 flex flex-wrap gap-1.5",
													children: titles.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														children: c.title
													}, c.id))
												})
											] })]
										})
									}, m.id);
								}),
								(ai?.extraMerges ?? []).map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-xl border border-dashed border-border px-4 py-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: m.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: m.reason
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											className: "mt-3",
											size: "sm",
											variant: "outline",
											onClick: () => mergeChats(m.chatIds, m.title),
											children: "Merge this group"
										})
									]
								}, `ai-m-${i}`)),
								!merges.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "text-sm text-muted-foreground",
									children: "No merge groups right now."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							onClick: applyMerges,
							children: "Merge selected in Sift"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "organize",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-3",
								children: (analysis?.orgSuggestions ?? []).map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-xl border border-border bg-card px-4 py-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground tabular-nums",
											children: String(i + 1).padStart(2, "0")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-1 text-sm font-medium",
											children: o.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
											children: o.detail
										})
									]
								}, o.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 rounded-xl border border-border px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: "Working set to keep in Grok"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											pinWorkingSet();
											toast.success("Pinned the working set in Sift. Pin the same titles in Grok.");
										},
										children: "Pin these here"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-1.5",
									children: (analysis?.workingSetIds ?? []).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "text-sm",
										children: byId.get(id)?.title
									}, id))
								})]
							}),
							renames.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 rounded-xl border border-border px-4 py-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: "Rename suggestions"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: "Topic first, so the Grok sidebar scans in one glance."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-3 space-y-2",
										children: renames.map((r) => {
											const chat = byId.get(r.chatId);
											if (!chat || chat.status !== "active") return null;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-start gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
													checked: Boolean(renameSel[r.chatId]),
													onCheckedChange: () => toggle(renameSel, setRenameSel, r.chatId),
													className: "mt-0.5"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0 text-sm",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-muted-foreground line-through",
														children: chat.title
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-medium",
														children: r.suggested
													})]
												})]
											}, r.chatId);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-4",
										size: "sm",
										onClick: () => {
											const ids = Object.entries(renameSel).filter(([, v]) => v).map(([k]) => k);
											if (!ids.length) {
												applyRenames();
												toast.success("Applied all suggested names in Sift.");
											} else {
												applyRenames(ids);
												toast.success("Renamed in Sift. Mirror the names in Grok.");
											}
											setRenameSel({});
										},
										children: "Apply names in Sift"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "grok",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: ["Tick these as you finish them in grok.com or the Dock app. They stay on this device.", grokItems > 0 ? ` ${Math.min(grokDone, grokItems)} of ${grokItems} done.` : ""]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-4 space-y-2",
							children: [
								deletes.map((d) => {
									const chat = byId.get(d.chatId);
									if (!chat) return null;
									const key = `del-${d.chatId}`;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-start gap-3 rounded-xl border border-border px-4 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: Boolean(grokChecks[key]),
											onCheckedChange: () => toggleGrokCheck(key),
											className: "mt-0.5"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("text-sm", grokChecks[key] && "text-muted-foreground line-through"),
											children: ["Delete in Grok: ", chat.title]
										})]
									}) }, key);
								}),
								merges.map((m) => {
									const key = `merge-${m.id}`;
									const titles = m.chatIds.map((id) => byId.get(id)?.title).filter(Boolean).join(" + ");
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-start gap-3 rounded-xl border border-border px-4 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: Boolean(grokChecks[key]),
											onCheckedChange: () => toggleGrokCheck(key),
											className: "mt-0.5"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("text-sm", grokChecks[key] && "text-muted-foreground line-through"),
											children: ["Collapse in Grok: ", titles]
										})]
									}) }, key);
								}),
								renames.slice(0, 8).map((r) => {
									const chat = byId.get(r.chatId);
									if (!chat) return null;
									const key = `ren-${r.chatId}`;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-start gap-3 rounded-xl border border-border px-4 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: Boolean(grokChecks[key]),
											onCheckedChange: () => toggleGrokCheck(key),
											className: "mt-0.5"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("text-sm", grokChecks[key] && "text-muted-foreground line-through"),
											children: [
												"Rename in Grok: ",
												chat.title,
												" → ",
												r.suggested
											]
										})]
									}) }, key);
								})
							]
						})]
					})
				]
			}),
			removed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Removed from Sift"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1",
				children: removed.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: c.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => restoreChat(c.id),
						children: "Restore"
					})]
				}, c.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-subtle",
				children: [
					active.length,
					" active in this library",
					analysis ? ` · ${deletes.length} suggested deletes · ${merges.length} merge groups` : ""
				]
			})
		]
	});
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	className: cn("flex min-h-40 w-full rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Textarea.displayName = "Textarea";
var PREFERRED_JSON = /(prod-grok-backend|conversations|chats|grok).*\.json$/i;
function isZip(file) {
	return file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed";
}
async function textsFromZip(file) {
	const zip = await import_lib.default.loadAsync(await file.arrayBuffer());
	const jsonEntries = Object.values(zip.files).filter((f) => !f.dir && /\.json$/i.test(f.name));
	const preferred = jsonEntries.filter((f) => PREFERRED_JSON.test(f.name));
	const pick = preferred.length ? preferred : jsonEntries;
	if (pick.length) {
		const chunks = [];
		for (const entry of pick.slice(0, 8)) chunks.push(await entry.async("string"));
		return chunks;
	}
	const textEntries = Object.values(zip.files).filter((f) => !f.dir && /\.(txt|md|markdown)$/i.test(f.name));
	const chunks = [];
	for (const entry of textEntries.slice(0, 20)) chunks.push(await entry.async("string"));
	return chunks;
}
function parseImportMany(texts, mode) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const text of texts) for (const chat of parseImport(text, mode)) {
		const key = `${chat.title}::${chat.messages[0]?.content.slice(0, 80) ?? ""}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(chat);
		if (out.length >= 500) return out;
	}
	return out;
}
async function parseFiles(files, mode) {
	const texts = [];
	for (const file of files) if (isZip(file)) texts.push(...await textsFromZip(file));
	else texts.push(await file.text());
	return parseImportMany(texts, mode);
}
var MODES = [
	{
		id: "auto",
		label: "Auto",
		hint: "Detect JSON, ZIP export, transcripts, or a title list"
	},
	{
		id: "titles",
		label: "Sidebar titles",
		hint: "One chat name per line, copied from Grok’s list"
	},
	{
		id: "transcripts",
		label: "Full chats",
		hint: "Paste threads with You / Grok labels"
	}
];
function ImportView() {
	const importChats = useChatStore((s) => s.importChats);
	const loadDemo = useChatStore((s) => s.loadDemo);
	const clearLibrary = useChatStore((s) => s.clearLibrary);
	const usingDemo = useChatStore((s) => s.usingDemo);
	const chats = useChatStore((s) => s.chats);
	const [text, setText] = (0, import_react.useState)("");
	const [drag, setDrag] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("auto");
	const [busy, setBusy] = (0, import_react.useState)(false);
	function ingestText(raw, write) {
		const parsed = parseImport(raw, mode);
		if (!parsed.length) {
			toast.error("Couldn’t find a chat in that paste. Drop an xAI export ZIP, add You/Grok labels, or switch to sidebar titles.");
			return;
		}
		importChats(parsed, write);
		setText("");
		toast.success(write === "replace" ? `Replaced library with ${parsed.length} chats.` : `Added ${parsed.length} chats.`);
	}
	async function ingestFiles(files, write) {
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
			messages: c.messages.map((m) => ({
				role: m.role,
				content: m.content
			}))
		}));
		downloadText("sift-library.json", JSON.stringify(payload, null, 2), "application/json");
		toast.success("Library JSON downloaded.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl leading-tight tracking-tight",
				children: "Bring chats in"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted-foreground",
				children: "Sift cannot see grok.com or the Grok app on your Mac. Import an official xAI export, or copy from the sidebar — Safari, Chrome, or the Dock app you added from Safari. Everything stays on this device."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Best: official xAI export"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: "1. Request your data."
						}),
						" On this Mac open",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "accounts.x.ai/data"
						}),
						" (or grok.com → Settings → Data) and download the ZIP."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: "2. Drop the ZIP below."
						}),
						" Sift reads",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "prod-grok-backend.json"
						}),
						" and other conversation JSON inside. Caps at 500 chats so this device stays snappy."
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Faster: copy from the Grok sidebar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: "1. Open Grok."
						}), " grok.com in Safari or Chrome, or the Grok app from Safari (File → Add to Dock). Same sidebar either way."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: "2. Copy titles or a thread."
						}), " Click the sidebar, Cmd+A, Cmd+C — that’s a title list. Deeper: open a chat, click in the messages, Cmd+A, Cmd+C."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: "3. Paste below."
						}), " Several full chats: put a line with only --- between them."] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode(m.id),
					className: cn("rounded-lg border px-3 py-2 text-left transition-colors duration-150", mode === m.id ? "border-silver/40 bg-card" : "border-border hover:bg-card/80"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: m.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-xs text-muted-foreground",
						children: m.hint
					})]
				}, m.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("rounded-xl border border-dashed px-4 py-6 transition-colors duration-150", drag ? "border-silver bg-card" : "border-border"),
				onDragOver: (e) => {
					e.preventDefault();
					setDrag(true);
				},
				onDragLeave: () => setDrag(false),
				onDrop: (e) => {
					e.preventDefault();
					setDrag(false);
					ingestFiles(e.dataTransfer.files, usingDemo ? "replace" : "append");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: text,
						onChange: (e) => setText(e.target.value),
						placeholder: mode === "titles" ? "Fix TypeScript error in React Query\nWeekend in Kyoto itinerary\nhi\ntest" : `You\nHow do I type useQuery in React Query v5?\n\nGrok\nPass a generic…\n\n---\n\nYou\nhi`,
						"aria-label": "Paste Grok chats"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-subtle",
						children: "Or drop a .zip, .json, .txt, or .md file onto this panel."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => ingestText(text, usingDemo ? "replace" : "append"),
								disabled: !text.trim() || busy,
								children: usingDemo ? "Replace sample with paste" : "Add to library"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => ingestText(text, "replace"),
								disabled: !text.trim() || busy,
								children: "Replace library"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".txt,.md,.json,.zip,.markdown,text/plain,application/json,application/zip",
									multiple: true,
									className: "sr-only",
									onChange: (e) => {
										ingestFiles(e.target.files, usingDemo ? "replace" : "append");
										e.target.value = "";
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent",
									children: busy ? "Reading…" : "Choose files"
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => loadDemo(),
						children: "Load sample library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: exportLibrary,
						disabled: !chats.length,
						children: "Export JSON"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => clearLibrary(),
						children: "Clear library"
					})
				]
			})
		]
	});
}
var COLUMNS = [
	{
		id: "keep",
		label: "Keep in Grok",
		hint: "Short working set in the sidebar"
	},
	{
		id: "park",
		label: "Park in Sift",
		hint: "Reference only — drop from Grok"
	},
	{
		id: "drop",
		label: "Delete",
		hint: "Clutter, weaker copies, stale one-offs"
	}
];
function TriageBoard() {
	const chats = useChatStore((s) => s.chats);
	const analysis = useChatStore((s) => s.analysis);
	const triage = useChatStore((s) => s.triage);
	const setTriage = useChatStore((s) => s.setTriage);
	const applyTriagePlan = useChatStore((s) => s.applyTriagePlan);
	const select = useChatStore((s) => s.select);
	const setView = useChatStore((s) => s.setView);
	const groups = groupByBucket(activeChats(chats), analysis, triage);
	const dirty = Object.keys(triage).length > 0;
	function apply() {
		applyTriagePlan();
		toast.success("Applied in Sift. Tick the same titles in Grok’s sidebar.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Hybrid triage"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground",
				children: "A short list lives in grok.com or the Safari Dock app. The rest stays here. Delete the noise so both places can breathe."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: apply,
				variant: dirty ? "default" : "outline",
				children: "Apply plan in Sift"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 grid gap-3 lg:grid-cols-3",
			children: COLUMNS.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-muted/70 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-2 px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: col.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs tabular-nums text-subtle",
							children: groups[col.id].length
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 px-1 text-xs text-muted-foreground",
						children: col.hint
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 max-h-80 space-y-2 overflow-y-auto",
						children: groups[col.id].length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "px-1 py-6 text-center text-xs text-subtle",
							children: "Nothing here."
						}) : groups[col.id].map((chat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriageCard, {
							chat,
							bucket: col.id,
							reason: bucketReason(chat, analysis, bucketFor(chat, analysis, triage)),
							onMove: setTriage,
							onOpen: () => {
								select(chat.id);
								setView("library");
							}
						}, chat.id))
					})
				]
			}, col.id))
		})]
	});
}
function TriageCard({ chat, bucket, reason, onMove, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-md border border-border bg-card px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onOpen,
			className: "w-full text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-snug font-medium",
				children: chat.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground",
				children: reason
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex flex-wrap gap-1",
			children: COLUMNS.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onMove(chat.id, col.id),
				className: cn("h-9 rounded-sm px-2.5 text-xs font-medium transition-colors duration-150", bucket === col.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"),
				children: col.id === "keep" ? "Keep" : col.id === "park" ? "Park" : "Delete"
			}, col.id))
		})]
	});
}
function InsightsView() {
	const chats = useChatStore((s) => s.chats);
	const analysis = useChatStore((s) => s.analysis);
	const ai = useChatStore((s) => s.aiAnalysis);
	const select = useChatStore((s) => s.select);
	const setView = useChatStore((s) => s.setView);
	const setFlagFilter = useChatStore((s) => s.setFlagFilter);
	const setQuery = useChatStore((s) => s.setQuery);
	const setCleanupTab = useChatStore((s) => s.setCleanupTab);
	const setCategoryFilter = useChatStore((s) => s.setCategoryFilter);
	const active = activeChats(chats);
	const byCat = CATEGORIES.map((cat) => ({
		name: cat,
		count: active.filter((c) => c.category === cat).length
	})).filter((d) => d.count > 0);
	const deletes = analysis?.deleteSuggestions.length ?? 0;
	const merges = analysis?.mergeSuggestions.length ?? 0;
	const repeats = analysis?.duplicateGroups.length ?? 0;
	const clutter = analysis?.clutterIds.length ?? 0;
	const working = analysis?.workingSetIds.length ?? 0;
	const archive = analysis?.archiveIds.length ?? 0;
	function openCleanup(tab) {
		setCleanupTab(tab);
		setView("cleanup");
	}
	function openLibrary(flag, query = "") {
		setFlagFilter(flag);
		setCategoryFilter("All");
		setQuery(query);
		setView("library");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted-foreground uppercase",
					children: "Analysis"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-2 text-4xl leading-tight tracking-tight",
					children: active.length === 0 ? "Import a library to sift it." : `${deletes} to delete, ${merges} to merge, ${working} to keep in Grok.`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground",
					children: "Local analysis runs on this device: summaries, topics, repeats, clutter. Ask Grok for a deeper pass when you want rewritten summaries and a sharper hybrid plan — a small working set in the Grok sidebar, the rest archived here."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
						label: "Delete",
						value: deletes,
						hint: "Clutter, weaker copies, stale one-offs",
						onClick: () => openCleanup("delete")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
						label: "Merge",
						value: merges,
						hint: "Same question, split across threads",
						onClick: () => openCleanup("merge")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
						label: "Repeats",
						value: repeats,
						hint: "Clusters circling the same ground",
						onClick: () => openLibrary("duplicates")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
						label: "Working set",
						value: working,
						hint: `${archive} more to park here`,
						onClick: () => openCleanup("organize")
					})
				]
			}),
			active.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriageBoard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "How to run this on a Mac"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground",
						children: [
							"Keep ",
							working,
							" live in grok.com or the Grok app you added from Safari. Park ",
							archive,
							" reference threads in Sift. Clear ",
							clutter,
							" clutter so the sidebar can breathe."
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => openCleanup("organize"),
						children: "Open the checklist"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-5 grid gap-3 md:grid-cols-2",
					children: (analysis?.orgSuggestions ?? []).map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg bg-muted/70 px-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground tabular-nums",
								children: [
									String(i + 1).padStart(2, "0"),
									" · ",
									o.kind
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-1 text-sm font-medium",
								children: o.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
								children: o.detail
							})
						]
					}, o.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Repeat topics"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2",
				children: [(analysis?.repeatTopics ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => openLibrary("all", t.label),
					className: "flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left transition-colors duration-150 hover:bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: t.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [t.chatIds.length, " chats circling the same ground"]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: t.category
					})]
				}) }, t.label)), !analysis?.repeatTopics.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted-foreground",
					children: "No repeated topics yet."
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "By topic"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 h-56",
					children: byCat.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: byCat,
							margin: {
								top: 8,
								right: 8,
								left: -18,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									allowDecimals: false,
									tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									cursor: { fill: "var(--color-muted)" },
									contentStyle: {
										background: "var(--color-popover)",
										border: "1px solid var(--color-border)",
										borderRadius: 8,
										color: "var(--color-foreground)",
										fontSize: 12
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "count",
									fill: "var(--color-silver)",
									radius: [
										4,
										4,
										0,
										0
									]
								})
							]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Import chats to see a breakdown."
					})
				})]
			}),
			ai ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-silver uppercase",
						children: "Grok deep pass"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed",
						children: ai.overview
					}),
					ai.hybridPlan.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2",
						children: ai.hybridPlan.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted-foreground",
							children: line
						}, line))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-3 md:grid-cols-2",
						children: ai.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-lg bg-muted/70 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium",
								children: n.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: n.body
							})]
						}, n.title))
					}),
					ai.summaries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: "Summaries"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2",
							children: ai.summaries.map((s) => {
								const chat = chats.find((c) => c.id === s.chatId);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: cn("w-full rounded-lg border border-border px-4 py-3 text-left hover:bg-accent/50"),
									onClick: () => {
										select(s.chatId);
										setView("library");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: chat?.title ?? s.chatId
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: s.summary
									})]
								}) }, s.chatId);
							})
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Run “Ask Grok” in the header for summaries, recategorization, and a sharper hybrid plan. Local findings above already cover duplicates, clutter, and the working set."
			})
		]
	});
}
function ActionCard({ label, value, hint, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors duration-150 hover:border-silver/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-muted-foreground uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-3xl tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-relaxed text-subtle",
				children: hint
			})
		]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
		className: "h-full w-full rounded-[inherit]",
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
		orientation: "vertical",
		className: "flex w-2.5 touch-none p-px transition-colors",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
	})]
}));
ScrollArea.displayName = "ScrollArea";
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
	...props
}));
Separator.displayName = "Separator";
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var deepAnalyze = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.chats)) throw new Error("Expected { chats: CompactChat[] }");
	return { chats: input.chats.slice(0, 40) };
}).handler(createSsrRpc("4c74e8a94d8aae636bcade95623a140d5a7e1dc8f3b029d6d38a6d8997ff5797"));
var summarizeChat = createServerFn({ method: "POST" }).validator((input) => ({
	title: String(input.title ?? "").slice(0, 200),
	transcript: String(input.transcript ?? "").slice(0, 6e3)
})).handler(createSsrRpc("e1af770be22146b2339e3b0bb28511ea191fb1384e8d184462f2eed77745cf41"));
function flagBadge(flag) {
	if (flag === "clutter") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "danger",
		children: "clutter"
	});
	if (flag === "duplicate") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "warn",
		children: "repeat"
	});
	if (flag === "canonical") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "keep",
		children: "keep"
	});
	if (flag === "pinned") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "silver",
		children: "pinned"
	});
	if (flag === "parked") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		children: "parked"
	});
	if (flag === "working") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		children: "working set"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: flag });
}
function LibraryView() {
	const chats = useChatStore((s) => s.chats);
	const analysis = useChatStore((s) => s.analysis);
	const selectedId = useChatStore((s) => s.selectedId);
	const select = useChatStore((s) => s.select);
	const query = useChatStore((s) => s.query);
	const setQuery = useChatStore((s) => s.setQuery);
	const categoryFilter = useChatStore((s) => s.categoryFilter);
	const setCategoryFilter = useChatStore((s) => s.setCategoryFilter);
	const flagFilter = useChatStore((s) => s.flagFilter);
	const setFlagFilter = useChatStore((s) => s.setFlagFilter);
	const active = activeChats(chats);
	const selected = chats.find((c) => c.id === selectedId && c.status === "active") ?? null;
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return active.filter((c) => categoryFilter === "All" ? true : c.category === categoryFilter).filter((c) => {
			if (flagFilter === "pinned") return c.pinned;
			if (flagFilter === "archived") return c.archived;
			if (flagFilter === "clutter") return analysis?.clutterIds.includes(c.id);
			if (flagFilter === "duplicates") return analysis?.duplicateGroups.some((g) => g.chatIds.includes(c.id));
			return true;
		}).filter((c) => {
			if (!q) return true;
			return `${c.title} ${c.summary} ${c.category} ${c.messages.map((m) => m.content).join(" ")}`.toLowerCase().includes(q);
		}).sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt));
	}, [
		active,
		analysis,
		categoryFilter,
		flagFilter,
		query
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "min-w-0 px-4 py-5 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-4 text-sm text-muted-foreground",
					children: [
						active.length,
						" chats",
						analysis ? ` · ${analysis.clutterIds.length} clutter · ${analysis.duplicateGroups.length} repeat clusters` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Search titles and summaries",
						className: "pl-10",
						"aria-label": "Search chats"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex gap-2 overflow-x-auto pb-1",
					children: ["All", ...CATEGORIES].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCategoryFilter(cat),
						className: cn("h-9 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors duration-150", categoryFilter === cat ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
						children: cat
					}, cat))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex gap-2",
					children: [
						["all", "All"],
						["duplicates", "Repeats"],
						["clutter", "Clutter"],
						["pinned", "Pinned"],
						["archived", "Parked"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFlagFilter(id),
						className: cn("h-9 rounded-md px-3 text-xs font-medium transition-colors duration-150", flagFilter === id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"),
						children: label
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 space-y-2",
					children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground",
						children: "Nothing matches. Import chats or clear filters."
					}) : filtered.map((chat) => {
						const flags = flagsFor(chat, analysis);
						const on = selectedId === chat.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => select(chat.id),
							className: cn("w-full rounded-xl border px-4 py-3.5 text-left transition-colors duration-150", on ? "border-silver/40 bg-card" : "border-border bg-transparent hover:bg-card/80"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm leading-snug font-medium",
										children: chat.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 text-xs text-subtle tabular-nums",
										children: relDate(chat.updatedAt)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
									children: chat.summary
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2.5 flex flex-wrap items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: chat.category
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-subtle",
											children: msgLabel(chat.messages.length)
										}),
										flags.filter((f) => f !== "working").map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: flagBadge(f) }, f))
									]
								})
							]
						}) }, chat.id);
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: cn("border-border bg-card lg:sticky lg:top-0 lg:h-[calc(100dvh-3.5rem)] lg:border-l", selected ? "fixed inset-0 z-50 lg:static lg:z-0" : "hidden lg:block"),
			children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatDetail, {
				chat: selected,
				onClose: () => select(null)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-center justify-center px-8 text-center text-sm text-muted-foreground",
				children: "Select a chat to read the thread, recategorize, or pin it."
			})
		})]
	});
}
function ChatDetail({ chat, onClose }) {
	const recategorize = useChatStore((s) => s.recategorize);
	const togglePin = useChatStore((s) => s.togglePin);
	const removeChats = useChatStore((s) => s.removeChats);
	const setArchived = useChatStore((s) => s.setArchived);
	const patchSummary = useChatStore((s) => s.patchSummary);
	const analysis = useChatStore((s) => s.analysis);
	const flags = flagsFor(chat, analysis);
	const rename = analysis?.renameSuggestions.find((r) => r.chatId === chat.id);
	const applyRenames = useChatStore((s) => s.applyRenames);
	const [summarizing, setSummarizing] = (0, import_react.useState)(false);
	async function copyTitle() {
		await navigator.clipboard.writeText(chat.title);
		toast.success("Title copied — paste into Grok’s search.");
	}
	async function runSummary() {
		setSummarizing(true);
		try {
			const transcript = chat.messages.map((m) => `${m.role === "user" ? "You" : "Grok"}: ${m.content}`).join("\n\n").slice(0, 6e3);
			const result = await summarizeChat({ data: {
				title: chat.title,
				transcript
			} });
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			patchSummary(chat.id, result.summary);
			toast.success("Summary updated.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Summarize failed.");
		} finally {
			setSummarizing(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: relDate(chat.updatedAt)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-1 text-2xl leading-snug",
						children: chat.title
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: onClose,
					"aria-label": "Close chat",
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-center gap-2 px-5",
				children: flags.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: flagBadge(f) }, f))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 px-5 text-sm leading-relaxed text-muted-foreground",
				children: chat.summary
			}),
			rename && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Suggested name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: rename.suggested
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => applyRenames([chat.id]),
						children: "Use this name"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2 px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-11 items-center gap-2 rounded-md border border-border px-3 text-xs text-muted-foreground",
						children: ["Topic", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "bg-transparent text-sm text-foreground focus:outline-none",
							value: chat.category,
							onChange: (e) => recategorize(chat.id, e.target.value),
							children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c,
								children: c
							}, c))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => togglePin(chat.id),
						children: [chat.pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinOff, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {}), chat.pinned ? "Unpin" : "Pin"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setArchived([chat.id], !chat.archived),
						children: chat.archived ? "Unpark" : "Park in Sift"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => void copyTitle(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Copy title"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => void runSummary(),
						disabled: summarizing,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), summarizing ? "Summarizing…" : "Summarize"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => removeChats([chat.id]),
						children: "Remove from Sift"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "mt-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4 px-5 py-5",
					children: chat.messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-lg bg-muted/60 px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-muted-foreground uppercase",
							children: m.role === "user" ? "You" : "Grok"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm leading-relaxed whitespace-pre-wrap",
							children: m.content
						})]
					}, m.id))
				})
			})
		]
	});
}
function Home() {
	const view = useChatStore((s) => s.view);
	const hydrated = useChatStore((s) => s.hydrated);
	(0, import_react.useEffect)(() => {
		const finish = () => {
			useChatStore.getState().setHydrated(true);
			useChatStore.getState().refreshAnalysis();
		};
		const unsub = useChatStore.persist.onFinishHydration(finish);
		useChatStore.persist.rehydrate();
		if (useChatStore.persist.hasHydrated()) finish();
		const timeout = window.setTimeout(finish, 1600);
		return () => {
			unsub();
			window.clearTimeout(timeout);
		};
	}, []);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AskGrokButton, {}),
		children: [
			view === "insights" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsView, {}),
			view === "library" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryView, {}),
			view === "cleanup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CleanupView, {}),
			view === "import" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportView, {})
		]
	});
}
function AskGrokButton() {
	const [busy, setBusy] = (0, import_react.useState)(false);
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
			const result = await deepAnalyze({ data: { chats: active.slice(0, 40).map((c) => ({
				id: c.id,
				title: c.title,
				category: c.category,
				createdAt: c.createdAt,
				messageCount: c.messages.length,
				userChars: userText(c).length,
				firstUser: c.messages.find((m) => m.role === "user")?.content ?? "",
				flags: flagsFor(c, analysis)
			})) } });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		onClick: () => void run(),
		disabled: busy,
		size: "sm",
		"aria-busy": busy,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			className: "size-4",
			strokeWidth: 1.75
		}), busy ? "Asking Grok…" : "Ask Grok"]
	});
}
//#endregion
export { Home as component };
