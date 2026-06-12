# AGENTS.md

이 문서는 Game Analysis LLM Wiki에서 에이전트가 작업할 때 따르는 운영 지침이다.

## 공통 규칙

- 작업 시작 시 `README.md`, `SCHEMA.md`, `RULES.md`, `journal.md`, 관련 `pipeline/`과 `skills/` 문서를 읽는다.
- 게임 분석은 사실, 출처, 관찰, 추론을 구분한다.
- 출처 없는 정보는 단정하지 않고 `[inference]` 또는 `검증 필요 사항`으로 남긴다.
- `wiki/games/*.md`는 `SCHEMA.md`와 `schemas/`를 따른다.
- Wiki page 저장/수정/보관/병합은 가능하면 MCP `wiki.*` tool을 사용한다.
- 모든 중요한 작업은 `journal.md` 또는 `handoffs/`에 흔적을 남긴다.
- 기존 지식은 삭제보다 `deprecated` 또는 `archived`로 보존한다.

## Agent Route

```text
Orchestrator
  -> Title Resolver
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

## Agent Roles

- Title Resolver: 한글명, 별칭, 약칭을 canonical title과 aliases로 정리한다.
- Research Agent: 검색 후보 생성, 공개 API fetch, source/claim 기록만 수행한다.
- Source Organizer Agent: source와 claim을 공식 정보, 참고 정보, 유저 반응, user note로 분류한다.
- Evidence Reviewer Agent: fact evidence와 player-experience evidence 수준을 평가한다.
- Game Analyst Agent: Core Loop, mechanics, tags, 핵심 재미 가설을 추론한다.
- Quality Reviewer Agent: 분석 품질 점수와 Core Loop confidence를 계산한다.
- Wiki Builder Agent: MCP `wiki.write_page`로 game/evidence page를 작성한다.
- Final Review Agent: MCP `schema.validate`로 구조를 검증한다.
- Revision Agent: 필요 시 `07-revision-plan.json`에 수정 계획을 남긴다.
- Maintenance Agent: `journal.md`, maintenance report, archive/deprecated 이력을 관리한다.

## 권한 원칙

- Research Agent는 wiki 파일을 직접 수정하지 않는다.
- Wiki Builder Agent는 draft 작성 권한이 있다.
- Final Review Agent는 직접 수정하지 않고 검증 결과를 산출한다.
- Revision Agent는 승인된 수정 또는 운영 Skill을 통해서만 반영한다.
- Maintenance Agent는 삭제보다 보관/폐기 상태 변경을 우선한다.
