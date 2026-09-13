import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { t as CATEGORIES } from "./types-CeBp-iFm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deep-analyze-jAjwcbbr.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asCategory(value) {
	if (typeof value === "string" && CATEGORIES.includes(value)) return value;
	return "Other";
}
function extractJson(text) {
	const raw = (text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? text).trim();
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start === -1 || end === -1) throw new Error("No JSON object in model response");
	return JSON.parse(raw.slice(start, end + 1));
}
var deepAnalyze_createServerFn_handler = createServerRpc({
	id: "4c74e8a94d8aae636bcade95623a140d5a7e1dc8f3b029d6d38a6d8997ff5797",
	name: "deepAnalyze",
	filename: "src/lib/ai/deep-analyze.ts"
}, (opts) => deepAnalyze.__executeServer(opts));
var deepAnalyze = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.chats)) throw new Error("Expected { chats: CompactChat[] }");
	return { chats: input.chats.slice(0, 40) };
}).handler(deepAnalyze_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment"
	};
	const payload = data.chats.map((c) => ({
		id: c.id,
		title: c.title,
		category: c.category,
		date: c.createdAt.slice(0, 10),
		messages: c.messageCount,
		userChars: c.userChars,
		excerpt: c.firstUser.slice(0, 280),
		flags: c.flags
	}));
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .2,
			max_tokens: 2200,
			messages: [{
				role: "system",
				content: "You organize a user's Grok chat history. Reply with a single JSON object, no markdown. Be specific and terse. Only reference chat ids from the input."
			}, {
				role: "user",
				content: `These are compact records of Grok chats. Produce JSON with this shape:
{
  "overview": "2-4 sentences on the library's shape and clutter",
  "recategorizations": [{"chatId": "...", "category": "Code|Writing|Research|Creative|Travel|Lifestyle|Learning|Planning|Support|Other", "reason": "..."}],
  "summaries": [{"chatId": "...", "summary": "one sentence"}],
  "extraDeletes": [{"chatId": "...", "reason": "..."}],
  "extraMerges": [{"chatIds": ["..."], "reason": "...", "title": "..."}],
  "hybridPlan": ["Keep in Grok: ...", "Archive in Sift: ...", "Delete from Grok: ...", "Rename: ..."],
  "notes": [{"title": "...", "body": "..."}]
}
Rules: recategorize only when the current category is wrong (max 8). Summarize the 12 most worth keeping. extraDeletes = true junk or weaker duplicates. extraMerges = 1-4 groups. hybridPlan = 4-6 actionable bullets mixing Grok-sidebar vs local archive. notes = 2-4 organizational insights.
Chats:
${JSON.stringify(payload)}`
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI API error ${res.status}`
	};
	const text = (await res.json()).choices?.[0]?.message?.content ?? "";
	if (!text) return {
		ok: false,
		error: "Empty model response"
	};
	try {
		const parsed = extractJson(text);
		const recats = Array.isArray(parsed.recategorizations) ? parsed.recategorizations : [];
		const summaries = Array.isArray(parsed.summaries) ? parsed.summaries : [];
		const extraDeletes = Array.isArray(parsed.extraDeletes) ? parsed.extraDeletes : [];
		const extraMerges = Array.isArray(parsed.extraMerges) ? parsed.extraMerges : [];
		const hybridPlan = Array.isArray(parsed.hybridPlan) ? parsed.hybridPlan : [];
		const notes = Array.isArray(parsed.notes) ? parsed.notes : [];
		return {
			ok: true,
			analysis: {
				generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
				overview: String(parsed.overview ?? "").trim() || "No overview returned.",
				recategorizations: recats.map((row) => {
					if (!row || typeof row !== "object") return null;
					const r = row;
					if (typeof r.chatId !== "string") return null;
					return {
						chatId: r.chatId,
						category: asCategory(r.category),
						reason: String(r.reason ?? "")
					};
				}).filter((r) => Boolean(r)),
				summaries: summaries.map((row) => {
					if (!row || typeof row !== "object") return null;
					const r = row;
					if (typeof r.chatId !== "string") return null;
					return {
						chatId: r.chatId,
						summary: String(r.summary ?? "")
					};
				}).filter((r) => Boolean(r)),
				extraDeletes: extraDeletes.map((row) => {
					if (!row || typeof row !== "object") return null;
					const r = row;
					if (typeof r.chatId !== "string") return null;
					return {
						chatId: r.chatId,
						reason: String(r.reason ?? "")
					};
				}).filter((r) => Boolean(r)),
				extraMerges: extraMerges.map((row) => {
					if (!row || typeof row !== "object") return null;
					const r = row;
					const ids = Array.isArray(r.chatIds) ? r.chatIds.filter((id) => typeof id === "string") : [];
					if (ids.length < 2) return null;
					return {
						chatIds: ids,
						reason: String(r.reason ?? ""),
						title: String(r.title ?? "Merged thread")
					};
				}).filter((r) => Boolean(r)),
				hybridPlan: hybridPlan.map((line) => String(line)).filter(Boolean).slice(0, 8),
				notes: notes.map((row) => {
					if (!row || typeof row !== "object") return null;
					const r = row;
					const title = String(r.title ?? "Note");
					const body = String(r.body ?? "");
					if (!body) return null;
					const chatId = typeof r.chatId === "string" ? r.chatId : void 0;
					return chatId ? {
						title,
						body,
						chatId
					} : {
						title,
						body
					};
				}).filter((r) => r !== null)
			}
		};
	} catch {
		return {
			ok: false,
			error: "Could not parse Grok's analysis. Try again."
		};
	}
});
var summarizeChat_createServerFn_handler = createServerRpc({
	id: "e1af770be22146b2339e3b0bb28511ea191fb1384e8d184462f2eed77745cf41",
	name: "summarizeChat",
	filename: "src/lib/ai/deep-analyze.ts"
}, (opts) => summarizeChat.__executeServer(opts));
var summarizeChat = createServerFn({ method: "POST" }).validator((input) => ({
	title: String(input.title ?? "").slice(0, 200),
	transcript: String(input.transcript ?? "").slice(0, 6e3)
})).handler(summarizeChat_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment"
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .2,
			max_tokens: 180,
			messages: [{
				role: "system",
				content: "Summarize a Grok chat for a library card. One sentence, specific, no quotes, no preamble."
			}, {
				role: "user",
				content: `Title: ${data.title}\n\n${data.transcript}`
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI API error ${res.status}`
	};
	const summary = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!summary) return {
		ok: false,
		error: "Empty model response"
	};
	return {
		ok: true,
		summary: summary.slice(0, 280)
	};
});
//#endregion
export { deepAnalyze_createServerFn_handler, summarizeChat_createServerFn_handler };
