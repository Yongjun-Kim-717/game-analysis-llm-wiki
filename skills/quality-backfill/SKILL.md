# Quality Backfill Skill

Use this skill when existing game analysis pages already pass the base schema but do not yet include the current quality metadata.

## Purpose

This skill upgrades legacy game pages without rerunning the full search pipeline. It reads the existing wiki page and source records, then adds or refreshes:

- `quality_score`
- `quality_level`
- `## 분석 품질`
- Core Loop `[confidence: high|medium|low]`
- `handoffs/{game}/08-quality-report.json`
- `handoffs/{game}/09-core-loop-confidence.json`
- `maintenance/quality-backfill-{date}.json`

## Inputs

- `path` optional. If empty, update all active game analysis pages.
- `includeDeprecated` optional. Defaults to false.

## Agent Roles

1. Quality Reviewer Agent: scores evidence, source coverage, player-experience signal, core loop depth, mechanics coverage, unresolved questions, and schema validity.
2. Game Analyst Agent: assigns confidence to each Core Loop step using source ids or inference.
3. Wiki Builder Agent: updates the page through MCP `wiki.update_page`.
4. Maintenance Agent: writes handoff reports and journal entries.

## Rules

- Do not archive or delete pages.
- Do not fetch new web sources.
- Do not overwrite unrelated user-authored sections.
- Deprecated and archived pages are skipped unless explicitly requested.
- If a page has no source records, mark that as a quality gap instead of inventing evidence.

## CLI

```bash
npm run skill -- quality-backfill
npm run skill -- quality-backfill --path wiki/games/slay-the-spire.md
```
