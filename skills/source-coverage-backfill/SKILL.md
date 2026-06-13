# Source Coverage Backfill Skill

Use this skill when existing game analysis pages were created before the Spec-Based Agent Pool metadata existed.

## Purpose

This is a migration and maintenance skill. It does not re-analyze a game and does not overwrite the main analysis text. It reads the existing game page and matching evidence page, classifies source URLs, and backfills source coverage metadata.

## Inputs

- optional target page path
- optional `includeDeprecated`

If no target page is given, the skill updates all active `game-analysis` pages.

## Pipeline

1. Load existing `wiki/games/*.md` pages.
2. Find matching `wiki/evidence/{game_slug}-sources.md` pages.
3. Extract source URLs from game and evidence pages.
4. Classify source type:
   - official
   - storefront
   - reference
   - community
   - critic
5. Build a Spec-Based Agent Pool trace.
6. Add or update frontmatter:
   - `source_agents`
   - `source_coverage`
   - `trust_flags`
7. Write `handoffs/{game_slug}/02-source-agent-pool.json`.
8. Write `maintenance/source-coverage-backfill-YYYY-MM-DD.json`.

## Safety Rules

- Preserve the existing analysis body.
- Do not delete source records.
- Do not claim that a new web search was performed.
- Mark missing source groups through `trust_flags`.
- Validate each updated page through MCP `schema.validate`.

## Output

The skill returns updated pages, handoff traces, and a maintenance report.
