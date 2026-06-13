const groups = [
  { id: "all", label: "All", match: () => true },
  { id: "games", label: "Games", match: (item) => item.page_type === "game-analysis" },
  { id: "comparisons", label: "Comparisons", match: (item) => item.page_type === "comparison" },
  { id: "design-notes", label: "Design Notes", match: (item) => item.page_type === "design-note" || item.path.includes("/design-notes/") },
  { id: "research", label: "Research Logs", match: (item) => item.page_type === "evidence" || item.path.includes("/evidence/") },
  { id: "knowledge", label: "Knowledge Base", match: (item) => ["genre", "mechanic", "wiki"].includes(item.page_type) }
];

const resultsEl = document.querySelector("#results");
const pageEl = document.querySelector("#page");
const searchEl = document.querySelector("#search");
const countEl = document.querySelector("#page-count");
const tagPanelEl = document.querySelector("#tag-panel");
const groupTabsEl = document.querySelector("#group-tabs");
const skillSelectEl = document.querySelector("#skill-select");
const skillFormEl = document.querySelector("#skill-form");
const skillOutputEl = document.querySelector("#skill-output");
const pageStatusEl = document.querySelector("#page-status");
const screenshotModeEl = document.querySelector("#screenshot-mode");

const initialParams = new URLSearchParams(window.location.search);
let selectedPath = initialParams.get("page") || "wiki/games/slay-the-spire.md";
let selectedGroup = initialParams.get("group") || "games";
let selectedTag = "";
let allPages = [];

if (initialParams.get("screenshot") === "1") {
  document.body.classList.add("screenshot-mode");
  if (screenshotModeEl) screenshotModeEl.textContent = "Exit Screenshot Mode";
}

function isHiddenOperationalPage(item) {
  return ["deprecated", "archived"].includes(item.status);
}

function visibleBasePages() {
  return allPages.filter((item) => !isHiddenOperationalPage(item));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMarkdownLegacy(markdown) {
  const body = markdown.replace(/^---[\s\S]*?---\s*/, "");
  return body
    .split(/\r?\n/)
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      if (line.startsWith("### ")) return `<h3>${escapeHtml(line.slice(4))}</h3>`;
      if (line.startsWith("- ")) return `<p class="bullet">• ${escapeHtml(line.slice(2))}</p>`;
      if (/^\d+\.\s/.test(line)) return `<p class="bullet">${escapeHtml(line)}</p>`;
      if (!line.trim()) return "";
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("");
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line || "");
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines, startIndex) {
  const headers = splitTableRow(lines[startIndex]);
  const rows = [];
  let index = startIndex + 2;
  while (index < lines.length && /^\s*\|/.test(lines[index]) && !isTableSeparator(lines[index])) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }
  const head = headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${escapeHtml(row[cellIndex] || "")}</td>`).join("")}</tr>`)
    .join("");
  return {
    html: `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`,
    nextIndex: index
  };
}

