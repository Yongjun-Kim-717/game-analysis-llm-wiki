# Game Analysis LLM Wiki

Markdown, MCP tools, local skills, and a browser viewer for building a personal game analysis wiki.

This repository is an executable LLM Wiki product. A new user can clone it, enter one game name, generate a wiki page, validate it, compare games, and view the result in a browser without using an API key.

## What This Includes

- Harness: `AGENTS.md`, `RULES.md`, `skills/`, `agents/`, `pipeline/`
- LLM Wiki: `raw/`, `wiki/`, `SCHEMA.md`, `templates/`, `schemas/`
- MCP Tools: `tools/mcp-server/`
- Skill Runner: `tools/skill-runner.js`
- Viewer: `viewer/` and `tools/viewer-server.js`
- Demo proof: `demo/mvp-screenshot.png`

## Requirements

- Node.js 18 or newer
- No API key is required
- No external package install is required

## Quick Start

```bash
git clone https://github.com/Yongjun-Kim-717/game-analysis-llm-wiki.git
cd game-analysis-llm-wiki
npm run dev
```

Open:

```text
http://localhost:4173
```

The viewer shows grouped wiki navigation on the left, the selected Markdown page in the center, and a local Skill Runner on the right.

The center page includes analysis badges, Core Loop flow cards, comparison candidates, quality guidance, and rendered Markdown tables. The right panel shows the selected page's schema, evidence, quality, and agent pipeline status. `Screenshot Mode` hides input-heavy controls for cleaner MVP capture.

## Viewer Groups

- `All`: active wiki pages sorted by latest review date
- `Games`: individual game analysis pages
- `Comparisons`: generated or curated game comparison pages
- `Design Notes`: second-order analysis for applying findings to the user's own game design
- `Research Logs`: evidence and source notes
- `Knowledge Base`: reusable genre, mechanic, and index pages

Genres are handled as tags instead of fixed folders because many games belong to multiple genres. Deprecated or archived pages remain on disk for traceability but are hidden from the default GUI list.

## Analyze a Game

In the GUI:

```text
1. Select "Analyze New Game"
2. Enter a game name, for example "서브나우티카2" or "Subnautica 2"
3. Select a search scope
4. Optionally enable player reviews
5. Click "Run Skill"
6. Open the generated page in the Games group
```

CLI example:

```bash
npm run analyze -- --game "서브나우티카2" --scope broad --includeReviews true
```

Korean or alias input is resolved before search. For example, `서브나우티카2`, `서브노티카2`, and `Subnautica2` are normalized to the canonical title `Subnautica 2`. The original query is saved as `original_query`, and aliases are indexed for later search.

## Agentic Pipeline

`Analyze New Game` runs this local agentic pipeline:

```text
Title Resolver
  -> Research Agent
  -> Source Organizer Agent
  -> Evidence Reviewer Agent
  -> Game Analyst Agent
  -> Quality Reviewer Agent
  -> Wiki Builder Agent
  -> Final Review Agent
  -> Revision Agent
  -> Maintenance Agent
```

Each step writes traceable artifacts under `raw/`, `handoffs/`, `wiki/`, or `maintenance/`.

The Wiki Builder Agent writes wiki pages through MCP `wiki.write_page`. Final Review uses MCP `schema.validate`. Existing page edits, archives, and duplicate merges can also be performed through MCP write tools.

## Spec-Based Agent Pool

Game information is fragmented across official sites, stores, review outlets, community reactions, and gameplay references. This project therefore uses a source-oriented agent pool instead of one generic search agent.

The MVP does not spawn parallel LLM workers or require an API key. `tools/skill-runner.js` applies these agent specs sequentially:

- `Research Orchestrator`
- `Official Source Agent`
- `Storefront Agent`
- `Critic Review Agent`
- `Community Agent`
- `Gameplay Evidence Agent`
- `Cross-Check Agent`
- `Synthesis Agent`

The design is documented in:

- `docs/research-source-policy.md`
- `docs/multi-source-research-pipeline.md`
- `agents/source-pool/`
- `schemas/evidence.schema.json`

Each analysis run writes `handoffs/{game_slug}/02-source-agent-pool.json`, and generated game pages expose `source_agents`, `source_coverage`, and `trust_flags` in frontmatter. The viewer renders these as Evidence Coverage and Trust Flag cards so the user can see whether official/store/community/reference evidence is present.

New game pages also include an analysis quality section. The Quality Reviewer Agent writes:

- `handoffs/{slug}/08-quality-report.json`
- `handoffs/{slug}/09-core-loop-confidence.json`

`quality_score` is a 0-100 score based on fetched sources, official/reference coverage, player-experience claims, core loop depth, mechanics coverage, unresolved questions, and schema validation. Core Loop items include `[confidence: high|medium|low]` so inferred loops can be reviewed more precisely.

## Search Scope

- `Conservative`: official, store, press, developer/publisher targets
- `Standard`: conservative sources plus public reference/wiki/database targets
- `Broad`: standard sources plus review/community targets

