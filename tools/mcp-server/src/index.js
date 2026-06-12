import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNTIME_ROOT = path.resolve(__dirname, "../../..");
const WIKI_ROOT = path.join(RUNTIME_ROOT, "wiki");
const JOURNAL_PATH = path.join(RUNTIME_ROOT, "journal.md");
const GRAPH_PATH = path.join(RUNTIME_ROOT, "maintenance", "graph.json");

const REQUIRED_GAME_SECTION_ALIASES = [
  ["## 기본 정보"],
  ["## 한 줄 정의"],
  ["## Core Loop"],
  ["## 핵심 재미 가설"],
  ["## 주요 시스템"],
  ["## 장르 관점과 비교", "## 장르 관습과 비교"],
  ["## 차별점 분석"],
  ["## 유사 게임 비교"],
  ["## 근거 자료"],
  ["## 검증 필요 사항"],
  ["## 관련 Wiki Pages"],
  ["## 유지보수 메모"]
];

const toolDefinitions = [
  {
    name: "wiki.search",
    description: "Search game analysis wiki pages by title, aliases, tag, genre, mechanic, slug, or full text.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        filters: { type: "array", items: { type: "string" } }
      },
      required: ["query"]
    }
  },
  {
    name: "wiki.get_page",
    description: "Return a markdown wiki page by relative path, game slug, title, alias, or resource uri.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        slug: { type: "string" },
        uri: { type: "string" }
      }
    }
  },
  {
    name: "wiki.write_page",
    description: "Write a Markdown wiki page inside wiki/ and return validation metadata.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        markdown: { type: "string" },
        summary: { type: "string" },
        actor: { type: "string" }
      },
      required: ["path", "markdown"]
    }
  },
  {
    name: "wiki.update_page",
    description: "Replace a Markdown wiki page or one section inside a page.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        markdown: { type: "string" },
        heading: { type: "string" },
        content: { type: "string" },
        summary: { type: "string" },
        actor: { type: "string" }
      },
      required: ["path"]
    }
  },
  {
    name: "wiki.archive_page",
    description: "Mark a page as archived without deleting history.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        reason: { type: "string" },
        actor: { type: "string" }
      },
      required: ["path"]
    }
  },
  {
    name: "wiki.merge_page",
    description: "Deprecate a duplicate page and link it to a canonical page.",
    inputSchema: {
      type: "object",
      properties: {
        canonicalPath: { type: "string" },
        duplicatePath: { type: "string" },
        reason: { type: "string" },
        actor: { type: "string" }
      },
      required: ["canonicalPath", "duplicatePath"]
    }
  },
  {
    name: "schema.validate",
    description: "Validate a markdown wiki page against the game-analysis schema.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        markdown: { type: "string" }
      }
    }
  },
  {
    name: "game.compare",
    description: "Compare two games by metadata, core loop, mechanics, and existing comparison pages.",
    inputSchema: {
      type: "object",
      properties: {
        gameA: { type: "string" },
        gameB: { type: "string" },
        axes: { type: "array", items: { type: "string" } }
      },
      required: ["gameA", "gameB"]
    }
  },
  {
    name: "graph.get",
    description: "Return game-genre-mechanic graph JSON.",
    inputSchema: { type: "object", properties: { type: { type: "string" } } }
  },
  {
    name: "journal.append",
    description: "Append an agent work event to runtime journal.",
    inputSchema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        actor: { type: "string" }
      },
      required: ["summary"]
    }
  }
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, "utf8");
}