function renderMarkdown(markdown) {
  const body = markdown.replace(/^---[\s\S]*?---\s*/, "");
  const lines = body.split(/\r?\n/);
  const html = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*\|/.test(line) && isTableSeparator(lines[index + 1])) {
      const table = renderTable(lines, index);
      html.push(table.html);
      index = table.nextIndex - 1;
      continue;
    }
    if (line.startsWith("# ")) html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
    else if (line.startsWith("## ")) html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    else if (line.startsWith("### ")) html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    else if (line.startsWith("- ")) html.push(`<p class="bullet">• ${escapeHtml(line.slice(2))}</p>`);
    else if (/^\d+\.\s/.test(line)) html.push(`<p class="bullet">${escapeHtml(line)}</p>`);
    else if (!line.trim()) html.push("");
    else html.push(`<p>${escapeHtml(line)}</p>`);
  }
  return html.join("");
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function compact(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function getDateValue(item) {
  const date = item.last_reviewed || "0000-00-00";
  return Number(date.replaceAll("-", ""));
}

function getVisiblePages() {
  const query = searchEl.value.trim().toLowerCase();
  const compactQuery = compact(query);
  const group = groups.find((entry) => entry.id === selectedGroup) || groups[0];
  return visibleBasePages()
    .filter(group.match)
    .filter((item) => !selectedTag || item.tags.includes(selectedTag))
    .filter((item) => {
      if (!query) return true;
      const haystack = [item.title, item.path, item.page_type, item.slug, ...(item.aliases || []), ...(item.tags || [])].join(" ").toLowerCase();
      return haystack.includes(query) || compact(haystack).includes(compactQuery);
    })
    .sort((a, b) => getDateValue(b) - getDateValue(a) || a.title.localeCompare(b.title));
}

function qualityClass(item) {
  const level = String(item.quality_level || "").toLowerCase();
  if (["strong", "usable", "weak", "seed"].includes(level)) return level;
  const score = Number(item.quality_score);
  if (score >= 80) return "strong";
  if (score >= 60) return "usable";
  if (score >= 35) return "weak";
  return "seed";
}

function qualityBadge(item) {
  if (item.page_type !== "game-analysis" || item.quality_score === "" || item.quality_score == null) return "";
  const score = Number(item.quality_score);
  const label = item.quality_level || qualityClass(item);
  return `<b class="quality-badge ${qualityClass(item)}">Q ${Number.isFinite(score) ? score : "?"} · ${escapeHtml(label)}</b>`;
}

function renderGroups() {
  groupTabsEl.innerHTML = groups.map((group) => `
    <button class="group-tab ${group.id === selectedGroup ? "active" : ""}" data-group="${group.id}">
      ${group.label}
    </button>
  `).join("");
}

function renderTags() {
  const tags = [...new Set(visibleBasePages().flatMap((item) => item.tags || []))]
    .filter((tag) =>
      tag &&
      !tag.includes("analysis") &&
      tag !== "evidence" &&
      !tag.endsWith("-sources")
    )
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 32);
  tagPanelEl.innerHTML = [
    `<button class="tag-chip ${selectedTag === "" ? "active" : ""}" data-tag="">all tags</button>`,
    ...tags.map((tag) => `<button class="tag-chip ${tag === selectedTag ? "active" : ""}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`)
  ].join("");
}

function renderResults() {
  const visible = getVisiblePages();
  countEl.textContent = `${visible.length} shown · ${visibleBasePages().length} active · ${allPages.length} total`;
  resultsEl.innerHTML = visible.map((item) => `
    <button class="result ${item.path === selectedPath ? "active" : ""}" data-path="${item.path}">
      <span class="result-title">${escapeHtml(item.title)}${qualityBadge(item)}</span>
      <small>${escapeHtml(item.page_type)} · ${escapeHtml(item.status || "draft")} · ${escapeHtml(item.last_reviewed || "no date")}</small>
      <em>${(item.tags || []).slice(0, 4).map(escapeHtml).join(" · ")}</em>
    </button>
  `).join("") || `<div class="empty">조건에 맞는 문서가 없습니다.</div>`;
}

function gameOptions() {
  return visibleBasePages()
    .filter((item) => item.page_type === "game-analysis")
    .map((item) => `<option value="${escapeHtml(item.slug)}">${escapeHtml(item.title)}</option>`)
    .join("");
}

