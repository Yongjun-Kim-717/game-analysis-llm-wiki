---
title: Celeste
page_type: game-analysis
status: draft
game_slug: celeste
aliases:
  - 조사 필요
original_query: Celeste
genre:
  - action
  - adventure
  - indie
platform:
  - windows
  - mac
  - linux
evidence_level: high
quality_score: 64
quality_level: usable
core_loop:
  - 실시간 조작 전투
  - 전투 보상 선택
  - 숙련 기반 반복
mechanics:
  - action-combat
similar_games: []
tags:
  - action
  - adventure
  - indie
last_reviewed: 2026-06-13
source_agents:
  - research-orchestrator
  - official-source-agent
  - storefront-agent
  - community-agent
  - gameplay-evidence-agent
  - cross-check-agent
  - synthesis-agent
source_coverage:
  - storefront
  - reference
trust_flags:
  - needs-player-experience-signal
  - candidate-sources-present
---







# Celeste

## 기본 정보

- 원 입력명: Celeste
- 별칭: Celeste
- 장르/태그: action, adventure, indie [S6]
- 플랫폼: windows, mac, linux [S6]
- 근거 수준: high
- 검색 범위: standard

## 한 줄 정의

Local verification run for spec-based source agent pool. [U1][S6][S7]

## Core Loop

1. 실시간 조작 전투 [S6] [confidence: high]
2. 전투 보상 선택 [S6] [confidence: high]
3. 숙련 기반 반복 [inference] [confidence: low]

## 핵심 재미 가설

- 현재 입력 자료 기준으로 이 게임의 재미는 선택, 반복, 보상, 숙련 또는 조합의 순환에서 발생한다고 가정한다. [U1][S6][S7][inference]
- 정확한 재미 구조는 추가 플레이 관찰과 출처 검증 후 보강해야 한다.

## 주요 시스템

- action-combat [U1][S6][S7]

## 장르 관점과 비교

- 이 문서는 태그 기반으로 분류된다. 고정 장르 폴더에 넣지 않고 여러 장르/메커니즘 태그로 검색되도록 관리한다. [inference]

## 차별점 분석

- 추가 조사 후 기존 유사 게임과 다른 차별점을 정리해야 한다. [inference]

## 유사 게임 비교

- 비교 후보는 Compare Existing Games Skill 또는 Generate Comparison Candidates 확장 Skill로 보강한다.

## 분석 품질

- 품질 점수: 64/100
- 품질 등급: usable
- 사실 근거 수준: high
- 플레이 경험 근거 수준: missing

### 강점

- 공식/스토어 계열 출처가 있다.
- 공개 참고 출처가 있다.
- 게임 페이지 스키마 검증을 통과했다.

### 보완점

- 유저 반응/플레이 경험 신호가 없다.
- 검증 필요 사항이 남아 있다.

## 유저 반응 요약

### 긍정 반응

- 수집된 긍정 리뷰 claim 없음

### 부정 반응

- 수집된 부정 리뷰 claim 없음

### 혼합 반응

- 수집된 혼합 반응 claim 없음

## 플레이 경험 관찰

- 유저 반응은 사실 정보가 아니라 플레이 경험 신호로만 사용한다. [inference]
- 반복적으로 등장하는 반응이 충분하지 않으면 핵심 재미 판단의 confidence를 낮게 둔다.

## 근거 자료

- [S1] Steam Store Search - Celeste (tier-1, candidate) https://store.steampowered.com/search/?term=Celeste
- [S2] Official Site Search - Celeste (tier-1, candidate) https://www.google.com/search?q=Celeste+official+site
- [S3] Press Kit Search - Celeste (tier-2, candidate) https://www.google.com/search?q=Celeste+press+kit+developer
- [S4] Public Wiki Search - Celeste (tier-3, candidate) https://www.google.com/search?q=Celeste+game+wiki
- [S5] MobyGames Search - Celeste (tier-3, candidate) https://www.mobygames.com/search/?q=Celeste
- [U1] User Raw Note (user-note, provided)
- [S6] Steam Store - Celeste (tier-1, fetched) https://store.steampowered.com/app/504230/
- [S7] Wikipedia - Celeste (video game) (tier-3, fetched) https://en.wikipedia.org/wiki/Celeste_(video_game)
- Evidence detail: wiki/evidence/celeste-sources.md
- Quality detail: handoffs/celeste/08-quality-report.json
- Core loop confidence: handoffs/celeste/09-core-loop-confidence.json

## 검증 필요 사항

- 핵심 재미와 차별점은 플레이 관찰 또는 공식 설명으로 보강해야 한다.
- 현재 문서는 Skill Runner가 생성한 초안이므로 분석 문장을 사람이 검토해야 한다.

## 관련 Wiki Pages

- [Evidence](../evidence/celeste-sources.md)
- [Wiki Index](../index.md)

## 유지보수 메모

- 2026-06-13: Analyze New Game Skill로 초안 생성.

## Source Agent Pool

- execution mode: sequential-local-runner
- cost strategy: No parallel LLM calls; skill-runner applies source agent specs in sequence.

- Research Orchestrator: completed - Resolved title, aliases, scope, and selected source agents.
- Official Source Agent: candidate-only - 0 confirmed source(s), 2 candidate source(s), 0 claim(s).
- Storefront Agent: completed - 1 confirmed source(s), 1 candidate source(s), 12 claim(s).
- Gameplay Evidence Agent: completed - 2 confirmed source(s), 2 candidate source(s), 2 claim(s).
- Cross-Check Agent: needs-review - Found 2 evidence gap(s).
- Synthesis Agent: completed - Prepared source perspectives for wiki synthesis.

## Evidence Coverage

- official: missing
- storefront: covered
- reference: covered
- community: missing
- critic: missing

## Source Conflicts and Gaps

- needs-player-experience-signal
- candidate-sources-present