function safeRuntimePath(relPath, baseDir = RUNTIME_ROOT) {
  const clean = String(relPath || "").replaceAll("\\", "/").replace(/^\/+/, "");
  const full = path.resolve(RUNTIME_ROOT, clean);
  const allowedBase = path.resolve(baseDir);
  if (!full.startsWith(allowedBase + path.sep) && full !== allowedBase) {
    throw new Error(`Path escapes allowed directory: ${relPath}`);
  }
  return full;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function appendJournal(summary, actor = "MCP Tool") {
  if (!summary) return;
  fs.appendFileSync(JOURNAL_PATH, `\n- ${today()}: [${actor}] ${summary}\n`, "utf8");
}

function walk(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function relativeToRuntime(filePath) {
  return path.relative(RUNTIME_ROOT, filePath).replaceAll("\\", "/");
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function searchKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^["']|["']$/g, "");
}

function parseFrontMatter(markdown) {
  if (!markdown.startsWith("---")) return { data: {}, body: markdown };
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: markdown };
  const yaml = markdown.slice(3, end).trim().split(/\r?\n/);
  const body = markdown.slice(markdown.indexOf("\n", end + 4) + 1);
  const data = {};
  let currentKey = null;
  for (const line of yaml) {
    if (!line.trim()) continue;
    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(parseScalar(listMatch[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const raw = kv[2];
      if (raw === "") data[currentKey] = [];
      else if (raw === "[]") data[currentKey] = [];
      else data[currentKey] = parseScalar(raw);
    }
  }
  return { data, body };
}

function splitFrontMatter(markdown) {
  if (!markdown.startsWith("---")) return { front: "", body: markdown };
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return { front: "", body: markdown };
  return { front: markdown.slice(3, end).trim(), body: markdown.slice(end + 4).replace(/^\r?\n/, "") };
}

function setFrontMatterScalar(markdown, key, value) {
  const { front, body } = splitFrontMatter(markdown);
  const lines = front ? front.split(/\r?\n/) : [];
  const next = [];
  let replaced = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith(`${key}:`)) {
      next.push(`${key}: ${value}`);
      replaced = true;
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) i += 1;
    } else {
      next.push(lines[i]);
    }
  }
  if (!replaced) next.push(`${key}: ${value}`);
  return `---\n${next.join("\n")}\n---\n\n${body}`;
}

function getFrontMatterList(markdown, key) {
  const { front } = splitFrontMatter(markdown);
  const lines = front ? front.split(/\r?\n/) : [];
  const values = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith(`${key}:`)) continue;
    i += 1;
    while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
      values.push(lines[i].replace(/^\s+-\s+/, "").trim());
      i += 1;
    }
    break;
  }
  return values;
}

function setFrontMatterList(markdown, key, values) {
  const { front, body } = splitFrontMatter(markdown);
  const lines = front ? front.split(/\r?\n/) : [];
  const next = [];
  let replaced = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith(`${key}:`)) {
      next.push(`${key}:`);
      for (const value of values) next.push(`  - ${value}`);
      replaced = true;
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) i += 1;
    } else {
      next.push(lines[i]);
    }
  }
  if (!replaced) {
    next.push(`${key}:`);
    for (const value of values) next.push(`  - ${value}`);
  }
  return `---\n${next.join("\n")}\n---\n\n${body}`;
}

function replaceSection(markdown, heading, content) {
  const normalizedHeading = heading.startsWith("## ") ? heading : `## ${heading}`;
  const escaped = normalizedHeading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^${escaped}\\s*\\n)[\\s\\S]*?(?=\\n##\\s+|$)`, "m");
  return pattern.test(markdown)
    ? markdown.replace(pattern, `$1\n${content}\n`)
    : `${markdown.trim()}\n\n${normalizedHeading}\n\n${content}\n`;
}

function inferPageType(rel) {
  if (rel.includes("/games/")) return "game-analysis";
  if (rel.includes("/mechanics/")) return "mechanic";
  if (rel.includes("/genres/")) return "genre";
  if (rel.includes("/comparisons/")) return "comparison";
  if (rel.includes("/design-notes/")) return "design-note";
  if (rel.includes("/evidence/")) return "evidence";
  return "wiki";
}

function loadPages() {
  return walk(WIKI_ROOT, (p) => p.endsWith(".md")).map((filePath) => {
    const markdown = readText(filePath);
    const parsed = parseFrontMatter(markdown);
    const rel = relativeToRuntime(filePath);
    const title = parsed.data.title || path.basename(filePath, ".md");
    const slug = parsed.data.game_slug || normalizeSlug(title);
    return {
      path: rel,
      absPath: filePath,
      title,
      slug,
      pageType: parsed.data.page_type || inferPageType(rel),
      metadata: parsed.data,
      body: parsed.body,
      markdown
    };
  });
}