function renderSkillForm() {
  const skill = skillSelectEl.value;
  if (skill === "analyze-new-game") {
    skillFormEl.innerHTML = `
      <label class="field-label">Game Name</label>
      <input name="game" placeholder="서브나우티카2 또는 Subnautica 2" />
      <label class="field-label">Aliases</label>
      <input name="aliases" placeholder="서브노티카2, Subnautica2" />
      <label class="field-label">Search Scope</label>
      <select name="scope">
        <option value="standard">Standard: official/store + public references</option>
        <option value="conservative">Conservative: official/store/press only</option>
        <option value="broad">Broad: include reviews/community targets</option>
      </select>
      <label class="check-row"><input type="checkbox" name="includeReviews" value="true" /> Include player reviews when available</label>
      <label class="field-label">Optional Source URLs</label>
      <textarea name="sources" placeholder="알고 있는 공식/스토어/참고 URL이 있으면 입력"></textarea>
      <label class="field-label">Optional Raw Note</label>
      <textarea name="note" placeholder="관찰한 핵심 재미, 장르 힌트, 시스템 메모"></textarea>
      <label class="field-label">Optional Tags</label>
      <input name="genre" placeholder="survival, crafting, exploration" />
      <label class="field-label">Optional Platform</label>
      <input name="platform" placeholder="PC, Xbox" />
    `;
    return;
  }
  if (skill === "compare-existing-games") {
    skillFormEl.innerHTML = `
      <label class="field-label">Game A</label>
      <select name="gameA">${gameOptions()}</select>
      <label class="field-label">Game B</label>
      <select name="gameB">${gameOptions()}</select>
      <label class="check-row"><input type="checkbox" name="save" value="true" /> comparison 문서로 저장</label>
    `;
    return;
  }
  if (skill === "update-existing-page") {
    skillFormEl.innerHTML = `
      <label class="field-label">Target Page</label>
      <input name="path" value="${escapeHtml(selectedPath)}" />
      <label class="field-label">Update Request</label>
      <textarea name="request" placeholder="추가하거나 수정할 내용을 기록합니다."></textarea>
    `;
    return;
  }
  if (skill === "edit-wiki-section") {
    skillFormEl.innerHTML = `
      <label class="field-label">Target Page</label>
      <input name="path" value="${escapeHtml(selectedPath)}" />
      <label class="field-label">Heading</label>
      <input name="heading" placeholder="차별점 분석" />
      <label class="field-label">New Section Content</label>
      <textarea name="content" placeholder="해당 섹션에 들어갈 본문을 입력합니다."></textarea>
    `;
    return;
  }
  if (skill === "archive-wiki-page") {
    skillFormEl.innerHTML = `
      <label class="field-label">Target Page</label>
      <input name="path" value="${escapeHtml(selectedPath)}" />
      <label class="field-label">Archive Reason</label>
      <textarea name="reason" placeholder="왜 보관 처리하는지 기록합니다."></textarea>
    `;
    return;
  }
  if (skill === "merge-duplicate-pages") {
    skillFormEl.innerHTML = `
      <label class="field-label">Canonical Page</label>
      <input name="canonicalPath" placeholder="wiki/games/subnautica-2.md" />
      <label class="field-label">Duplicate Page</label>
      <input name="duplicatePath" value="${escapeHtml(selectedPath)}" />
      <label class="field-label">Reason</label>
      <textarea name="reason" placeholder="한글/영문 중복 생성 등 병합 사유"></textarea>
    `;
    return;
  }
  if (skill === "create-design-note") {
    skillFormEl.innerHTML = `
      <label class="field-label">Title</label>
      <input name="title" placeholder="Survival Exploration Design Note" />
      <label class="field-label">Question</label>
      <textarea name="question" placeholder="기존 분석을 내 게임에 어떻게 적용할지 질문을 적어주세요."></textarea>
      <label class="field-label">Related Pages</label>
      <input name="related" value="${escapeHtml(selectedPath)}" />
      <label class="field-label">Tags</label>
      <input name="tags" placeholder="design-note, core-loop, survival" />
    `;
    return;
  }
  if (skill === "validate-wiki-page") {
    skillFormEl.innerHTML = `
      <label class="field-label">Target Page</label>
      <input name="path" value="${escapeHtml(selectedPath)}" />
    `;
    return;
  }
  if (skill === "tag-classify-page") {
    skillFormEl.innerHTML = `
      <label class="field-label">Target Page</label>
      <input name="path" value="${escapeHtml(selectedPath)}" />
      <label class="field-label">Tags</label>
      <input name="tags" placeholder="survival, crafting, exploration" />
    `;
    return;
  }
  if (skill === "refresh-evidence") {
    skillFormEl.innerHTML = `
      <label class="field-label">Game Name</label>
      <input name="game" placeholder="Subnautica 2" />
      <label class="field-label">Aliases</label>
      <input name="aliases" placeholder="서브나우티카2, 서브노티카2" />
      <label class="field-label">Search Scope</label>
      <select name="scope">
        <option value="standard">Standard</option>
        <option value="conservative">Conservative</option>
        <option value="broad">Broad</option>
      </select>
      <label class="field-label">Source URLs</label>
      <textarea name="sources" placeholder="공식 사이트, Steam, 리뷰 자료"></textarea>
      <label class="field-label">Evidence Note</label>
      <textarea name="note" placeholder="출처 갱신 메모"></textarea>
    `;
    return;
  }
  skillFormEl.innerHTML = `<p class="assistant-note">전체 Wiki를 점검하고 maintenance report를 생성합니다.</p>`;
  if (skill === "quality-backfill") {
    skillFormEl.innerHTML = `
      <label class="field-label">Target Page</label>
      <input name="path" value="${escapeHtml(selectedPath)}" placeholder="Leave empty to update all active game pages" />
      <label class="check-row"><input type="checkbox" name="includeDeprecated" value="true" /> Include deprecated / archived pages</label>
      <p class="assistant-note">기존 게임 문서의 품질 점수, 품질 등급, Core Loop confidence, handoff report를 보강합니다.</p>
    `;
    return;
  }
  if (skill === "source-coverage-backfill") {
    skillFormEl.innerHTML = `
      <label class="field-label">Target Page</label>
      <input name="path" value="${escapeHtml(selectedPath)}" placeholder="Leave empty to update all active game pages" />
      <label class="check-row"><input type="checkbox" name="includeDeprecated" value="true" /> Include deprecated / archived pages</label>
      <p class="assistant-note">Existing game pages keep their text, while source_agents, source_coverage, trust_flags, and source-agent handoffs are backfilled from current evidence.</p>
    `;
    return;
  }
}

