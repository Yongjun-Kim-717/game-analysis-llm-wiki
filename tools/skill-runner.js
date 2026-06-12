import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  gameCompare,
  schemaValidate,
  wikiArchivePage,
  wikiMergePage,
  wikiSearch,
  wikiUpdatePage,
  wikiWritePage
} from "./mcp-server/src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function today() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function slugify(value) {
  return String(value || "untitled")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function compactKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

const TITLE_RESOLVER = new Map([
  ["서브나우티카2", { title: "Subnautica 2", aliases: ["서브나우티카2", "서브노티카2", "Subnautica2", "Subnautica 2"] }],
  ["서브노티카2", { title: "Subnautica 2", aliases: ["서브나우티카2", "서브노티카2", "Subnautica2", "Subnautica 2"] }],
  ["subnautica2", { title: "Subnautica 2", aliases: ["서브나우티카2", "서브노티카2", "Subnautica2", "Subnautica 2"] }]
]);

function resolveCanonicalTitle(inputTitle, explicitAliases = []) {
  const original = String(inputTitle || "").trim();
  const mapped = TITLE_RESOLVER.get(compactKey(original));
  const title = mapped?.title || original;
  const aliases = [...new Set([original, title, ...(mapped?.aliases || []), ...explicitAliases].filter(Boolean))];
  return { original, title, aliases, searchTerms: [...new Set([title, original, ...aliases].filter(Boolean))] };
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value, "utf8");
}