Every source record receives an id such as `S1`. Review/player-experience sources use ids such as `R1`, and user notes use ids such as `U1`. Wiki pages cite these ids near relevant information and list sources at the bottom.

When `Broad` scope or `Include player reviews` is used, the Research Agent also attempts to collect Tier 4 player-experience claims, currently through Steam Reviews when a Steam app id is available. These claims are rendered separately under `유저 반응 요약` and `플레이 경험 관찰`.

If no source can be fetched, the run is not treated as a fully successful analysis. The generated page is marked `status: needs-research` with `evidence_level: seed`, and the pipeline card shows `needs-research`.

## Available Skills

- `Analyze New Game`: run the full game analysis pipeline and create wiki pages
- `Compare Existing Games`: compare two existing game pages and optionally save a comparison page
- `Update Existing Page`: append a traceable revision note to an existing page
- `Edit Wiki Section`: replace or add one `##` section in an existing page
- `Archive Wiki Page`: mark a page as archived without deleting history
- `Merge Duplicate Pages`: connect a duplicate page to a canonical page and deprecate the duplicate
- `Create Design Note`: create a second-order design note from analysis results
- `Validate Wiki Page`: run schema validation
- `Tag & Classify Page`: update page tags for discovery
- `Refresh Evidence`: update an evidence/source page
- `Quality Backfill`: add current quality score, quality level, and Core Loop confidence to existing game pages
- `Maintenance Sweep`: inspect wiki health and write a maintenance report

Existing pages should normally be changed through operating skills instead of physical deletion.

## Upgrade Existing Game Pages

If older game pages were created before the quality pipeline existed, run:

```bash
npm run skill -- quality-backfill
```

This reads existing pages and source records, then backfills `quality_score`, `quality_level`, `## 분석 품질`, Core Loop confidence markers, and handoff reports without rerunning web search.

For one page:

```bash
npm run skill -- quality-backfill --path wiki/games/slay-the-spire.md
```

## MCP Tool List

```bash
npm run mcp:list
```

Available tools:

- `wiki.search`: search wiki pages by title, aliases, tag, genre, mechanic, slug, or text
- `wiki.get_page`: read one wiki page
- `wiki.write_page`: write a Markdown page under `wiki/`
- `wiki.update_page`: replace a page or one section inside a page
- `wiki.archive_page`: mark a page as archived without deleting history
- `wiki.merge_page`: deprecate a duplicate page and link it to a canonical page
- `schema.validate`: validate a game analysis page
- `game.compare`: compare two game pages
- `graph.get`: return graph data from `maintenance/graph.json`
- `journal.append`: append an agent work event to `journal.md`

## Validation

```bash
npm run mcp:validate -- "{path:wiki/games/subnautica-2.md}"
npm run skill -- maintenance-sweep
```

The maintenance sweep reports invalid game pages and pages that still need research.

## 30-Minute First Page Checklist

1. Run `npm run dev`.
2. Open `http://localhost:4173`.
3. In Skill Runner, choose `Analyze New Game`.
4. Enter one game name.
5. Choose `Broad` and enable player reviews when available.
6. Click `Run Skill`.
7. Open the new page in the `Games` group.
8. Run `Validate Wiki Page` for the generated path.
9. Run `Quality Backfill` if the page needs updated quality metadata.
10. Confirm the left navigation shows a quality badge such as `Q 91 · strong`.

Quality scoring is documented in `docs/quality-scoring.md`.

## MCP Server Mode

The MCP-compatible server runs over stdio when no CLI command is passed:

```bash
npm run mcp
```

Example JSON-RPC message:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"game.compare","arguments":{"gameA":"slay-the-spire","gameB":"hades"}}}
```

## Repository Structure

```text
.
├─ AGENTS.md
├─ RULES.md
├─ SCHEMA.md
├─ package.json
├─ raw/
├─ wiki/
├─ agents/
├─ skills/
├─ pipeline/
├─ tools/
│  ├─ mcp-server/
│  ├─ skill-runner.js
│  ├─ viewer-server.js
│  └─ wiki-add.js
├─ viewer/
├─ demo/
├─ docs/
├─ maintenance/
└─ journal.md
```

## Operating Flow

```text
User request in GUI
  -> Skill Runner
  -> Title Resolver
  -> Research / Organize / Review / Analyze agents
  -> MCP wiki.write_page
  -> MCP schema.validate
  -> Revision handoff if needed
  -> MCP wiki.search / wiki.get_page
  -> Viewer rendering
  -> Journal and maintenance sweep
```

## Notes for LLM Agents

When using an LLM agent with this repository, ask it to follow:

```text
Read AGENTS.md, RULES.md, SCHEMA.md, and the relevant skill spec.
Use the Skill Runner or MCP tools instead of editing wiki pages ad hoc.
Preserve deprecated pages as history unless explicit physical deletion is required.
Validate generated game pages with schema.validate.
```