function readSkillForm() {
  const data = { skill: skillSelectEl.value };
  const formData = new FormData(skillFormEl);
  for (const [key, value] of formData.entries()) {
    if (data[key]) data[key] = `${data[key]},${value}`;
    else data[key] = value;
  }
  for (const checkbox of skillFormEl.querySelectorAll("input[type='checkbox']")) {
    if (!checkbox.checked && checkbox.name) data[checkbox.name] = "false";
  }
  return data;
}

function renderRunning(payload) {
  const steps = [
    "Research Orchestrator",
    "Official Source Agent",
    "Storefront Agent",
    "Community Agent",
    "Gameplay Evidence Agent",
    "Cross-Check Agent",
    "Synthesis Agent",
    "Quality Reviewer Agent",
    "Wiki Builder Agent",
    "Final Review Agent"
  ];
  skillOutputEl.innerHTML = `
    <div class="run-status">
      <strong>${escapeHtml(payload.skill)}</strong>
      <span>running</span>
    </div>
    <div class="pipeline-list">
      ${steps.map((step, index) => `
        <div class="pipeline-card pending">
          <b>${index + 1}. ${step}</b>
          <p>대기 또는 실행 중</p>
        </div>
      `).join("")}
    </div>
    <p class="assistant-note">공개 API와 별칭 검색어를 사용합니다. 실제 출처 fetch가 없으면 needs-research로 표시됩니다.</p>
  `;
}