function appendJournal(summary, actor = "Skill Runner") {
  fs.appendFileSync(path.join(ROOT, "journal.md"), `\n- ${today()}: [${actor}] ${summary}\n`, "utf8");
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function splitList(value) {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  return String(value || "")
    .split(/\r?\n|,/)
    .map((v) => v.trim())
    .filter(Boolean);
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

function getFrontMatterScalar(markdown, key) {
  const { front } = splitFrontMatter(markdown);
  const lines = front ? front.split(/\r?\n/) : [];
  const line = lines.find((item) => item.startsWith(`${key}:`));
  return line ? line.slice(key.length + 1).trim() : "";
}

function replaceOrInsertSection(markdown, heading, content, beforePattern = /^##\s+.*?(근거|Evidence|洹쇨굅)/m) {
  const section = `## ${heading}\n\n${content.trim()}\n`;
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exact = new RegExp(`^##\\s+${escaped}\\s*\\r?\\n[\\s\\S]*?(?=^##\\s+|$)`, "m");
  if (exact.test(markdown)) return markdown.replace(exact, section);

  const legacyQuality = /^##\s+.*?(분석 품질|遺꾩꽍\s+\?덉쭏).*?\r?\n[\s\S]*?(?=^##\s+|$)/m;
  if (legacyQuality.test(markdown)) return markdown.replace(legacyQuality, section);

  const match = markdown.match(beforePattern);
  if (match?.index !== undefined) {
    return `${markdown.slice(0, match.index).trimEnd()}\n\n${section}\n${markdown.slice(match.index)}`;
  }
  return `${markdown.trimEnd()}\n\n${section}`;
}

function extractSourceRecordsFromMarkdown(markdown, evidenceLevel) {
  const records = [];
  const sourceLine = /^\s*-\s+\[([A-Z]\d+)\]\s+(.+?)(?:\s+\((tier-\d),\s*([^)]+)\))?(?:\s+(https?:\/\/\S+))?\s*$/gm;
  let match;
  while ((match = sourceLine.exec(markdown))) {
    const id = match[1];
    if (!/^[SRU]\d+$/.test(id)) continue;
    records.push({
      id,
      tier: match[3] || (id.startsWith("R") ? "tier-4" : evidenceLevel === "high" ? "tier-1" : "tier-3"),
      kind: id.startsWith("R") ? "user-review" : "source",
      title: (match[2] || id).trim(),
      url: match[5] || "",
      status: match[4] || (evidenceLevel === "seed" ? "candidate" : "fetched")
    });
  }
  return records;
}

function researchFromExistingGamePage(markdown, page) {
  const title = getFrontMatterScalar(markdown, "title") || page.title;
  const slug = getFrontMatterScalar(markdown, "game_slug") || page.slug || slugify(title);
  const evidenceLevel = getFrontMatterScalar(markdown, "evidence_level") || page.evidence_level || "low";
  const aliases = getFrontMatterList(markdown, "aliases");
  const genre = getFrontMatterList(markdown, "genre");
  const platform = getFrontMatterList(markdown, "platform");
  const tags = getFrontMatterList(markdown, "tags");
  const coreLoop = getFrontMatterList(markdown, "core_loop");
  const mechanics = getFrontMatterList(markdown, "mechanics");
  const sources = extractSourceRecordsFromMarkdown(markdown, evidenceLevel);
  const claims = [];

  let claimId = 1;
  const firstSource = sources.find((source) => source.status === "fetched" || source.status === "user-provided")?.id || "page";
  for (const item of genre) claims.push({ id: `C${claimId++}`, source_id: firstSource, field: "genre", text: item, confidence: "medium", claim_type: "fact" });
  for (const item of platform) claims.push({ id: `C${claimId++}`, source_id: firstSource, field: "platform", text: item, confidence: "medium", claim_type: "fact" });
  for (const item of tags) claims.push({ id: `C${claimId++}`, source_id: firstSource, field: "tag", text: item, confidence: "medium", claim_type: "fact" });

  const reviewRefs = [...new Set([...markdown.matchAll(/\[(R\d+)\]/g)].map((item) => item[1]))];
  for (const id of reviewRefs) {
    claims.push({ id: `C${claimId++}`, source_id: id, field: "experience_signal", text: "Existing page contains a player-experience reference.", confidence: "medium", claim_type: "player-experience" });
  }

  const unresolved = [];
  if (!sources.some((source) => source.status === "fetched" || source.status === "user-provided")) unresolved.push("No fetched or user-provided source record found in existing page.");
  if (!reviewRefs.length) unresolved.push("No player-experience source id found in existing page.");
  if (!coreLoop.length) unresolved.push("No core loop metadata found in existing page.");

  return {
    title,
    slug,
    aliases,
    genre,
    platform,
    tags,
    coreLoop,
    mechanics,
    evidenceLevel,
    research: {
      game: title,
      original_game: getFrontMatterScalar(markdown, "original_query") || title,
      aliases,
      slug,
      scope: "backfill-existing-page",
      allowed_tiers: ["tier-1", "tier-2", "tier-3", "tier-4"],
      sources,
      claims,
      unresolved_questions: unresolved
    }
  };
}

function buildQualitySection(qualityReport) {
  const strengths = qualityReport.strengths.map((item) => `- ${item}`).join("\n") || "- 기록된 강점 없음";
  const gaps = qualityReport.gaps.map((item) => `- ${item}`).join("\n") || "- 주요 보완점 없음";
  return `- 품질 점수: ${qualityReport.quality_score}/100
- 품질 등급: ${qualityReport.quality_level}
- 사실 근거 수준: ${qualityReport.evidence_level}
- 플레이 경험 근거 수준: ${qualityReport.experience_evidence_level}

### 강점

${strengths}

### 보완점

${gaps}`;
}

function buildCoreLoopSection(coreLoopConfidence) {
  return coreLoopConfidence.items.map((item, index) => {
    const cites = item.source_ids.length ? item.source_ids.map((id) => `[${id}]`).join("") : "[inference]";
    return `${index + 1}. ${item.step} ${cites} [confidence: ${item.confidence}]`;
  }).join("\n");
}

function inferTags(text) {
  const lower = String(text || "").toLowerCase();
  const candidates = [
    "roguelike",
    "roguelite",
    "deckbuilder",
    "card-battler",
    "action",
    "strategy",
    "narrative",
    "puzzle",
    "rpg",
    "turn-based",
    "real-time",
    "run-based",
    "synergy",
    "progression",
    "risk-reward",
    "survival",
    "crafting",
    "exploration",
    "underwater",
    "open-world"
  ];
  return candidates.filter((tag) => lower.includes(tag));
}

function inferCoreLoop(note, tags) {
  const loop = [];
  if (tags.includes("deckbuilder") || tags.includes("card-battler")) {
    loop.push("카드/선택지 획득", "덱 또는 빌드 조정", "전투/도전 해결");
  }
  if (tags.includes("roguelike") || tags.includes("roguelite") || tags.includes("run-based")) {
    loop.push("런 시작", "위험과 보상 선택", "실패 또는 클리어 후 재시도");
  }
  if (tags.includes("action")) {
    loop.push("실시간 조작 전투", "전투 보상 선택", "숙련 기반 반복");
  }
  if (tags.includes("survival") || tags.includes("crafting") || tags.includes("exploration")) {
    loop.push("환경 탐색", "자원 수집", "장비/기지 제작", "더 위험한 구역으로 확장");
  }
  if (!loop.length) {
    loop.push("상황 판단", "핵심 행동 수행", "보상 획득", "다음 선택으로 반복");
  }
  return [...new Set(loop)];
}

function inferMechanics(tags) {
  const mechanics = [];
  if (tags.includes("deckbuilder")) mechanics.push("deckbuilding");
  if (tags.includes("card-battler")) mechanics.push("card-combat");
  if (tags.includes("roguelike") || tags.includes("roguelite")) mechanics.push("run-based-progression");
  if (tags.includes("action")) mechanics.push("action-combat");
  if (tags.includes("synergy")) mechanics.push("synergy-building");
  if (tags.includes("risk-reward")) mechanics.push("risk-reward");
  if (tags.includes("survival")) mechanics.push("survival-management");
  if (tags.includes("crafting")) mechanics.push("crafting-progression");
  if (tags.includes("exploration")) mechanics.push("exploration-gating");
  return mechanics.length ? mechanics : ["core-system-analysis-needed"];
}

const SCOPE_TIERS = {
  conservative: ["tier-1", "tier-2"],
  standard: ["tier-1", "tier-2", "tier-3"],
  broad: ["tier-1", "tier-2", "tier-3", "tier-4"]
};

function tierForUrl(url) {
  const lower = String(url).toLowerCase();
  if (/steam|playstation|xbox|nintendo|epicgames|gog|official|press|developer|publisher/.test(lower)) return "tier-1";
  if (/patch|interview|devlog|blog/.test(lower)) return "tier-2";
  if (/wiki|igdb|mobygames|giantbomb|fandom/.test(lower)) return "tier-3";
  return "tier-4";
}

function kindForUrl(url) {
  const lower = String(url).toLowerCase();
  if (/steam|playstation|xbox|nintendo|epicgames|gog/.test(lower)) return "store";
  if (/official|developer|publisher|press/.test(lower)) return "official";
  if (/wiki|igdb|mobygames|giantbomb|fandom/.test(lower)) return "reference";
  if (/youtube|review|reddit|community|blog/.test(lower)) return "reaction";
  return "source";
}

function buildSearchTargets(searchTerms, scope) {
  const base = [];
  for (const term of searchTerms) {
    const encoded = encodeURIComponent(term);
    base.push(
      { tier: "tier-1", kind: "store", title: `Steam Store Search - ${term}`, url: `https://store.steampowered.com/search/?term=${encoded}` },
      { tier: "tier-1", kind: "official-search", title: `Official Site Search - ${term}`, url: `https://www.google.com/search?q=${encoded}+official+site` },
      { tier: "tier-2", kind: "press-search", title: `Press Kit Search - ${term}`, url: `https://www.google.com/search?q=${encoded}+press+kit+developer` },
      { tier: "tier-3", kind: "reference-search", title: `Public Wiki Search - ${term}`, url: `https://www.google.com/search?q=${encoded}+game+wiki` },
      { tier: "tier-3", kind: "database-search", title: `MobyGames Search - ${term}`, url: `https://www.mobygames.com/search/?q=${encoded}` },
      { tier: "tier-4", kind: "review-search", title: `Review Search - ${term}`, url: `https://www.google.com/search?q=${encoded}+review+game` }
    );
  }
  const allowed = new Set(SCOPE_TIERS[scope] || SCOPE_TIERS.standard);
  return base.filter((item, index, arr) =>
    allowed.has(item.tier) && arr.findIndex((other) => other.url === item.url) === index
  );
}

function buildResearchPackage({ title, originalTitle, aliases, slug, scope, sources, note, genre, platform, tags, searchTerms }) {
  const allowed = new Set(SCOPE_TIERS[scope] || SCOPE_TIERS.standard);
  const sourceRecords = [];
  let sourceIndex = 1;
  for (const source of sources) {
    const tier = tierForUrl(source);
    if (!allowed.has(tier)) continue;
    sourceRecords.push({
      id: `S${sourceIndex++}`,
      tier,
      kind: kindForUrl(source),
      title: source,
      url: source,
      status: "user-provided",
      claims: []
    });
  }
  for (const target of buildSearchTargets(searchTerms, scope)) {
    sourceRecords.push({ id: `S${sourceIndex++}`, ...target, status: "candidate", claims: [] });
  }

  if (note) {
    sourceRecords.push({ id: "U1", tier: "user-note", kind: "user-note", title: "User Raw Note", url: "", status: "provided", claims: [] });
  }

  const research = {
    agent: "Research Agent",
    game: title,
    original_game: originalTitle,
    aliases,
    slug,
    scope,
    allowed_tiers: [...allowed],
    sources: sourceRecords,
    claims: [],
    unresolved_questions: [
      "candidate source의 실제 본문 확인이 필요하다.",
      "핵심 재미와 차별점은 플레이 관찰 또는 공식 설명으로 보강해야 한다."
    ]
  };
  for (const item of genre) addResearchClaim(research, "U1", "genre", item, "medium", "user-note");
  for (const item of platform) addResearchClaim(research, "U1", "platform", item, "medium", "user-note");
  for (const item of tags) addResearchClaim(research, "U1", "tag", item, "medium", "user-note");
  if (note) addResearchClaim(research, "U1", "raw_note", note, "medium", "user-note");
  for (const alias of aliases) addResearchClaim(research, "resolver", "alias", alias, "medium", "resolver");
  return research;
}

function claimsByField(research, field) {
  return research.claims.filter((claim) => claim.field === field);
}

function citeClaims(claims, fallback = "[inference]") {
  const ids = [...new Set(claims.map((claim) => claim.source_id).filter((id) => id && id !== "resolver"))];
  return ids.length ? ids.map((id) => `[${id}]`).join("") : fallback;
}

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "accept": "application/json", "user-agent": "game-analysis-llm-wiki/1.0" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function nextNumericId(items, prefix) {
  const nums = items
    .map((item) => String(item.id || ""))
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter(Number.isFinite);
  return nums.length ? Math.max(...nums) + 1 : 1;
}

function addResearchSource(research, source) {
  const id = source.id || `S${nextNumericId(research.sources, "S")}`;
  const record = { id, claims: [], ...source };
  research.sources.push(record);
  return record;
}

function addResearchClaim(research, sourceId, field, text, confidence = "medium", claimType = "source-backed", extra = {}) {
  if (!text) return null;
  const claim = {
    id: `C${nextNumericId(research.claims, "C")}`,
    source_id: sourceId,
    field,
    text: String(text),
    confidence,
    claim_type: claimType,
    ...extra
  };
  research.claims.push(claim);
  const source = research.sources.find((item) => item.id === sourceId);
  if (source) source.claims.push(claim.id);
  return claim;
}

function sanitizeReviewText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\bgay\?\?\?\s*wtf\b/gi, "[offensive wording omitted]")
    .trim()
    .slice(0, 220);
}