function pageToSummary(page, query = "") {
  const aliases = Array.isArray(page.metadata.aliases) ? page.metadata.aliases : [];
  const haystack = [
    page.title,
    page.path,
    page.pageType,
    page.slug,
    ...aliases,
    JSON.stringify(page.metadata),
    page.body
  ].join(" ").toLowerCase();
  const compactHaystack = searchKey(haystack);
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const score = q
    ? terms.reduce((acc, term) => acc + (haystack.includes(term) || compactHaystack.includes(searchKey(term)) ? 1 : 0), 0)
    : 1;
  const tags = [
    ...(Array.isArray(page.metadata.tags) ? page.metadata.tags : []),
    ...(Array.isArray(page.metadata.genre) ? page.metadata.genre : []),
    ...(Array.isArray(page.metadata.mechanics) ? page.metadata.mechanics : []),
    page.pageType
  ].filter(Boolean);
  return {
    title: page.title,
    path: page.path,
    page_type: page.pageType,
    slug: page.slug,
    aliases,
    score,
    tags: [...new Set(tags.map((tag) => String(tag)))],
    last_reviewed: page.metadata.last_reviewed || "",
    status: page.metadata.status || "",
    evidence_level: page.metadata.evidence_level || "",
    quality_score: page.metadata.quality_score ?? "",
    quality_level: page.metadata.quality_level || ""
  };
}

