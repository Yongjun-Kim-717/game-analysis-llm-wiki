---
title: Slay the Spire
page_type: game-analysis
status: reviewed
game_slug: slay-the-spire
genre:
  - roguelike-deckbuilder
  - card-battler
platform:
  - PC
  - console
  - mobile
evidence_level: medium
core_loop:
  - map-route-choice
  - turn-based-card-combat
  - card-reward-selection
  - deck-refinement
  - relic-synergy
mechanics:
  - deckbuilding-roguelike
  - route-risk-reward
  - relic-synergy
similar_games:
  - hades
  - monster-train
  - balatro
last_reviewed: 2026-06-11
quality_score: 34
quality_level: seed
---






# Slay the Spire

## 기본 정보

| 항목 | 내용 |
| --- | --- |
| 개발사 | Mega Crit |
| 장르 | Roguelike Deckbuilder, Card Battler |
| 핵심 플레이 | 경로 선택, 턴제 카드 전투, 카드 보상 선택, 덱 압축/강화, relic synergy |
| 분석 기준일 | 2026-06-06 |
| 근거 수준 | Medium |

## 한 줄 정의

`Slay the Spire`는 로그라이크식 run 구조와 카드 덱빌딩을 결합해, 매 전투 이후의 작은 카드 선택이 장기적인 덱 정체성과 생존 가능성을 바꾸는 싱글플레이 전략 게임이다.

## Core Loop

1. map-route-choice [inference] [confidence: medium]
2. turn-based-card-combat [page] [confidence: high]
3. card-reward-selection [inference] [confidence: medium]
4. deck-refinement [inference] [confidence: medium]
5. relic-synergy [inference] [confidence: medium]

지도에서 경로 선택
  -> 턴제 카드 전투
  -> 카드/골드/유물 보상 획득
  -> 덱 추가/제거/강화 판단
  -> 엘리트/상점/이벤트 위험 선택
  -> 보스 도전
  -> 실패 또는 다음 난이도/캐릭터 재도전
```

## 핵심 재미 가설

핵심 재미는 **작은 선택의 누적이 run 전체의 전략 정체성을 만든다는 감각**에서 발생한다.

- 플레이어는 매 전투 이후 카드를 하나 고르거나, 때로는 아무 카드도 고르지 않는 선택을 한다.
- 각 선택은 즉시 강해지는 선택이 아니라, 현재 덱의 방향성과 미래 위험에 대한 판단이다.
- 유물, 카드, 경로 선택이 서로 얽히면서 같은 캐릭터라도 매 run이 다른 문제 풀이가 된다.
- 실패 후에도 “어느 선택이 덱을 망쳤는가”를 복기할 수 있어 다음 run의 학습 동기가 생긴다.

## 주요 시스템

### 카드 보상과 덱 정체성

카드 보상은 단순 수집이 아니라 덱의 방향성을 결정하는 선택이다. 좋은 카드라도 현재 덱의 에너지 구조, 드로우, 방어 수단, 보스 대응과 맞지 않으면 오히려 덱을 약화시킬 수 있다.

### 경로 선택

지도는 전투, 엘리트, 상점, 휴식, 이벤트를 조합한 위험/보상 경로를 제공한다. 플레이어는 현재 덱의 강도와 필요한 보상을 기준으로 위험을 선택한다.

### Relic Synergy

유물은 규칙을 변형하거나 특정 전략을 강화한다. 카드 선택과 유물 효과가 맞물릴 때 run의 전략이 강하게 형성된다.

## 장르 관습과 비교

Roguelike Deckbuilder 장르는 다음 관습을 가진다.

- run 단위 진행
- 절차적 또는 반무작위 보상
- 실패 시 run 종료
- 매 run에서 달라지는 빌드
- 장기적으로 축적되는 플레이어 학습

`Slay the Spire`는 이 관습을 카드 선택과 덱 품질 관리로 압축한다. 액션 숙련도보다 **확률, 위험, 시너지 판단**이 핵심이다.

## 차별점 분석

### 차별점 1. 선택하지 않는 선택의 중요성

- 일반 카드 게임은 강한 카드를 많이 확보하는 방향으로 진행되는 경우가 많다.
- `Slay the Spire`에서는 카드 보상을 거절하는 것이 중요한 전략이다.
- 이 구조는 덱빌딩을 수집이 아니라 **덱 오염을 관리하는 의사결정**으로 만든다.

### 차별점 2. 지도 경로와 덱 상태의 결합

- 경로 선택은 단순 분기 선택이 아니라 현재 덱의 전투력, 회복 필요성, 상점 자원, 엘리트 보상 가능성을 함께 고려하는 판단이다.
- 따라서 같은 카드 풀이라도 경로 선택에 따라 run의 리스크가 달라진다.

### 차별점 3. 전략 실패의 학습 가능성

- 실패 원인을 전투 조작 미스보다 덱 구성, 보상 선택, 경로 판단에서 찾을 수 있다.
- 이 때문에 반복 플레이가 단순 반복이 아니라 의사결정 학습으로 작동한다.

## 유사 게임 비교

| 비교 축 | Slay the Spire | Hades | 판단 |
| --- | --- | --- | --- |
| 핵심 숙련 | 카드 선택, 덱 품질, 위험 계산 | 실시간 전투 조작, boon 조합 | Slay the Spire는 사고 기반 전략성이 더 강함 |
| 실패 후 동기 | 선택 복기와 전략 개선 | 서사 진행과 메타 성장 | 실패 보상의 감정적 성격이 다름 |
| run 변주성 | 카드/유물/경로 조합 | 무기/boon/방 구성 | 둘 다 변주성이 높지만 구성 방식이 다름 |

## 분석 품질

- 품질 점수: 34/100
- 품질 등급: seed
- 사실 근거 수준: medium
- 플레이 경험 근거 수준: missing

### 강점

- 게임 페이지 스키마 검증을 통과했다.

### 보완점

- 공식/스토어 계열 출처가 부족하다.
- 공개 참고 출처가 부족하다.
- 유저 반응/플레이 경험 신호가 없다.
- 검증 필요 사항이 남아 있다.

## 근거 자료

- [Slay the Spire Steam Store](https://store.steampowered.com/app/646570/Slay_the_Spire/)
- [Mega Crit Press Kit](https://www.megacrit.com/press-kits/slay-the-spire/)
- [Slay the Spire Wiki](https://slay-the-spire.fandom.com/wiki/Slay_the_Spire)
- [Roguelike deck-building game](https://en.wikipedia.org/wiki/Roguelike_deck-building_game)

## 검증 필요 사항

- 직접 플레이 로그를 추가하여 카드 거절, 경로 선택, 유물 시너지 판단 사례를 보강할 필요가 있다.
- `Monster Train`, `Balatro`와의 비교 page를 추가하면 장르 내 차별점이 더 선명해진다.

## 관련 Wiki Pages

- [Deckbuilding Roguelike](../mechanics/deckbuilding-roguelike.md)
- [Roguelike Deckbuilder](../genres/roguelike-deckbuilder.md)
- [Slay the Spire vs Hades](../comparisons/slay-the-spire-vs-hades.md)
- [Slay the Spire Sources](../evidence/slay-the-spire-sources.md)

## 유지보수 메모

현재 문서는 공개 자료와 장르 지식 기반 분석이다. 추후 직접 플레이 로그와 run별 의사결정 기록을 추가하면 evidence level을 `high`로 올릴 수 있다.