async function enrichResearchFromSteam(research, searchTerms) {
  const tried = [];
  for (const term of searchTerms) {
    try {
      tried.push(term);
      const query = encodeURIComponent(term);
      const search = await fetchJson(`https://store.steampowered.com/api/storesearch/?term=${query}&l=english&cc=US`);
      const items = Array.isArray(search.items) ? search.items : [];
      const exact = items.find((item) => compactKey(item.name) === compactKey(term)) || items[0];
      if (!exact?.id) continue;
      const details = await fetchJson(`https://store.steampowered.com/api/appdetails?appids=${exact.id}&l=english&cc=US`);
      const data = details?.[exact.id]?.data;
      if (!data) continue;
      const source = addResearchSource(research, {
        tier: "tier-1",
        kind: "store",
        title: `Steam Store - ${data.name || exact.name || term}`,
        url: `https://store.steampowered.com/app/${exact.id}/`,
        status: "fetched",
        steam_appid: exact.id,
        matched_query: term
      });
      addResearchClaim(research, source.id, "title", data.name, "high");
      addResearchClaim(research, source.id, "short_description", data.short_description, "high");
      for (const genre of data.genres || []) addResearchClaim(research, source.id, "genre", genre.description, "high");
      const platforms = Object.entries(data.platforms || {}).filter(([, enabled]) => enabled).map(([name]) => name);
      for (const platform of platforms) addResearchClaim(research, source.id, "platform", platform, "high");
      for (const developer of data.developers || []) addResearchClaim(research, source.id, "developer", developer, "high");
      for (const publisher of data.publishers || []) addResearchClaim(research, source.id, "publisher", publisher, "high");
      if (data.release_date?.date) addResearchClaim(research, source.id, "release_date", data.release_date.date, "high");
      return;
    } catch (error) {
      research.unresolved_questions.push(`Steam fetch failed for "${term}": ${error.message}`);
    }
  }
  research.unresolved_questions.push(`Steam fetch did not find a usable match. tried=${tried.join(", ")}`);
}

async function enrichResearchFromWikipedia(research, searchTerms) {
  const tried = [];
  for (const term of searchTerms) {
    try {
      tried.push(term);
      const query = encodeURIComponent(`${term} video game`);
      const search = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`);
      const hit = search?.query?.search?.[0];
      if (!hit?.title) continue;
      const summary = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`);
      const source = addResearchSource(research, {
        tier: "tier-3",
        kind: "reference",
        title: `Wikipedia - ${summary.title || hit.title}`,
        url: summary?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
        status: "fetched",
        matched_query: term
      });
      addResearchClaim(research, source.id, "summary", summary.extract, "medium");
      for (const tag of inferTags(summary.extract || "")) addResearchClaim(research, source.id, "tag", tag, "medium");
      return;
    } catch (error) {
      research.unresolved_questions.push(`Wikipedia fetch failed for "${term}": ${error.message}`);
    }
  }
  research.unresolved_questions.push(`Wikipedia fetch did not find a usable match. tried=${tried.join(", ")}`);
}

async function enrichResearchFromSteamReviews(research) {
  const steamSource = research.sources.find((source) => source.status === "fetched" && source.kind === "store" && source.steam_appid);
  if (!steamSource?.steam_appid) {
    research.unresolved_questions.push("Steam review fetch skipped: no fetched Steam app id.");
    return;
  }
  try {
    const url = `https://store.steampowered.com/appreviews/${steamSource.steam_appid}?json=1&language=english&purchase_type=all&num_per_page=20&filter=recent`;
    const data = await fetchJson(url);
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    const summary = data.query_summary || {};
    const source = addResearchSource(research, {
      id: `R${nextNumericId(research.sources, "R")}`,
      tier: "tier-4",
      kind: "user-review",
      title: `Steam Reviews - ${research.game}`,
      url: `https://store.steampowered.com/app/${steamSource.steam_appid}/#app_reviews_hash`,
      status: "fetched",
      steam_appid: steamSource.steam_appid,
      review_summary: {
        total_reviews: summary.total_reviews,
        total_positive: summary.total_positive,
        total_negative: summary.total_negative,
        review_score_desc: summary.review_score_desc
      }
    });
    if (summary.review_score_desc) {
      addResearchClaim(research, source.id, "review_sentiment", summary.review_score_desc, "medium", "player-experience", { sentiment: "mixed" });
    }
    for (const review of reviews.filter((review) => review.voted_up).slice(0, 3)) {
      addResearchClaim(research, source.id, "player_praise", sanitizeReviewText(review.review), "low", "player-experience", { sentiment: "positive" });
    }
    for (const review of reviews.filter((review) => !review.voted_up).slice(0, 3)) {
      addResearchClaim(research, source.id, "player_complaint", sanitizeReviewText(review.review), "low", "player-experience", { sentiment: "negative" });
    }
    if (reviews.length) {
      addResearchClaim(research, source.id, "experience_signal", `Steam reviews fetched: ${reviews.length} samples, summary=${summary.review_score_desc || "unknown"}`, "medium", "player-experience", { sentiment: "mixed" });
    }
  } catch (error) {
    research.unresolved_questions.push(`Steam reviews fetch failed: ${error.message}`);
  }
}

async function enrichResearchFromPublicApis(research, searchTerms, options = {}) {
  const allowed = new Set(research.allowed_tiers);
  if (allowed.has("tier-1")) await enrichResearchFromSteam(research, searchTerms);
  if (allowed.has("tier-3")) await enrichResearchFromWikipedia(research, searchTerms);
  if (options.includeReviews && allowed.has("tier-4")) await enrichResearchFromSteamReviews(research);
  const fetched = research.sources.filter((source) => source.status === "fetched").length;
  if (fetched) {
    research.unresolved_questions = research.unresolved_questions.filter((item) => !item.includes("candidate source"));
  }
}

function yamlList(values) {
  const list = values.length ? values : ["조사 필요"];
  return list.map((value) => `  - ${value}`).join("\n");
}

function buildEvidenceMarkdown({ title, slug, research, note, evidenceLevel }) {
  const sourceLines = research.sources.map((source) => {
    const link = source.url ? ` - ${source.url}` : "";
    const matched = source.matched_query ? ` (matched: ${source.matched_query})` : "";
    return `- [${source.id}] ${source.tier} / ${source.kind} / ${source.status}: ${source.title}${matched}${link}`;
  });
  const claimLines = research.claims.map((claim) =>
    `- ${claim.id}: ${claim.field} = ${claim.text} (${claim.confidence}, ${claim.claim_type}, ${claim.source_id})`
  );
  return `---\ntitle: ${title} Sources\npage_type: evidence\nstatus: draft\ntags:\n  - evidence\n  - ${slug}\nlast_reviewed: ${today()}\n---\n\n# ${title} Sources\n\n## 검색 범위\n\n- scope: ${research.scope}\n- allowed tiers: ${research.allowed_tiers.join(", ")}\n- original query: ${research.original_game || research.game}\n- aliases: ${research.aliases.join(", ")}\n\n## 출처\n\n${sourceLines.length ? sourceLines.join("\n") : "- no source records"}\n\n## Claims\n\n${claimLines.length ? claimLines.join("\n") : "- no extracted claims"}\n\n## Raw Note\n\n${note || "추가 메모 없음"}\n\n## Evidence Level\n\n${evidenceLevel}\n\n## 검증 필요 사항\n\n${research.unresolved_questions.map((item) => `- ${item}`).join("\n")}\n`;
}

