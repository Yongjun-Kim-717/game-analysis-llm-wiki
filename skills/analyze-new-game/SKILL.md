# Analyze New Game Skill

Use this skill when the user wants to add a new game analysis page from a game name, alias, source URL, or raw note.

## Inputs

- game name
- aliases
- search scope: conservative / standard / broad
- optional genre or tag hints
- optional platform hints
- source URLs
- raw note
- include player reviews

## Pipeline

1. Title Resolver normalizes the user query into a canonical title and aliases.
2. Research Orchestrator selects source agents from the spec-based agent pool.
3. Official Source Agent, Storefront Agent, Critic Review Agent, Community Agent, and Gameplay Evidence Agent each handle their own source type.
4. Research Agent builds scoped source targets, records user-provided sources and notes, and fetches public no-key sources when possible.
5. Source Organizer Agent separates official/store sources, reference sources, player-experience sources, and user notes.
6. Cross-Check Agent records evidence coverage, trust flags, and missing source groups.
7. Evidence Reviewer Agent assigns fact and player-experience evidence levels.
8. Game Analyst Agent infers core loop, mechanics, tags, and fun factor hypothesis.
9. Synthesis Agent prepares source perspectives for the wiki page.
10. Quality Reviewer Agent calculates `quality_score`, `quality_level`, and Core Loop confidence.
11. Wiki Builder Agent writes evidence and game pages through MCP `wiki.write_page`.
12. Final Review Agent calls MCP `schema.validate`.
13. Revision Agent writes `07-revision-plan.json` when the page needs more evidence or schema repair.
14. Maintenance Agent appends `journal.md`.

## Spec-Based Agent Pool

The MVP does not spawn parallel LLM workers. To control cost, `skill-runner` applies the source agent specifications sequentially and writes a trace to:

- `handoffs/{game_slug}/02-source-agent-pool.json`

The generated game page frontmatter includes:

- `source_agents`
- `source_coverage`
- `trust_flags`

This makes the pipeline upgradeable to real worker agents later without changing the wiki schema.

## UGC Game Handling

When the request appears to describe a user-created game, the runner activates UGC-specific source agents:

- UGC Platform Agent
- Creator Profile Agent
- UGC Community Signal Agent
- UGC Gameplay Observation Agent
- UGC Genre Template Agent

Useful user inputs:

- `platform`: MapleStory Worlds, Roblox, Fortnite Creative, UGC, etc.
- `note`: user-created game, platform page hint, creator name, gameplay observation
- `sources`: platform game page, creator profile, gameplay video, community URL

If these sources are missing, the page should remain `seed` or `needs-research` rather than inventing analysis.

## Player Review Handling

When `includeReviews` is enabled or search scope is `broad`, the Research Agent may collect Tier 4 player-experience claims.

Tier 4 claims are used only for:

- user reaction summary
- player experience observation
- fun factor confidence
- friction point notes

They must not be used to assert basic facts such as release date, platform, developer, or official genre.

## Source Traceability

Every source or note receives an id:

- `S1`, `S2`: source records
- `R1`: review/player-experience source
- `U1`: user raw note
- `[inference]`: analysis inferred from available claims

The generated wiki page must cite these ids near relevant information.

## Quality Output

The skill writes:

- `08-quality-report.json`
- `09-core-loop-confidence.json`

The game page frontmatter includes `quality_score` and `quality_level`. Core Loop items include confidence markers such as `[confidence: high]`.

## Failure Handling

If no source can be fetched, the page is marked `status: needs-research` and `evidence_level: seed`. The generated page is a skeleton, not a completed analysis.
