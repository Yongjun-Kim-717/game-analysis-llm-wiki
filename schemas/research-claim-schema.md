# Research Claim Schema

Research Agent와 Source Organizer Agent 사이에서 사용하는 JSON 구조다.

```json
{
  "game": "Balatro",
  "slug": "balatro",
  "scope": "standard",
  "sources": [
    {
      "id": "S1",
      "tier": "tier-1",
      "kind": "store",
      "title": "Steam Store Search",
      "url": "https://store.steampowered.com/search/?term=Balatro",
      "status": "candidate",
      "claims": []
    }
  ],
  "claims": [
    {
      "id": "C1",
      "source_id": "U1",
      "field": "genre",
      "text": "poker roguelike deckbuilder",
      "confidence": "medium",
      "claim_type": "user-note"
    }
  ],
  "unresolved_questions": [
    "공식 장르 표기를 확인해야 한다."
  ]
}
```

## Claim Type

- `source-backed`: source URL 또는 문서에서 얻은 정보
- `user-note`: 사용자가 입력한 raw note에서 얻은 정보
- `inference`: 분석 에이전트가 추론한 정보
- `candidate`: 검색 후보일 뿐 아직 검증되지 않은 정보
- `player-experience`: 유저 리뷰/커뮤니티 반응에서 얻은 플레이 경험 정보

## Player Experience Fields

- `player_praise`
- `player_complaint`
- `player_confusion`
- `retention_factor`
- `friction_point`
- `community_pattern`
- `review_sentiment`
- `experience_signal`

Tier 4 claim은 기본 정보 단정에 사용하지 않고, 유저 반응 요약과 플레이 경험 관찰에만 사용한다.