function buildGameMarkdown({ title, originalTitle, aliases, slug, genre, platform, evidenceLevel, coreLoop, coreLoopConfidence, mechanics, tags, note, research, qualityReport }) {
  const status = evidenceLevel === "seed" ? "needs-research" : "draft";
  const genreCite = citeClaims(claimsByField(research, "genre"));
  const platformCite = citeClaims(claimsByField(research, "platform"));
  const noteCite = citeClaims([
    ...claimsByField(research, "raw_note"),
    ...claimsByField(research, "short_description"),
    ...claimsByField(research, "summary")
  ]);
  const sourceList = research.sources.map((source) => {
    const link = source.url ? ` ${source.url}` : "";
    return `- [${source.id}] ${source.title} (${source.tier}, ${source.status})${link}`;
  });
  const loopLines = coreLoopConfidence.items.map((item, index) => {
    const cites = item.source_ids.length ? item.source_ids.map((id) => `[${id}]`).join("") : "[inference]";
    return `${index + 1}. ${item.step} ${cites} [confidence: ${item.confidence}]`;
  });
  const qualityStrengths = qualityReport.strengths.map((item) => `- ${item}`).join("\n") || "- 강점 기록 없음";
  const qualityGaps = qualityReport.gaps.map((item) => `- ${item}`).join("\n") || "- 주요 보완점 없음";
  return `---\ntitle: ${title}\npage_type: game-analysis\nstatus: ${status}\ngame_slug: ${slug}\naliases:\n${yamlList(aliases.filter((item) => item !== title))}\noriginal_query: ${originalTitle || title}\ngenre:\n${yamlList(genre)}\nplatform:\n${yamlList(platform)}\nevidence_level: ${evidenceLevel}\nquality_score: ${qualityReport.quality_score}\nquality_level: ${qualityReport.quality_level}\ncore_loop:\n${yamlList(coreLoop)}\nmechanics:\n${yamlList(mechanics)}\nsimilar_games: []\ntags:\n${yamlList(tags)}\nlast_reviewed: ${today()}\n---\n\n# ${title}\n\n## 기본 정보\n\n- 원 입력명: ${originalTitle || title}\n- 별칭: ${aliases.join(", ")}\n- 장르/태그: ${[...new Set([...genre, ...tags])].join(", ") || "조사 필요"} ${genreCite}\n- 플랫폼: ${platform.join(", ") || "조사 필요"} ${platformCite}\n- 근거 수준: ${evidenceLevel}\n- 검색 범위: ${research.scope}\n\n## 한 줄 정의\n\n${note || `${title}에 대한 초안 분석 문서입니다.`} ${noteCite}\n\n## Core Loop\n\n${loopLines.join("\n")}\n\n## 핵심 재미 가설\n\n- 현재 입력 자료 기준으로 이 게임의 재미는 선택, 반복, 보상, 숙련 또는 조합의 순환에서 발생한다고 가정한다. ${noteCite}[inference]\n- 정확한 재미 구조는 추가 플레이 관찰과 출처 검증 후 보강해야 한다.\n\n## 주요 시스템\n\n${mechanics.map((item) => `- ${item} ${noteCite}`).join("\n")}\n\n## 장르 관점과 비교\n\n- 이 문서는 태그 기반으로 분류된다. 고정 장르 폴더에 넣지 않고 여러 장르/메커니즘 태그로 검색되도록 관리한다. [inference]\n\n## 차별점 분석\n\n- 추가 조사 후 기존 유사 게임과 다른 차별점을 정리해야 한다. [inference]\n\n## 유사 게임 비교\n\n- 비교 후보는 Compare Existing Games Skill 또는 Generate Comparison Candidates 확장 Skill로 보강한다.\n\n## 분석 품질\n\n- 품질 점수: ${qualityReport.quality_score}/100\n- 품질 등급: ${qualityReport.quality_level}\n- 사실 근거 수준: ${qualityReport.evidence_level}\n- 플레이 경험 근거 수준: ${qualityReport.experience_evidence_level}\n\n### 강점\n\n${qualityStrengths}\n\n### 보완점\n\n${qualityGaps}\n\n## 근거 자료\n\n${sourceList.length ? sourceList.join("\n") : "- source record 없음"}\n- Evidence detail: wiki/evidence/${slug}-sources.md\n- Quality detail: handoffs/${slug}/08-quality-report.json\n- Core loop confidence: handoffs/${slug}/09-core-loop-confidence.json\n\n## 검증 필요 사항\n\n${research.unresolved_questions.map((item) => `- ${item}`).join("\n")}\n- 현재 문서는 Skill Runner가 생성한 초안이므로 분석 문장을 사람이 검토해야 한다.\n\n## 관련 Wiki Pages\n\n- [Evidence](../evidence/${slug}-sources.md)\n- [Wiki Index](../index.md)\n\n## 유지보수 메모\n\n- ${today()}: Analyze New Game Skill로 초안 생성.\n`;
}

function addUserReactionSections(markdown, research) {
  const praises = claimsByField(research, "player_praise");
  const complaints = claimsByField(research, "player_complaint");
  const reviewSignals = [...claimsByField(research, "review_sentiment"), ...claimsByField(research, "experience_signal")];
  const line = (claim) => `- ${claim.text} [${claim.source_id}]`;
  const section = `## 유저 반응 요약\n\n### 긍정 반응\n\n${praises.length ? praises.map(line).join("\n") : "- 수집된 긍정 리뷰 claim 없음"}\n\n### 부정 반응\n\n${complaints.length ? complaints.map(line).join("\n") : "- 수집된 부정 리뷰 claim 없음"}\n\n### 혼합 반응\n\n${reviewSignals.length ? reviewSignals.map(line).join("\n") : "- 수집된 혼합 반응 claim 없음"}\n\n## 플레이 경험 관찰\n\n- 유저 반응은 사실 정보가 아니라 플레이 경험 신호로만 사용한다. [inference]\n- 반복적으로 등장하는 반응이 충분하지 않으면 핵심 재미 판단의 confidence를 낮게 둔다.\n\n`;
  return markdown.replace("\n## 근거 자료\n", `\n${section}## 근거 자료\n`);
}

function evidenceLevelFor(research, note) {
  const confirmed = research.sources.filter((source) => source.status === "user-provided" || source.status === "fetched");
  const hasTierOne = confirmed.some((source) => source.tier === "tier-1");
  if (hasTierOne && confirmed.length >= 2) return "high";
  if (hasTierOne || confirmed.length >= 1) return "medium";
  if (note || research.claims.some((claim) => claim.source_id !== "resolver")) return "low";
  return "seed";
}

function sourceIdsForFields(research, fields) {
  return [...new Set(research.claims
    .filter((claim) => fields.includes(claim.field))
    .map((claim) => claim.source_id)
    .filter((id) => id && id !== "resolver"))];
}

function confidenceForCoreLoopStep(step, research, tags, evidenceLevel) {
  const lower = step.toLowerCase();
  const fieldMap = [
    { keys: ["환경", "탐색", "explore"], fields: ["short_description", "summary", "tag"] },
    { keys: ["자원", "수집", "resource"], fields: ["short_description", "summary"] },
    { keys: ["제작", "기지", "craft"], fields: ["short_description", "summary", "tag"] },
    { keys: ["전투", "조작", "combat", "action"], fields: ["genre", "tag", "short_description"] },
    { keys: ["런", "재시도", "위험", "보상"], fields: ["genre", "tag", "summary"] },
    { keys: ["카드", "덱", "선택지"], fields: ["genre", "tag", "summary"] }
  ];
  const matched = fieldMap.find((entry) => entry.keys.some((key) => lower.includes(key)));
  const sourceIds = matched ? sourceIdsForFields(research, matched.fields) : [];
  const tagHit = tags.some((tag) => lower.includes(tag) || tag.includes(lower));
  let confidence = "low";
  if (sourceIds.length && ["high", "medium"].includes(evidenceLevel)) confidence = "high";
  else if (sourceIds.length || tagHit || evidenceLevel === "medium") confidence = "medium";
  return {
    step,
    confidence,
    source_ids: sourceIds,
    rationale: sourceIds.length
      ? "source-backed inference"
      : tagHit
        ? "tag-backed inference"
        : "default loop inference"
  };
}