function renderSkillResult(data, ok) {
  const pipeline = data.pipeline || [];
  const status = data.status || (data.ok === false ? "needs-attention" : "completed");
  skillOutputEl.innerHTML = `
    <div class="run-status">
      <strong>${escapeHtml(data.skill || "skill")}</strong>
      <span class="${ok && data.ok !== false ? "ok" : "fail"}">${escapeHtml(status)}</span>
    </div>
    ${pipeline.length ? `
      <div class="pipeline-list">
        ${pipeline.map((step, index) => `
          <div class="pipeline-card ${escapeHtml(step.status || "completed")}">
            <b>${index + 1}. ${escapeHtml(step.agent)}</b>
            <p>${escapeHtml(step.summary || "")}</p>
            <small>${escapeHtml(JSON.stringify(step.metrics || {}))}</small>
          </div>
        `).join("")}
      </div>
    ` : `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`}
    <div class="artifact-list">
      <strong>Artifacts</strong>
      ${(data.artifacts || []).map((item) => `<code>${escapeHtml(item)}</code>`).join("") || "<p>none</p>"}
    </div>
  `;
}

function statusPill(label, value, tone = "neutral") {
  return `<span class="status-pill ${tone}"><b>${escapeHtml(label)}</b>${escapeHtml(value)}</span>`;
}

function qualityTone(metadata = {}) {
  const level = String(metadata.quality_level || "").toLowerCase();
  if (level === "strong") return "ok";
  if (level === "usable") return "info";
  if (level === "weak") return "warn";
  return "fail";
}

function validationTone(validation) {
  if (!validation) return "neutral";
  return validation.ok ? "ok" : "fail";
}

function evidenceTone(level) {
  if (level === "high") return "ok";
  if (level === "medium") return "info";
  if (level === "low") return "warn";
  return "fail";
}

function coverageItems(metadata = {}) {
  const covered = new Set(listValue(metadata.source_coverage).map((item) => String(item).toLowerCase()));
  return [
    ["official", "Official"],
    ["storefront", "Storefront"],
    ["reference", "Reference"],
    ["community", "Community"],
    ["critic", "Critic"]
  ].map(([id, label]) => ({ id, label, covered: covered.has(id) }));
}

function renderCoverageBadges(metadata = {}) {
  const items = coverageItems(metadata);
  return `
    <div class="coverage-strip">
      ${items.map((item) => `
        <span class="coverage-badge ${item.covered ? "covered" : "missing"}">
          <b>${escapeHtml(item.label)}</b>${item.covered ? "covered" : "missing"}
        </span>
      `).join("")}
    </div>
  `;
}