function resolvePage(input = {}) {
  const pages = loadPages();
  const value = input.path || input.slug || input.uri || "";
  const clean = String(value).replace(/^wiki:\/\//, "wiki/").replaceAll("\\", "/");
  if (!value && input.markdown) return null;
  const normalized = normalizeSlug(value);
  const compact = searchKey(value);
  const candidates = [
    clean,
    clean.startsWith("wiki/") ? clean : `wiki/games/${normalized}.md`,
    clean.endsWith(".md") ? clean : `${clean}.md`
  ];
  return pages.find((p) => {
    const aliases = Array.isArray(p.metadata.aliases) ? p.metadata.aliases : [];
    return candidates.includes(p.path) ||
      p.slug === normalized ||
      normalizeSlug(p.title) === normalized ||
      searchKey(p.title) === compact ||
      aliases.some((alias) => normalizeSlug(alias) === normalized || searchKey(alias) === compact);
  });
}

function resolveGamePage(value) {
  const pages = loadPages().filter((p) => p.pageType === "game-analysis");
  const normalized = normalizeSlug(value);
  const compact = searchKey(value);
  return pages.find((p) => {
    const aliases = Array.isArray(p.metadata.aliases) ? p.metadata.aliases : [];
    return p.slug === normalized ||
      normalizeSlug(p.title) === normalized ||
      searchKey(p.title) === compact ||
      p.path === value ||
      p.path.endsWith(`/games/${normalized}.md`) ||
      aliases.some((alias) => normalizeSlug(alias) === normalized || searchKey(alias) === compact);
  });
}

function resultText(obj) {
  return { content: [{ type: "text", text: typeof obj === "string" ? obj : JSON.stringify(obj, null, 2) }] };
}

export function wikiSearch(args = {}) {
  const query = String(args.query || "").trim();
  const filters = new Set((args.filters || []).map((f) => String(f).toLowerCase()));
  let pages = loadPages();
  if (filters.size) {
    pages = pages.filter((p) => filters.has(p.pageType) || filters.has(p.pageType.replace("-analysis", "")));
  }
  const results = pages
    .map((p) => pageToSummary(p, query))
    .filter((r) => !query || r.score > 0 || searchKey(r.title).includes(searchKey(query)) || r.aliases.some((alias) => searchKey(alias).includes(searchKey(query))))
    .sort((a, b) => {
      const archivedA = ["deprecated", "archived"].includes(a.status) ? 1 : 0;
      const archivedB = ["deprecated", "archived"].includes(b.status) ? 1 : 0;
      const seedA = a.evidence_level === "seed" ? 1 : 0;
      const seedB = b.evidence_level === "seed" ? 1 : 0;
      const typeA = a.page_type === "game-analysis" ? 0 : 1;
      const typeB = b.page_type === "game-analysis" ? 0 : 1;
      return archivedA - archivedB || typeA - typeB || seedA - seedB || b.score - a.score || a.title.localeCompare(b.title);
    });
  return { query, count: results.length, results };
}

export function wikiGetPage(args = {}) {
  const page = resolvePage(args);
  if (!page) throw new Error(`Wiki page not found: ${args.path || args.slug || args.uri || ""}`);
  return { title: page.title, path: page.path, page_type: page.pageType, metadata: page.metadata, markdown: page.markdown };
}

export function wikiWritePage(args = {}) {
  const pagePath = String(args.path || "").replaceAll("\\", "/");
  const markdown = String(args.markdown || "");
  if (!pagePath || !markdown) throw new Error("wiki.write_page requires path and markdown");
  if (!pagePath.startsWith("wiki/") || !pagePath.endsWith(".md")) {
    throw new Error("wiki.write_page path must be a Markdown file under wiki/");
  }
  const abs = safeRuntimePath(pagePath, WIKI_ROOT);
  writeText(abs, markdown);
  const validation = markdown.includes("page_type: game-analysis")
    ? schemaValidate({ path: pagePath })
    : { ok: true, path: pagePath, page_type: parseFrontMatter(markdown).data.page_type || "wiki", missing_metadata: [], missing_sections: [] };
  appendJournal(args.summary || `Wrote wiki page: ${pagePath}`, args.actor || "wiki.write_page");
  return { ok: validation.ok, path: pagePath, validation };
}

export function wikiUpdatePage(args = {}) {
  const pagePath = String(args.path || "").replaceAll("\\", "/");
  if (!pagePath) throw new Error("wiki.update_page requires path");
  const abs = safeRuntimePath(pagePath, WIKI_ROOT);
  if (!fs.existsSync(abs)) throw new Error(`Page not found: ${pagePath}`);
  const current = readText(abs);
  let next;
  if (args.markdown) next = String(args.markdown);
  else if (args.heading && args.content) next = replaceSection(current, String(args.heading), String(args.content));
  else throw new Error("wiki.update_page requires markdown or heading+content");
  writeText(abs, next);
  const validation = next.includes("page_type: game-analysis")
    ? schemaValidate({ path: pagePath })
    : { ok: true, path: pagePath, page_type: parseFrontMatter(next).data.page_type || "wiki", missing_metadata: [], missing_sections: [] };
  appendJournal(args.summary || `Updated wiki page: ${pagePath}`, args.actor || "wiki.update_page");
  return { ok: validation.ok, path: pagePath, validation };
}

export function wikiArchivePage(args = {}) {
  const pagePath = String(args.path || "").replaceAll("\\", "/");
  const reason = String(args.reason || "Archived through MCP tool").trim();
  if (!pagePath) throw new Error("wiki.archive_page requires path");
  const abs = safeRuntimePath(pagePath, WIKI_ROOT);
  if (!fs.existsSync(abs)) throw new Error(`Page not found: ${pagePath}`);
  let markdown = readText(abs);
  markdown = setFrontMatterScalar(markdown, "status", "archived");
  markdown = setFrontMatterScalar(markdown, "last_reviewed", today());
  markdown += `\n\n## Archive Note - ${today()}\n\n${reason}\n`;
  writeText(abs, markdown);
  appendJournal(`Archived ${pagePath}: ${reason}`, args.actor || "wiki.archive_page");
  return { ok: true, path: pagePath, status: "archived" };
}

export function wikiMergePage(args = {}) {
  const canonicalPath = String(args.canonicalPath || "").replaceAll("\\", "/");
  const duplicatePath = String(args.duplicatePath || "").replaceAll("\\", "/");
  const reason = String(args.reason || "Duplicate page merged").trim();
  if (!canonicalPath || !duplicatePath) throw new Error("wiki.merge_page requires canonicalPath and duplicatePath");
  const canonicalAbs = safeRuntimePath(canonicalPath, WIKI_ROOT);
  const duplicateAbs = safeRuntimePath(duplicatePath, WIKI_ROOT);
  if (!fs.existsSync(canonicalAbs)) throw new Error(`Canonical page not found: ${canonicalPath}`);
  if (!fs.existsSync(duplicateAbs)) throw new Error(`Duplicate page not found: ${duplicatePath}`);
  const duplicateName = path.basename(duplicatePath, ".md");
  let canonical = readText(canonicalAbs);
  canonical = setFrontMatterList(canonical, "aliases", [...new Set([...getFrontMatterList(canonical, "aliases"), duplicateName])]);
  canonical += `\n\n## Merge Note - ${today()}\n\n- 병합 출처: ${duplicatePath}\n- 사유: ${reason}\n`;
  writeText(canonicalAbs, canonical);
  let duplicate = readText(duplicateAbs);
  duplicate = setFrontMatterScalar(duplicate, "status", "deprecated");
  duplicate = setFrontMatterScalar(duplicate, "replaced_by", canonicalPath);
  duplicate += `\n\n## Deprecated Note - ${today()}\n\n${reason}\n\n대체 문서: ${canonicalPath}\n`;
  writeText(duplicateAbs, duplicate);
  appendJournal(`Merged ${duplicatePath} into ${canonicalPath}: ${reason}`, args.actor || "wiki.merge_page");
  return { ok: true, canonicalPath, duplicatePath, duplicate_status: "deprecated" };
}

export function schemaValidate(args = {}) {
  let markdown = args.markdown;
  let pagePath = args.path || null;
  if (!markdown) {
    const page = resolvePage(args);
    if (!page) throw new Error(`Cannot validate missing page: ${args.path || ""}`);
    markdown = page.markdown;
    pagePath = page.path;
  }
  const { data } = parseFrontMatter(markdown);
  const missingMetadata = [
    "title",
    "page_type",
    "status",
    "game_slug",
    "genre",
    "platform",
    "evidence_level",
    "core_loop",
    "mechanics",
    "similar_games",
    "last_reviewed"
  ].filter((key) => data.page_type === "game-analysis" && !(key in data));
  const missingSections = data.page_type === "game-analysis"
    ? REQUIRED_GAME_SECTION_ALIASES
      .filter((group) => !group.some((section) => markdown.includes(section)))
      .map((group) => group[0])
    : [];
  const ok = missingMetadata.length === 0 && missingSections.length === 0;
  return { ok, path: pagePath, page_type: data.page_type || "unknown", missing_metadata: missingMetadata, missing_sections: missingSections };
}

function extractSection(markdown, heading) {
  const start = markdown.indexOf(heading);
  if (start === -1) return "";
  const after = markdown.slice(start + heading.length);
  const next = after.search(/\n##\s+/);
  return (next === -1 ? after : after.slice(0, next)).trim();
}

export function gameCompare(args = {}) {
  const a = resolveGamePage(args.gameA);
  const b = resolveGamePage(args.gameB);
  if (!a || !b) {
    const pages = loadPages().filter((p) => p.pageType === "game-analysis").map((p) => ({ title: p.title, slug: p.slug, aliases: p.metadata.aliases || [], path: p.path }));
    throw new Error(`Game page not found. Available games: ${JSON.stringify(pages)}`);
  }
  const axes = args.axes || ["genre", "core_loop", "mechanics", "similar_games", "fun_factor", "differentiation"];
  const comparisonPage = loadPages().find((p) =>
    p.pageType === "comparison" &&
    normalizeSlug(p.markdown).includes(normalizeSlug(a.slug)) &&
    normalizeSlug(p.markdown).includes(normalizeSlug(b.slug))
  );
  const rows = axes.map((axis) => {
    if (axis === "genre") return { axis: "genre", [a.slug]: a.metadata.genre || [], [b.slug]: b.metadata.genre || [] };
    if (axis === "core_loop") return { axis: "core_loop", [a.slug]: a.metadata.core_loop || [], [b.slug]: b.metadata.core_loop || [] };
    if (axis === "mechanics") return { axis: "mechanics", [a.slug]: a.metadata.mechanics || [], [b.slug]: b.metadata.mechanics || [] };
    if (axis === "similar_games") return { axis: "similar_games", [a.slug]: a.metadata.similar_games || [], [b.slug]: b.metadata.similar_games || [] };
    if (axis === "fun_factor") return { axis: "fun_factor", [a.slug]: extractSection(a.markdown, "## 핵심 재미 가설"), [b.slug]: extractSection(b.markdown, "## 핵심 재미 가설") };
    if (axis === "differentiation") return { axis: "differentiation", [a.slug]: extractSection(a.markdown, "## 차별점 분석"), [b.slug]: extractSection(b.markdown, "## 차별점 분석") };
    return { axis, [a.slug]: "", [b.slug]: "" };
  });
  return {
    gameA: { title: a.title, slug: a.slug, path: a.path },
    gameB: { title: b.title, slug: b.slug, path: b.path },
    existing_comparison_page: comparisonPage ? comparisonPage.path : null,
    rows,
    summary: comparisonPage
      ? extractSection(comparisonPage.markdown, "## 결론")
      : "No curated comparison page exists yet. The table was generated from available metadata and sections."
  };
}

export function graphGet() {
  if (!fs.existsSync(GRAPH_PATH)) return { nodes: [], edges: [] };
  return JSON.parse(readText(GRAPH_PATH));
}

export function journalAppend(args = {}) {
  const actor = args.actor || "MCP Tool";
  const summary = args.summary;
  if (!summary) throw new Error("journal.append requires summary");
  const date = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(JOURNAL_PATH, `\n- ${date}: [${actor}] ${summary}\n`, "utf8");
  return { ok: true, path: relativeToRuntime(JOURNAL_PATH), appended: summary };
}

export const toolHandlers = {
  "wiki.search": wikiSearch,
  "wiki.get_page": wikiGetPage,
  "wiki.write_page": wikiWritePage,
  "wiki.update_page": wikiUpdatePage,
  "wiki.archive_page": wikiArchivePage,
  "wiki.merge_page": wikiMergePage,
  "schema.validate": schemaValidate,
  "game.compare": gameCompare,
  "graph.get": graphGet,
  "journal.append": journalAppend
};

function listResources() {
  const pages = loadPages();
  return [
    { uri: "wiki://index", name: "Wiki Index", mimeType: "text/markdown" },
    { uri: "wiki://graph", name: "Game graph", mimeType: "application/json" },
    ...pages.map((p) => ({ uri: `wiki://${p.path}`, name: p.title, mimeType: "text/markdown" }))
  ];
}

function readResource(uri) {
  if (uri === "wiki://graph") return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(graphGet(), null, 2) }] };
  const page = resolvePage({ uri });
  if (!page) throw new Error(`Resource not found: ${uri}`);
  return { contents: [{ uri, mimeType: "text/markdown", text: page.markdown }] };
}