function buildCoreLoopConfidence(coreLoop, research, tags, evidenceLevel) {
  return {
    agent: "Game Analyst Agent",
    items: coreLoop.map((step) => confidenceForCoreLoopStep(step, research, tags, evidenceLevel))
  };
}

function scoreLevel(score) {
  if (score >= 80) return "strong";
  if (score >= 60) return "usable";
  if (score >= 35) return "weak";
  return "seed";
}

function buildQualityReport({ title, research, evidenceLevel, experienceEvidenceLevel, coreLoop, mechanics, validation }) {
  const fetched = research.sources.filter((source) => source.status === "fetched");
  const tierOne = fetched.filter((source) => source.tier === "tier-1");
  const reference = fetched.filter((source) => ["tier-2", "tier-3"].includes(source.tier));
  const playerExperience = research.claims.filter((claim) => claim.claim_type === "player-experience");
  const unresolvedPenalty = Math.min(15, research.unresolved_questions.length * 3);
  const score = Math.max(0, Math.min(100,
    (tierOne.length ? 25 : 0) +
    (reference.length ? 15 : 0) +
    (playerExperience.length ? 15 : 0) +
    (coreLoop.length >= 4 ? 15 : coreLoop.length * 3) +
    (mechanics.length >= 3 ? 10 : mechanics.length * 3) +
    (validation.ok ? 15 : 0) -
    unresolvedPenalty
  ));
  const strengths = [];
  const gaps = [];
  if (tierOne.length) strengths.push("공식/스토어 계열 출처가 있다.");
  else gaps.push("공식/스토어 계열 출처가 부족하다.");
  if (reference.length) strengths.push("공개 참고 출처가 있다.");
  else gaps.push("공개 참고 출처가 부족하다.");
  if (playerExperience.length) strengths.push("유저 반응/플레이 경험 신호가 있다.");
  else gaps.push("유저 반응/플레이 경험 신호가 없다.");
  if (validation.ok) strengths.push("게임 페이지 스키마 검증을 통과했다.");
  else gaps.push("게임 페이지 스키마 검증 문제가 있다.");
  if (research.unresolved_questions.length) gaps.push("검증 필요 사항이 남아 있다.");
  return {
    agent: "Quality Reviewer Agent",
    game: title,
    quality_score: score,
    quality_level: scoreLevel(score),
    evidence_level: evidenceLevel,
    experience_evidence_level: experienceEvidenceLevel,
    metrics: {
      fetched_sources: fetched.length,
      tier_one_sources: tierOne.length,
      reference_sources: reference.length,
      player_experience_claims: playerExperience.length,
      core_loop_steps: coreLoop.length,
      mechanics: mechanics.length,
      unresolved_questions: research.unresolved_questions.length,
      schema_valid: validation.ok
    },
    strengths,
    gaps
  };
}

function buildRevisionPlan({ title, evidenceLevel, validation, fetchedSources, experienceEvidenceLevel, coreLoop }) {
  const actions = [];
  if (!validation.ok) {
    actions.push({
      reason: "schema validation failed",
      action: "missing metadata or sections must be added before the page is treated as valid",
      details: { missing_metadata: validation.missing_metadata, missing_sections: validation.missing_sections }
    });
  }
  if (evidenceLevel === "seed" || !fetchedSources.length) {
    actions.push({
      reason: "no fetched source",
      action: "provide a canonical title, aliases, or official/source URLs and rerun Refresh Evidence or Analyze New Game"
    });
  }
  if (experienceEvidenceLevel === "missing") {
    actions.push({
      reason: "no player-experience signal",
      action: "run Broad scope with reviews enabled or add curated review/community source URLs"
    });
  }
  if ((coreLoop || []).length < 4) {
    actions.push({
      reason: "thin core loop",
      action: "add play observation or design notes to improve core loop analysis"
    });
  }
  return {
    agent: "Revision Agent",
    game: title,
    status: actions.length ? "needs-revision" : "no-action-needed",
    actions
  };
}

