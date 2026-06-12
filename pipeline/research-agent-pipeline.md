# Research Agent Pipeline

이 문서는 게임명 기반 분석 요청에서 검색 서브에이전트가 어떻게 동작하는지 정의한다.

## Goal

사용자가 게임명만 입력해도 Research Agent가 제한된 검색 범위 안에서 source 후보를 만들고, 각 정보가 어느 출처에서 왔는지 추적 가능한 claim 형태로 다음 에이전트에게 넘긴다.

## Search Scope

| Scope | Allowed Source Tiers | Use |
|---|---|---|
| `conservative` | Tier 1, Tier 2 | 공식 정보 중심 분석 |
| `standard` | Tier 1, Tier 2, Tier 3 | 기본값. 공식 정보와 공개 DB/wiki 교차 확인 |
| `broad` | Tier 1, Tier 2, Tier 3, Tier 4 | 리뷰/커뮤니티 반응까지 참고 |

## Source Tiers

| Tier | Examples | Trust Rule |
|---|---|---|
| Tier 1 | official site, developer/publisher page, Steam/console store | 기본 정보와 플랫폼 판단에 사용 가능 |
| Tier 2 | press kit, patch notes, developer interview | 시스템 의도와 업데이트 맥락에 사용 |
| Tier 3 | public wiki, IGDB, MobyGames, Giant Bomb | 보조 정보와 교차 검증에 사용 |
| Tier 4 | review, community, YouTube, blog | 유저 반응과 해석 참고로만 사용 |

## Pipeline

```text
Game name
  -> Research Agent
     - build scoped search targets
     - ingest user-provided URLs
     - extract claim candidates
     - assign source ids
  -> Source Organizer Agent
     - group claims by analysis field
  -> Evidence Reviewer Agent
     - compute evidence_level
     - mark weak or missing evidence
  -> Game Analyst Agent
     - separate source-backed claims from inference
  -> Wiki Builder Agent
     - write source ids in the wiki page
  -> Final Review Agent
     - schema.validate
```

## Citation Rule

Wiki 본문의 핵심 정보에는 source id 또는 inference marker를 붙인다.

```md
- 장르: poker roguelike deckbuilder [S1][U1]
- 핵심 재미 가설: 조커 시너지와 점수 증폭 구조에서 반복 재미가 발생한다. [U1][inference]
```

## Player Review Rule

Tier 4 source는 유저 리뷰, 커뮤니티, 영상, 블로그 등 플레이 경험을 보여주는 출처다.

- 사실 정보 단정에는 사용하지 않는다.
- 긍정/부정/혼합 반응을 분리한다.
- 반복되는 반응이 충분하지 않으면 confidence를 낮게 둔다.
- Wiki 본문에서는 `[R1]` 또는 해당 review source id를 표시한다.
- Steam Reviews API처럼 API Key 없이 접근 가능한 출처를 우선 사용한다.

## No API Key Policy

이 MVP는 API Key를 사용하지 않는다. 자동 웹 fetch가 불가능한 환경에서도 재현 가능하도록, Research Agent는 다음 산출물을 생성한다.

- scoped search targets
- user-provided source records
- user note claims
- confidence and unresolved questions

향후 확장 시 `--fetch` 옵션 또는 외부 subprocess를 통해 HTML 수집 단계를 추가할 수 있다.
