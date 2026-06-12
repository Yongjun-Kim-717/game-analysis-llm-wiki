# Add Game Workflow

## 목적

사용자가 게임 이름만 입력해도 LLM Wiki에 게임 분석 문서와 근거 문서가 생성되도록 한다.

## 입력

```text
서브나우티카2 분석해줘.
```

선택 입력:

- aliases: 한글명, 약칭, 영문 표기 변형
- search scope: conservative / standard / broad
- source URLs
- raw note
- genre/platform hints

## 현재 MVP 단계

1. GUI 또는 CLI가 `Analyze New Game` Skill을 실행한다.
2. Title Resolver가 입력명을 canonical title과 aliases로 정규화한다.
3. Research Agent가 scope에 맞는 source 후보를 만들고, Steam/Wikipedia/Steam Reviews처럼 API Key 없이 접근 가능한 공개 출처를 fetch한다.
4. Source Organizer Agent가 source와 claim을 분석 필드별로 분류한다.
5. Evidence Reviewer Agent가 fact evidence와 player-experience evidence 수준을 계산한다.
6. Game Analyst Agent가 Core Loop, mechanics, tags, 핵심 재미 가설을 생성한다.
7. Quality Reviewer Agent가 `quality_score`, `quality_level`, Core Loop confidence를 계산한다.
8. Wiki Builder Agent가 MCP `wiki.write_page` tool을 통해 `wiki/games/`, `wiki/evidence/` 문서를 저장한다.
9. Final Review Agent가 MCP `schema.validate` tool로 구조를 검증한다.
10. Revision Agent가 필요 시 `handoffs/{slug}/07-revision-plan.json`에 보완 계획을 남긴다.
11. Maintenance Agent가 `journal.md`와 maintenance report를 갱신한다.

## 후속 Skill

`Comparison Agent`는 현재 Analyze New Game의 필수 자동 단계가 아니라 `Compare Existing Games` Skill로 분리되어 있다. 게임 문서 생성 후 사용자가 비교 대상을 선택하거나, 추후 자동 후보 추천 기능을 붙이면 비교 문서를 생성한다.

`Revision Agent`는 자동 본문 수정까지 수행하지 않는다. 대신 검증 실패, source 부족, player-experience signal 부족 같은 문제를 revision plan으로 남기고, 사용자는 `Edit Wiki Section`, `Refresh Evidence`, `Merge Duplicate Pages` Skill로 수정한다.

## 산출물

- `raw/requests/{date}-{slug}.md`
- `raw/research/{slug}.json`
- `handoffs/{slug}/01-research.json`
- `handoffs/{slug}/02-source-organized.json`
- `handoffs/{slug}/03-evidence-review.json`
- `handoffs/{slug}/04-analysis.json`
- `handoffs/{slug}/05-wiki-draft.md`
- `handoffs/{slug}/06-final-review.json`
- `handoffs/{slug}/07-revision-plan.json`
- `handoffs/{slug}/08-quality-report.json`
- `handoffs/{slug}/09-core-loop-confidence.json`
- `wiki/games/{slug}.md`
- `wiki/evidence/{slug}-sources.md`
