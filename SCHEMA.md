# SCHEMA.md

이 문서는 Game Analysis LLM Wiki의 Markdown page 구조를 정의한다.

## Game Page Metadata

```yaml
---
title: Game Title
page_type: game-analysis
status: needs-research | draft | reviewed | stable | deprecated | archived
game_slug: game-slug
aliases:
  - Alias
original_query: Original User Query
genre:
  - genre
platform:
  - platform
evidence_level: seed | low | medium | high
quality_score: 0
quality_level: seed | weak | usable | strong
source_agents:
  - research-orchestrator
source_coverage:
  - official
trust_flags:
  - needs-player-experience-signal
core_loop:
  - loop-step
mechanics:
  - mechanic
similar_games:
  - game-slug
tags:
  - tag
last_reviewed: YYYY-MM-DD
---
```

## Required Sections

Game page는 다음 섹션을 포함해야 한다.

1. `# 게임명`
2. `## 기본 정보`
3. `## 한 줄 정의`
4. `## Core Loop`
5. `## 핵심 재미 가설`
6. `## 주요 시스템`
7. `## 장르 관점과 비교`
8. `## 차별점 분석`
9. `## 유사 게임 비교`
10. `## 근거 자료`
11. `## 검증 필요 사항`
12. `## 관련 Wiki Pages`
13. `## 유지보수 메모`

## Recommended Sections

다음 섹션은 추천한다. schema validation의 필수 조건은 아니지만, 분석 품질과 추적성을 높인다.

- `## 분석 품질`
- `## 유저 반응 요약`
- `## 플레이 경험 관찰`
- `## Source Agent Pool`
- `## Evidence Coverage`
- `## Source Conflicts and Gaps`

## Evidence Level

- `high`: 공식/스토어 계열 출처와 추가 공개 출처가 함께 있다.
- `medium`: 공식/스토어 계열 출처 또는 신뢰 가능한 공개 출처가 있다.
- `low`: 사용자 메모나 제한적 공개 자료 중심이다.
- `seed`: 실제 fetch된 출처가 없어 조사 필요 초안이다.

## Quality Level

- `strong`: 출처, schema, core loop, mechanics, player-experience signal이 충분하다.
- `usable`: 분석에 사용할 수 있으나 일부 보완점이 남아 있다.
- `weak`: 분석 초안으로는 쓸 수 있으나 근거와 구조가 약하다.
- `seed`: 분석보다 조사 필요 skeleton에 가깝다.

## Core Loop Confidence

Core Loop 항목은 다음 형식으로 작성한다.

```md
1. 환경 탐색 [S1][confidence: high]
2. 자원 수집 [S1][confidence: medium]
3. 다음 선택으로 반복 [inference] [confidence: low]
```

- source id가 있으면 해당 출처에서 직접 또는 간접 근거를 찾은 것이다.
- `[inference]`는 직접 출처 문장이 아니라 분석자가 추론한 구조라는 뜻이다.
- confidence는 `high`, `medium`, `low` 중 하나를 사용한다.

## Source Agent Pool Metadata

`source_agents`는 이번 분석에 적용된 spec-based subagent 목록이다.

`source_coverage`는 현재 문서가 확보한 출처군을 표시한다.

- `official`
- `storefront`
- `reference`
- `community`
- `critic`
- `ugc-platform`
- `creator`
- `platform-community`
- `gameplay-observation`
- `template-comparison`

`trust_flags`는 Cross-Check Agent가 남긴 보완 필요 항목이다.

- `needs-official-or-store-source`
- `needs-player-experience-signal`
- `needs-reference-or-gameplay-evidence`
- `candidate-sources-present`
- `needs-ugc-platform-page`
- `needs-creator-profile`
- `needs-direct-play-observation`
- `needs-platform-community-signal`
- `needs-template-comparison`

Evidence claim의 확장 JSON Schema는 `schemas/evidence.schema.json`에 있다.

본 MVP는 실제 병렬 LLM 호출 대신 `skill-runner`가 agent spec을 순차 적용한다. 실행 추적은 `handoffs/{game_slug}/02-source-agent-pool.json`에 남긴다.