export async function analyzeNewGame(input = {}) {
  const requestedTitle = String(input.game || input.title || "").trim();
  if (!requestedTitle) throw new Error("Analyze New Game requires a game name.");
  const aliasesInput = splitList(input.aliases);
  const resolved = resolveCanonicalTitle(requestedTitle, aliasesInput);
  const title = resolved.title;
  const slug = slugify(title);
  const existingGamePath = path.join(ROOT, "wiki", "games", `${slug}.md`);
  if (fs.existsSync(existingGamePath)) {
    const existingAliases = getFrontMatterList(fs.readFileSync(existingGamePath, "utf8"), "aliases");
    resolved.aliases = [...new Set([...resolved.aliases, ...existingAliases].filter(Boolean))];
    resolved.searchTerms = [...new Set([title, resolved.original, ...resolved.aliases].filter(Boolean))];
  }
  const scope = String(input.scope || input.searchScope || "standard").trim().toLowerCase();
  const includeReviews = input.includeReviews === true || input.includeReviews === "true" || scope === "broad";
  const sources = splitList(input.sources || input.sourceUrls);
  const note = String(input.note || input.rawNote || "").trim();
  const genre = splitList(input.genre);
  const platform = splitList(input.platform);
  const baseText = `${title} ${resolved.aliases.join(" ")} ${genre.join(" ")} ${platform.join(" ")} ${note} ${sources.join(" ")}`;
  let tags = [...new Set([...genre.map(slugify), ...inferTags(baseText)])].filter(Boolean);
  const research = buildResearchPackage({
    title,
    originalTitle: resolved.original,
    aliases: resolved.aliases,
    slug,
    scope,
    sources,
    note,
    genre,
    platform,
    tags,
    searchTerms: resolved.searchTerms
  });
  await enrichResearchFromPublicApis(research, resolved.searchTerms, { includeReviews });

  const claimGenres = claimsByField(research, "genre").map((claim) => claim.text);
  const claimPlatforms = claimsByField(research, "platform").map((claim) => claim.text);
  const claimTags = claimsByField(research, "tag").map((claim) => claim.text);
  const summaryText = claimsByField(research, "summary").map((claim) => claim.text).join(" ");
  const descriptionText = claimsByField(research, "short_description").map((claim) => claim.text).join(" ");
  tags = [...new Set([...tags, ...claimGenres.map(slugify), ...claimTags, ...inferTags(`${summaryText} ${descriptionText}`)])].filter(Boolean);
  const finalGenre = genre.length ? genre : claimGenres.length ? [...new Set(claimGenres.map(slugify))] : tags.slice(0, 2);
  const finalPlatform = platform.length ? platform : [...new Set(claimPlatforms)];
  const analysisText = `${note} ${summaryText} ${descriptionText}`;
  const coreLoop = inferCoreLoop(analysisText, tags);
  const mechanics = inferMechanics(tags);
  const evidenceLevel = evidenceLevelFor(research, note);
  const experienceClaims = research.claims.filter((claim) => claim.claim_type === "player-experience");
  const experienceEvidenceLevel = experienceClaims.length >= 4 ? "medium" : experienceClaims.length ? "low" : "missing";
  const fetchedSources = research.sources.filter((source) => source.status === "fetched");
  const coreLoopConfidence = buildCoreLoopConfidence(coreLoop, research, tags, evidenceLevel);
  const base = path.join(ROOT, "handoffs", slug);

  const organized = {
    agent: "Source Organizer Agent",
    claims_by_field: research.claims.reduce((acc, claim) => {
      acc[claim.field] ||= [];
      acc[claim.field].push(claim);
      return acc;
    }, {}),
    official_or_store_sources: research.sources.filter((source) => ["tier-1", "tier-2"].includes(source.tier)),
    community_or_reference_sources: research.sources.filter((source) => ["tier-3", "tier-4"].includes(source.tier)),
    user_notes: research.sources.filter((source) => source.kind === "user-note")
  };
  const reviewed = {
    agent: "Evidence Reviewer Agent",
    evidence_level: evidenceLevel,
    fact_evidence_level: evidenceLevel,
    experience_evidence_level: experienceEvidenceLevel,
    confidence_notes: evidenceLevel === "seed"
      ? ["실제 fetch된 출처가 없어 분석 결과가 아니라 조사 필요 초안으로 처리한다."]
      : ["수집된 출처를 기반으로 draft 분석을 생성했다."]
  };
  const analysis = {
    agent: "Game Analyst Agent",
    core_loop: coreLoop,
    core_loop_confidence: coreLoopConfidence.items,
    mechanics,
    tags,
    fun_factor_hypothesis: "입력 자료 기준으로 반복 선택, 보상, 시스템 조합에서 재미가 발생한다고 가정한다.",
    differentiation_notes: ["추가 비교 분석 필요"]
  };

  writeJson(path.join(ROOT, "raw", "research", `${slug}.json`), research);
  writeJson(path.join(base, "01-research.json"), research);
  writeJson(path.join(base, "02-source-organized.json"), organized);
  writeJson(path.join(base, "03-evidence-review.json"), reviewed);
  writeJson(path.join(base, "04-analysis.json"), analysis);

  const rawPath = path.join(ROOT, "raw", "requests", `${today()}-${slug}.md`);
  writeText(rawPath, `# ${title} Analysis Request\n\n- original_game: ${resolved.original}\n- canonical_game: ${title}\n- aliases: ${resolved.aliases.join(", ")}\n- created_at: ${today()}\n- sources:\n${sources.map((source) => `  - ${source}`).join("\n") || "  - none"}\n- note: ${note || "none"}\n`);

  const evidenceMarkdown = buildEvidenceMarkdown({ title, slug, research, note, evidenceLevel });
  const evidencePath = path.join(ROOT, "wiki", "evidence", `${slug}-sources.md`);
  wikiWritePage({
    path: rel(evidencePath),
    markdown: evidenceMarkdown,
    actor: "Wiki Builder Agent",
    summary: `${title} evidence page written through MCP write tool`
  });

  const provisionalValidation = { ok: true, missing_metadata: [], missing_sections: [] };
  let qualityReport = buildQualityReport({ title, research, evidenceLevel, experienceEvidenceLevel, coreLoop, mechanics, validation: provisionalValidation });
  let gameMarkdown = addUserReactionSections(
    buildGameMarkdown({
      title,
      originalTitle: resolved.original,
      aliases: resolved.aliases,
      slug,
      genre: finalGenre,
      platform: finalPlatform,
      evidenceLevel,
      coreLoop,
      coreLoopConfidence,
      mechanics,
      tags,
      note: note || descriptionText || summaryText,
      research,
      qualityReport
    }),
    research
  );
  const gamePath = path.join(ROOT, "wiki", "games", `${slug}.md`);
  wikiWritePage({
    path: rel(gamePath),
    markdown: gameMarkdown,
    actor: "Wiki Builder Agent",
    summary: `${title} game page written through MCP write tool`
  });
  writeText(path.join(base, "05-wiki-draft.md"), gameMarkdown);

  const validation = schemaValidate({ path: rel(gamePath) });
  qualityReport = buildQualityReport({ title, research, evidenceLevel, experienceEvidenceLevel, coreLoop, mechanics, validation });
  gameMarkdown = addUserReactionSections(
    buildGameMarkdown({
      title,
      originalTitle: resolved.original,
      aliases: resolved.aliases,
      slug,
      genre: finalGenre,
      platform: finalPlatform,
      evidenceLevel,
      coreLoop,
      coreLoopConfidence,
      mechanics,
      tags,
      note: note || descriptionText || summaryText,
      research,
      qualityReport
    }),
    research
  );
  wikiWritePage({
    path: rel(gamePath),
    markdown: gameMarkdown,
    actor: "Quality Reviewer Agent",
    summary: `${title} game page rewritten with analysis quality report`
  });
  writeText(path.join(base, "05-wiki-draft.md"), gameMarkdown);
  writeJson(path.join(base, "06-final-review.json"), { agent: "Final Review Agent", validation });
  const revisionPlan = buildRevisionPlan({ title, evidenceLevel, validation, fetchedSources, experienceEvidenceLevel, coreLoop });
  writeJson(path.join(base, "07-revision-plan.json"), revisionPlan);
  writeJson(path.join(base, "08-quality-report.json"), qualityReport);
  writeJson(path.join(base, "09-core-loop-confidence.json"), coreLoopConfidence);

  appendJournal(`${title} 분석 파이프라인 실행: ${rel(gamePath)} 생성`, "Analyze New Game");
  const researchStatus = fetchedSources.length ? "completed" : "needs-research";
  const pipeline = [
    { agent: "Research Agent", status: researchStatus, summary: `Fetched ${fetchedSources.length} sources and collected ${research.claims.length} claims`, metrics: { sources: research.sources.length, fetched_sources: fetchedSources.length, claims: research.claims.length, review_claims: experienceClaims.length } },
    { agent: "Source Organizer Agent", status: "completed", summary: "Grouped fact and player-experience claims", metrics: { fact_claims: research.claims.filter((claim) => claim.claim_type !== "player-experience").length, experience_claims: experienceClaims.length } },
    { agent: "Evidence Reviewer Agent", status: evidenceLevel === "seed" ? "needs-research" : "completed", summary: `fact=${evidenceLevel}, experience=${experienceEvidenceLevel}`, metrics: { fact_evidence_level: evidenceLevel, experience_evidence_level: experienceEvidenceLevel } },
    { agent: "Game Analyst Agent", status: "completed", summary: "Generated core loop, mechanics, and fun factor hypothesis", metrics: { core_loop_steps: coreLoop.length, mechanics: mechanics.length } },
    { agent: "Quality Reviewer Agent", status: "completed", summary: `quality=${qualityReport.quality_score}/100 (${qualityReport.quality_level})`, metrics: { quality_score: qualityReport.quality_score, quality_level: qualityReport.quality_level } },
    { agent: "Wiki Builder Agent", status: "completed", summary: "Wrote evidence and game wiki pages", metrics: { pages_written: 2 } },
    { agent: "Final Review Agent", status: validation.ok && evidenceLevel !== "seed" ? "completed" : "needs-research", summary: validation.ok ? "schema.validate passed" : "schema.validate found issues", metrics: { missing_metadata: validation.missing_metadata.length, missing_sections: validation.missing_sections.length } },
    { agent: "Revision Agent", status: revisionPlan.actions.length ? "needs-revision" : "skipped", summary: revisionPlan.actions.length ? "Wrote revision plan" : "No revision action required", metrics: { actions: revisionPlan.actions.length } },
    { agent: "Maintenance Agent", status: "completed", summary: "Updated journal and returned artifacts", metrics: { artifacts: 5 } }
  ];

  return {
    ok: validation.ok && evidenceLevel !== "seed",
    status: evidenceLevel === "seed" ? "needs-research" : "completed",
    skill: "analyze-new-game",
    log: [
      `Title Resolver: ${resolved.original} -> ${title}`,
      "Research Agent completed",
      "Source Organizer Agent completed",
      "Evidence Reviewer Agent completed",
      "Game Analyst Agent completed",
      "Wiki Builder Agent completed",
      validation.ok ? "Final Review Agent passed" : "Final Review Agent found missing fields",
      evidenceLevel === "seed" ? "No fetched sources; page marked needs-research" : "Maintenance Agent updated journal"
    ],
    artifacts: [rawPath, path.join(ROOT, "raw", "research", `${slug}.json`), base, evidencePath, gamePath, path.join(base, "07-revision-plan.json"), path.join(base, "08-quality-report.json"), path.join(base, "09-core-loop-confidence.json")].map(rel),
    pipeline,
    validation
  };
}