function renderPageStatus(page, validation = null) {
  const metadata = page.metadata || {};
  const isGame = page.page_type === "game-analysis";
  const quality = metadata.quality_score != null && metadata.quality_score !== ""
    ? `${metadata.quality_score} · ${metadata.quality_level || "unrated"}`
    : "not scored";
  const schemaSummary = validation
    ? validation.ok ? "OK" : `needs fix (${[...validation.missing_metadata, ...validation.missing_sections].length})`
    : "not required";
  const pipelineSteps = isGame
    ? [
        ["Research Agent", metadata.evidence_level && metadata.evidence_level !== "seed" ? "completed" : "needs-research", `evidence=${metadata.evidence_level || "unknown"}`],
        ["Game Analyst Agent", metadata.core_loop?.length ? "completed" : "needs-attention", `${metadata.core_loop?.length || 0} core loop steps`],
        ["Quality Reviewer Agent", metadata.quality_score ? "completed" : "needs-attention", `quality=${quality}`],
        ["Wiki Builder Agent", "completed", "page loaded from wiki/"],
        ["Final Review Agent", validation?.ok ? "completed" : "needs-attention", `schema=${schemaSummary}`]
      ]
    : [
        ["Wiki Reader", "completed", "page loaded from wiki/"],
        ["Schema Review", "skipped", "game schema applies to game pages only"]
      ];

  pageStatusEl.innerHTML = `
    <div class="status-grid">
      ${statusPill("type", page.page_type || "wiki", "neutral")}
      ${statusPill("schema", schemaSummary, validationTone(validation))}
      ${statusPill("evidence", metadata.evidence_level || "n/a", evidenceTone(metadata.evidence_level))}
      ${statusPill("quality", quality, qualityTone(metadata))}
      ${statusPill("coverage", `${listValue(metadata.source_coverage).length || 0}/5`, listValue(metadata.source_coverage).length >= 3 ? "ok" : "warn")}
      ${statusPill("trust flags", `${listValue(metadata.trust_flags).length || 0}`, listValue(metadata.trust_flags).length ? "warn" : "ok")}
    </div>
    ${isGame ? renderCoverageBadges(metadata) : ""}
    <div class="pipeline-list compact">
      ${pipelineSteps.map((step, index) => `
        <div class="pipeline-card ${escapeHtml(step[1])}">
          <b>${index + 1}. ${escapeHtml(step[0])}</b>
          <p>${escapeHtml(step[2])}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function currentSummary(page) {
  return allPages.find((item) => item.path === page.path) || {};
}

function listValue(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function compareCandidates(page) {
  const metadata = page.metadata || {};
  const ownTags = new Set([
    ...listValue(metadata.tags),
    ...listValue(metadata.genre),
    ...listValue(metadata.mechanics)
  ].map((item) => String(item).toLowerCase()));
  if (!ownTags.size) return [];
  return visibleBasePages()
    .filter((item) => item.page_type === "game-analysis" && item.path !== page.path)
    .map((item) => {
      const tags = new Set((item.tags || []).map((tag) => String(tag).toLowerCase()));
      const shared = [...ownTags].filter((tag) => tags.has(tag));
      return { item, shared };
    })
    .filter((entry) => entry.shared.length)
    .sort((a, b) => b.shared.length - a.shared.length || a.item.title.localeCompare(b.item.title))
    .slice(0, 3);
}

function qualityAdvice(metadata = {}) {
  const level = String(metadata.quality_level || "").toLowerCase();
  const evidence = String(metadata.evidence_level || "").toLowerCase();
  const advice = [];
  if (["seed", "weak"].includes(level)) advice.push("Run Refresh Evidence with Broad scope.");
  if (["seed", "low"].includes(evidence)) advice.push("Add official/store or public reference sources.");
  if (!metadata.quality_score) advice.push("Run Quality Backfill.");
  if (!advice.length) advice.push("Ready for comparison or design-note reuse.");
  return advice;
}

function renderMetaBadge(label, value, tone = "neutral") {
  return `<span class="meta-badge ${tone}"><b>${escapeHtml(label)}</b>${escapeHtml(value)}</span>`;
}

function renderCoreLoopFlow(metadata = {}) {
  const steps = listValue(metadata.core_loop);
  if (!steps.length) return "";
  return `
    <section class="analysis-panel">
      <h2>Core Loop Flow</h2>
      <div class="core-flow">
        ${steps.slice(0, 7).map((step, index) => `
          <div class="core-step">
            <span>${index + 1}</span>
            <strong>${escapeHtml(step)}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderEvidenceCoverage(metadata = {}) {
  const flags = listValue(metadata.trust_flags);
  return `
    <section class="analysis-panel">
      <h2>Evidence Coverage</h2>
      ${renderCoverageBadges(metadata)}
      <div class="trust-flags">
        <strong>Trust Flags</strong>
        ${flags.length
          ? flags.slice(0, 4).map((flag) => `<span>${escapeHtml(flag)}</span>`).join("")
          : "<span>none</span>"}
      </div>
    </section>
  `;
}

function renderCompareRecommendations(page) {
  const candidates = compareCandidates(page);
  if (!candidates.length) return "";
  return `
    <section class="analysis-panel">
      <h2>Comparison Candidates</h2>
      <div class="recommendation-list">
        ${candidates.map(({ item, shared }) => `
          <button class="recommendation-card" data-path="${escapeHtml(item.path)}">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(shared.slice(0, 4).join(" · "))}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderQualityAdvice(metadata = {}) {
  const level = String(metadata.quality_level || "").toLowerCase();
  const tone = ["strong", "usable"].includes(level) ? "ok" : "warn";
  return `
    <section class="analysis-panel ${tone}">
      <h2>Quality Guidance</h2>
      <ul class="guidance-list">
        ${qualityAdvice(metadata).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderPageOverview(page, validation) {
  const metadata = page.metadata || {};
  const summary = currentSummary(page);
  if (page.page_type !== "game-analysis") return "";
  const quality = metadata.quality_score != null && metadata.quality_score !== ""
    ? `${metadata.quality_score} · ${metadata.quality_level || "unrated"}`
    : "not scored";
  const schema = validation?.ok ? "OK" : "needs fix";
  return `
    <section class="page-overview">
      <div class="meta-badges">
        ${renderMetaBadge("type", page.page_type, "neutral")}
        ${renderMetaBadge("schema", schema, validation?.ok ? "ok" : "fail")}
        ${renderMetaBadge("evidence", metadata.evidence_level || "n/a", evidenceTone(metadata.evidence_level))}
        ${renderMetaBadge("quality", quality, qualityTone(metadata))}
        ${renderMetaBadge("status", metadata.status || summary.status || "draft", "neutral")}
      </div>
      <div class="analysis-grid">
        ${renderEvidenceCoverage(metadata)}
        ${renderCoreLoopFlow(metadata)}
        ${renderCompareRecommendations(page)}
        ${renderQualityAdvice(metadata)}
      </div>
    </section>
  `;
}

async function loadSearch() {
  const data = await getJson("/api/search?q=");
  allPages = data.results;
  renderGroups();
  renderTags();
  renderResults();
  renderSkillForm();
}

async function loadPage(pagePath) {
  selectedPath = pagePath;
  const data = await getJson(`/api/page?path=${encodeURIComponent(pagePath)}`);
  const validation = data.page_type === "game-analysis"
    ? await getJson(`/api/validate?path=${encodeURIComponent(pagePath)}`)
    : null;
  pageEl.innerHTML = renderPageOverview(data, validation) + renderMarkdown(data.markdown);
  renderPageStatus(data, validation);
  renderResults();
  renderSkillForm();
}

groupTabsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-group]");
  if (!button) return;
  selectedGroup = button.dataset.group;
  renderGroups();
  renderResults();
});

tagPanelEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tag]");
  if (!button) return;
  selectedTag = button.dataset.tag;
  renderTags();
  renderResults();
});

resultsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-path]");
  if (button) loadPage(button.dataset.path);
});

pageEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-path]");
  if (button) loadPage(button.dataset.path);
});

searchEl.addEventListener("input", renderResults);
skillSelectEl.addEventListener("change", renderSkillForm);

screenshotModeEl.addEventListener("click", () => {
  document.body.classList.toggle("screenshot-mode");
  screenshotModeEl.textContent = document.body.classList.contains("screenshot-mode")
    ? "Exit Screenshot Mode"
    : "Screenshot Mode";
});

document.querySelector("#skill-run").addEventListener("click", async () => {
  const button = document.querySelector("#skill-run");
  const payload = readSkillForm();
  button.disabled = true;
  button.textContent = "Running...";
  renderRunning(payload);
  try {
    const res = await fetch("/api/skill/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    renderSkillResult(data, res.ok && data.ok !== false);
    await loadSearch();
    if (data.artifacts?.find((item) => item.startsWith("wiki/"))) {
      const page = data.artifacts.find((item) => item.startsWith("wiki/games/") || item.startsWith("wiki/design-notes/") || item.startsWith("wiki/comparisons/"));
      if (page) await loadPage(page);
    }
  } catch (error) {
    skillOutputEl.innerHTML = `<div class="run-status"><strong>failed</strong><span class="fail">failed</span></div><pre>${escapeHtml(error.message)}</pre>`;
  } finally {
    button.disabled = false;
    button.textContent = "Run Skill";
  }
});

loadSearch()
  .then(() => loadPage(selectedPath))
  .catch((error) => {
    skillOutputEl.textContent = error.message;
  });