async function handleRpc(req) {
  const { id, method, params = {} } = req;
  try {
    if (method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {}, resources: {} },
          serverInfo: { name: "game-analysis-wiki-mcp-server", version: "0.3.0" }
        }
      };
    }
    if (method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: toolDefinitions } };
    if (method === "tools/call") {
      const name = params.name;
      const args = params.arguments || {};
      if (!toolHandlers[name]) throw new Error(`Unknown tool: ${name}`);
      return { jsonrpc: "2.0", id, result: resultText(toolHandlers[name](args)) };
    }
    if (method === "resources/list") return { jsonrpc: "2.0", id, result: { resources: listResources() } };
    if (method === "resources/read") return { jsonrpc: "2.0", id, result: readResource(params.uri) };
    if (method === "prompts/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          prompts: [
            { name: "analyze_game_from_raw", description: "Analyze a raw game request into a wiki page plan." },
            { name: "compare_games_by_mechanics", description: "Compare two games using mechanics and core loop." }
          ]
        }
      };
    }
    return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
  } catch (error) {
    return { jsonrpc: "2.0", id, error: { code: -32000, message: error.message } };
  }
}

async function runStdioServer() {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    let req;
    try {
      req = JSON.parse(line);
    } catch {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n");
      continue;
    }
    const res = await handleRpc(req);
    process.stdout.write(JSON.stringify(res) + "\n");
  }
}

function parseJsonArg(value) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    const loose = String(value).trim();
    const objectLike = loose.match(/^\{(.+)\}$/);
    if (objectLike) {
      const out = {};
      const pairs = objectLike[1].split(/,(?=\s*[A-Za-z0-9_-]+\s*:)/);
      for (const pair of pairs) {
        const match = pair.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*$/);
        if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
      if (Object.keys(out).length) return out;
    }
    return { query: value, path: value, slug: value };
  }
}

async function runCli() {
  const [, , command, toolName, rawArgs] = process.argv;
  if (!command) return runStdioServer();
  if (command === "tools/list") {
    console.log(JSON.stringify({ tools: toolDefinitions }, null, 2));
    return;
  }
  if (command === "resources/list") {
    console.log(JSON.stringify({ resources: listResources() }, null, 2));
    return;
  }
  if (command === "resources/read") {
    console.log(JSON.stringify(readResource(toolName), null, 2));
    return;
  }
  if (command === "tools/call") {
    if (!toolHandlers[toolName]) throw new Error(`Unknown tool: ${toolName}`);
    console.log(JSON.stringify(toolHandlers[toolName](parseJsonArg(rawArgs)), null, 2));
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  runCli().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