export function compareExistingGames(input = {}) {
  const gameA = input.gameA || input.a;
  const gameB = input.gameB || input.b;
  const result = gameCompare({ gameA, gameB });
  const save = input.save === true || input.save === "true";
  const artifacts = [];
  if (save) {
    const slug = `${result.gameA.slug}-vs-${result.gameB.slug}`;
    const filePath = path.join(ROOT, "wiki", "comparisons", `${slug}.md`);
    const markdown = `---\ntitle: ${result.gameA.title} vs ${result.gameB.title}\npage_type: comparison\nstatus: draft\ntags:\n  - comparison\n  - ${result.gameA.slug}\n  - ${result.gameB.slug}\nlast_reviewed: ${today()}\n---\n\n# ${result.gameA.title} vs ${result.gameB.title}\n\n## 비교 요약\n\n${result.summary || "자동 비교 결과입니다."}\n\n## 비교 항목\n\n${result.rows.map((row) => `### ${row.axis}\n\n- ${result.gameA.title}: ${Array.isArray(row[result.gameA.slug]) ? row[result.gameA.slug].join(", ") : row[result.gameA.slug] || "정보 없음"}\n- ${result.gameB.title}: ${Array.isArray(row[result.gameB.slug]) ? row[result.gameB.slug].join(", ") : row[result.gameB.slug] || "정보 없음"}`).join("\n\n")}\n\n## 근거 문서\n\n- ${result.gameA.path}\n- ${result.gameB.path}\n`;
    writeText(filePath, markdown);
    appendJournal(`${result.gameA.title}와 ${result.gameB.title} 비교 문서 생성: ${rel(filePath)}`, "Compare Existing Games");
    artifacts.push(rel(filePath));
  }
  return { ok: true, skill: "compare-existing-games", log: ["Comparison Agent completed"], artifacts, result };
}

export function validateWikiPage(input = {}) {
  const pathValue = input.path || input.pagePath;
  const validation = schemaValidate({ path: pathValue });
  return { ok: validation.ok, skill: "validate-wiki-page", log: ["Final Review Agent completed"], artifacts: [pathValue], validation };
}

export function createDesignNote(input = {}) {
  const title = String(input.title || "Design Note").trim();
  const question = String(input.question || input.note || "").trim();
  const related = splitList(input.related || input.relatedPages);
  const tags = splitList(input.tags);
  const slug = slugify(title);
  const filePath = path.join(ROOT, "wiki", "design-notes", `${slug}.md`);
  const markdown = `---\ntitle: ${title}\npage_type: design-note\nstatus: draft\ntags:\n${yamlList(["design-note", ...tags])}\nsource_refs:\n${yamlList(related)}\nlast_reviewed: ${today()}\n---\n\n# ${title}\n\n## 질문\n\n${question || "디자인 적용 질문을 입력해야 한다."}\n\n## 요약\n\n- 관련 게임 분석을 실제 게임 개발 의사결정으로 변환하기 위한 초안이다.\n\n## 근거가 된 Wiki Pages\n\n${related.length ? related.map((item) => `- ${item}`).join("\n") : "- 추가 필요"}\n\n## 적용 가능한 디자인 원칙\n\n- 핵심 재미를 기능명이 아니라 플레이어 행동, 선택, 피드백, 반복 동기로 해석한다.\n\n## 내 게임에 적용할 때의 주의점\n\n- 직접 구현 전 플레이어 목표와 세션 구조에 맞는지 검증해야 한다.\n\n## 유지보수 메모\n\n- ${today()}: Create Design Note Skill로 생성.\n`;
  writeText(filePath, markdown);
  appendJournal(`Design Note 생성: ${rel(filePath)}`, "Create Design Note");
  return { ok: true, skill: "create-design-note", log: ["Design Note Skill completed"], artifacts: [rel(filePath)] };
}

export function updateExistingPage(input = {}) {
  const pagePath = input.path || input.pagePath;
  const request = String(input.request || input.note || "").trim();
  if (!pagePath || !request) throw new Error("Update Existing Page requires path and request.");
  const abs = path.join(ROOT, pagePath);
  if (!fs.existsSync(abs)) throw new Error(`Page not found: ${pagePath}`);
  const addition = `\n\n## Revision Note - ${today()}\n\n${request}\n`;
  fs.appendFileSync(abs, addition, "utf8");
  appendJournal(`${pagePath} 수정 요청 반영`, "Update Existing Page");
  return { ok: true, skill: "update-existing-page", log: ["Revision Agent appended requested update", "Maintenance Agent updated journal"], artifacts: [pagePath] };
}

export function editWikiSection(input = {}) {
  const pagePath = input.path || input.pagePath;
  const heading = String(input.heading || "").trim();
  const content = String(input.content || input.request || "").trim();
  if (!pagePath || !heading || !content) throw new Error("Edit Wiki Section requires path, heading, and content.");
  const result = wikiUpdatePage({
    path: pagePath,
    heading,
    content,
    actor: "Edit Wiki Section",
    summary: `${pagePath} 섹션 수정: ${heading}`
  });
  return { ok: result.ok, skill: "edit-wiki-section", log: ["Section edit completed through MCP update tool"], artifacts: [pagePath], validation: result.validation };
}

export function archiveWikiPage(input = {}) {
  const pagePath = input.path || input.pagePath;
  const reason = String(input.reason || input.note || "운영 판단에 따라 보관 처리").trim();
  if (!pagePath) throw new Error("Archive Wiki Page requires path.");
  const result = wikiArchivePage({ path: pagePath, reason, actor: "Archive Wiki Page" });
  return { ok: result.ok, skill: "archive-wiki-page", log: ["Archive completed through MCP archive tool"], artifacts: [pagePath] };
}

export function mergeDuplicatePages(input = {}) {
  const canonicalPath = input.canonicalPath || input.target || input.path;
  const duplicatePath = input.duplicatePath || input.source;
  const reason = String(input.reason || "중복 문서를 canonical page로 병합").trim();
  if (!canonicalPath || !duplicatePath) throw new Error("Merge Duplicate Pages requires canonicalPath and duplicatePath.");
  const result = wikiMergePage({ canonicalPath, duplicatePath, reason, actor: "Merge Duplicate Pages" });
  return { ok: result.ok, skill: "merge-duplicate-pages", log: ["Duplicate merge completed through MCP merge tool"], artifacts: [canonicalPath, duplicatePath] };
}

export function tagClassifyPage(input = {}) {
  const pagePath = input.path || input.pagePath;
  const tags = splitList(input.tags);
  if (!pagePath || !tags.length) throw new Error("Tag & Classify Page requires path and tags.");
  const abs = path.join(ROOT, pagePath);
  const markdown = fs.readFileSync(abs, "utf8");
  const next = setFrontMatterList(markdown, "tags", tags);
  fs.writeFileSync(abs, next, "utf8");
  appendJournal(`${pagePath} 태그 갱신: ${tags.join(", ")}`, "Tag & Classify Page");
  return { ok: true, skill: "tag-classify-page", log: ["Tag classification completed"], artifacts: [pagePath] };
}

