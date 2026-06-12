# Spec-Based Agent Pool Upgrade

- date: 2026-06-13
- actor: Codex
- summary: Added multi-source research harness for game analysis wiki.

## Changes

- Added `docs/research-source-policy.md`.
- Added `docs/multi-source-research-pipeline.md`.
- Added `agents/source-pool/` specs.
- Added `schemas/evidence.schema.json`.
- Updated `skills/analyze-new-game/SKILL.md`.
- Updated `tools/skill-runner.js` to write `02-source-agent-pool.json`.
- Updated GUI to render Evidence Coverage and Trust Flags.
- Rewrote `SCHEMA.md` as clean Korean schema documentation with source agent metadata.

## Validation

- `node --check tools/skill-runner.js`: passed.
- `node --check viewer/app.js`: passed.
- `node --check tools/mcp-server/src/index.js`: passed.
- `npm run mcp:list` and `npm run skill -- maintenance-sweep` could not be rerun because the desktop escalation approval was blocked by the current usage limit.