export async function refreshEvidence(input = {}) {
  const requestedTitle = String(input.game || input.title || "Unknown Game").trim();
  const resolved = resolveCanonicalTitle(requestedTitle, splitList(input.aliases));
  const slug = slugify(resolved.title);
  const scope = String(input.scope || input.searchScope || "standard").trim().toLowerCase();
  const sources = splitList(input.sources || input.sourceUrls);
  const note = String(input.note || "").trim();
  const research = buildResearchPackage({
    title: resolved.title,
    originalTitle: resolved.original,
    aliases: resolved.aliases,
    slug,
    scope,
    sources,
    note,
    genre: [],
    platform: [],
    tags: inferTags(`${resolved.title} ${resolved.aliases.join(" ")} ${note} ${sources.join(" ")}`),
    searchTerms: resolved.searchTerms
  });
  await enrichResearchFromPublicApis(research, resolved.searchTerms);
  const evidenceLevel = evidenceLevelFor(research, note);
  const filePath = path.join(ROOT, "wiki", "evidence", `${slug}-sources.md`);
  writeText(filePath, buildEvidenceMarkdown({ title: resolved.title, slug, research, note, evidenceLevel }));
  appendJournal(`${resolved.title} 근거 문서 갱신: ${rel(filePath)}`, "Refresh Evidence");
  return { ok: true, skill: "refresh-evidence", log: ["Evidence refresh completed"], artifacts: [rel(filePath)] };
}

export function maintenanceSweep() {
  const pages = wikiSearch({ query: "" }).results;
  const gamePages = pages.filter((page) => page.page_type === "game-analysis");
  const validations = gamePages.map((page) => schemaValidate({ path: page.path }));
  const report = {
    date: today(),
    page_count: pages.length,
    game_page_count: gamePages.length,
    invalid_game_pages: validations.filter((item) => !item.ok),
    needs_research_pages: gamePages.filter((page) =>
      !["deprecated", "archived"].includes(page.status) &&
      (page.status === "needs-research" || page.evidence_level === "seed")
    )
  };
  const filePath = path.join(ROOT, "maintenance", `sweep-${today()}.json`);
  writeJson(filePath, report);
  appendJournal(`Maintenance Sweep 실행: ${rel(filePath)}`, "Maintenance Sweep");
  return { ok: report.invalid_game_pages.length === 0, skill: "maintenance-sweep", log: ["Maintenance sweep completed"], artifacts: [rel(filePath)], report };
}

export function qualityBackfill(input = {}) {
  const requestedPath = String(input.path || input.pagePath || "").trim().replaceAll("\\", "/");
  const includeDeprecated = input.includeDeprecated === true || input.includeDeprecated === "true";
  const pages = wikiSearch({ query: "", filters: ["game-analysis"] }).results
    .filter((page) => !requestedPath || page.path === requestedPath || page.slug === requestedPath)
    .filter((page) => includeDeprecated || !["deprecated", "archived"].includes(page.status));
  if (requestedPath && !pages.length) throw new Error(`No active game page found for quality backfill: ${requestedPath}`);

  const results = [];
  const artifacts = [];
  for (const page of pages) {
    const abs = path.join(ROOT, page.path);
    const current = fs.readFileSync(abs, "utf8");
    const parsed = researchFromExistingGamePage(current, page);
    const validationBefore = schemaValidate({ path: page.path });
    const experienceEvidenceLevel = parsed.research.claims.some((claim) => claim.claim_type === "player-experience") ? "medium" : "missing";
    const coreLoop = parsed.coreLoop.length ? parsed.coreLoop : inferCoreLoop(current, parsed.tags);
    const mechanics = parsed.mechanics.length ? parsed.mechanics : inferMechanics(parsed.tags);
    const coreLoopConfidence = buildCoreLoopConfidence(coreLoop, parsed.research, parsed.tags, parsed.evidenceLevel);
    const qualityReport = buildQualityReport({
      title: parsed.title,
      research: parsed.research,
      evidenceLevel: parsed.evidenceLevel,
      experienceEvidenceLevel,
      coreLoop,
      mechanics,
      validation: validationBefore
    });

    let next = current;
    next = setFrontMatterScalar(next, "quality_score", qualityReport.quality_score);
    next = setFrontMatterScalar(next, "quality_level", qualityReport.quality_level);
    next = setFrontMatterList(next, "core_loop", coreLoop);
    next = setFrontMatterList(next, "mechanics", mechanics);
    next = setFrontMatterScalar(next, "last_reviewed", today());
    next = replaceOrInsertSection(next, "Core Loop", buildCoreLoopSection(coreLoopConfidence), /^##\s+.*?(핵심 재미|주요 시스템|주요|System)/m);
    next = replaceOrInsertSection(next, "분석 품질", buildQualitySection(qualityReport));

    const update = wikiUpdatePage({
      path: page.path,
      markdown: next,
      actor: "Quality Backfill",
      summary: `${parsed.title} quality metadata backfilled`
    });

    const handoffDir = path.join(ROOT, "handoffs", parsed.slug);
    const qualityPath = path.join(handoffDir, "08-quality-report.json");
    const confidencePath = path.join(handoffDir, "09-core-loop-confidence.json");
    writeJson(qualityPath, qualityReport);
    writeJson(confidencePath, coreLoopConfidence);

    results.push({
      title: parsed.title,
      path: page.path,
      validation_ok: update.validation.ok,
      quality_score: qualityReport.quality_score,
      quality_level: qualityReport.quality_level,
      core_loop_confidence_items: coreLoopConfidence.items.length,
      gaps: qualityReport.gaps
    });
    artifacts.push(page.path, rel(qualityPath), rel(confidencePath));
  }

  const report = {
    date: today(),
    updated_pages: results.length,
    results
  };
  const reportPath = path.join(ROOT, "maintenance", `quality-backfill-${today()}.json`);
  writeJson(reportPath, report);
  appendJournal(`Quality Backfill 실행: ${results.length} game pages updated`, "Quality Backfill");
  artifacts.push(rel(reportPath));
  return {
    ok: results.every((item) => item.validation_ok),
    skill: "quality-backfill",
    log: ["Quality Reviewer Agent backfilled existing game pages", "Maintenance Agent wrote quality report artifacts"],
    artifacts: [...new Set(artifacts)],
    report
  };
}

export async function runSkill(input = {}) {
  const skill = input.skill || input.name;
  if (skill === "analyze-new-game") return await analyzeNewGame(input);
  if (skill === "compare-existing-games") return compareExistingGames(input);
  if (skill === "validate-wiki-page") return validateWikiPage(input);
  if (skill === "create-design-note") return createDesignNote(input);
  if (skill === "update-existing-page") return updateExistingPage(input);
  if (skill === "edit-wiki-section") return editWikiSection(input);
  if (skill === "archive-wiki-page") return archiveWikiPage(input);
  if (skill === "merge-duplicate-pages") return mergeDuplicatePages(input);
  if (skill === "tag-classify-page") return tagClassifyPage(input);
  if (skill === "refresh-evidence") return await refreshEvidence(input);
  if (skill === "maintenance-sweep") return maintenanceSweep(input);
  if (skill === "quality-backfill") return qualityBackfill(input);
  throw new Error(`Unknown skill: ${skill}`);
}

async function runCli() {
  const [, , skill, ...rest] = process.argv;
  const input = { skill };
  for (let i = 0; i < rest.length; i += 1) {
    if (!rest[i]?.startsWith("--")) continue;
    const key = rest[i].replace(/^--/, "");
    const values = [];
    i += 1;
    while (i < rest.length && !rest[i].startsWith("--")) {
      values.push(rest[i]);
      i += 1;
    }
    i -= 1;
    if (key) input[key] = values.join(" ");
  }
  console.log(JSON.stringify(await runSkill(input), null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runCli().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
