# Multi-Source Research Pipeline

이 파이프라인은 게임 분석 요청을 여러 출처군의 관점으로 분해하고, 각 관점을 교차 검토한 뒤 Wiki 문서로 합성한다.

## MVP 실행 모델

현재 구현은 비용 절감을 위해 실제 병렬 LLM 호출을 하지 않는다. `skill-runner`가 다음 agent spec을 순차 적용한다.

```text
User Game Name
  -> Research Orchestrator
  -> Official Source Agent
  -> Storefront Agent
  -> Critic Review Agent
  -> Community Agent
  -> Gameplay Evidence Agent
  -> Cross-Check Agent
  -> Synthesis Agent
  -> Wiki Builder / Schema Validator
```

## Agent Pool

| Agent | 책임 | 출력 |
|---|---|---|
| Research Orchestrator | 제목/별칭/플랫폼 힌트/검색 범위로 필요한 조사 범위 결정 | selected_agents, search_terms |
| Official Source Agent | 공식/개발사/퍼블리셔/press 자료 후보 관리 | official claims, trust flags |
| Storefront Agent | Steam/Epic/콘솔/모바일 스토어 후보와 실제 fetch 결과 관리 | platform/store claims |
| Critic Review Agent | 비평 매체와 공개 리뷰 후보 관리 | critic perspective |
| Community Agent | 유저 리뷰와 커뮤니티 반응 관리 | player-experience claims |
| Gameplay Evidence Agent | 플레이 영상/가이드/시스템 관찰 기반 core loop 추론 | gameplay observation |
| Cross-Check Agent | 출처 충돌, 누락, 편향 위험 점검 | conflict notes, missing coverage |
| Synthesis Agent | 출처별 관점을 Wiki 분석 구조로 합성 | wiki-ready summary |

## Evidence Pool

모든 agent는 같은 claim format을 사용한다.

```json
{
  "claim_id": "C1",
  "claim": "The game uses run-based progression.",
  "claim_type": "source-backed",
  "source_agent": "storefront-agent",
  "source_type": "store",
  "platform": "steam",
  "confidence": "medium",
  "evidence_level": "tier-1",
  "source_id": "S1",
  "bias_risk": ["store_tag_bias"],
  "verified_status": "fetched"
}
```

## 확장 전략

장기적으로는 특정 agent만 실제 LLM/API worker로 승격한다.

- 출시 전 게임: Official, Gameplay, Community expectation 중심
- Steam 인디 게임: Storefront, Community, Critic, Gameplay 중심
- 모바일/온라인 게임: Storefront, Community, LiveOps 중심
- 고전 게임: Reference, Community, Gameplay 중심

이렇게 하면 모든 요청에 모든 agent를 호출하지 않아도 되고, 비용을 검색 범위와 목적에 맞춰 통제할 수 있다.

## UGC Extension

사용자 제작 게임으로 감지되면 다음 agent spec을 추가로 활성화한다.

- `UGC Platform Agent`
- `Creator Profile Agent`
- `UGC Community Signal Agent`
- `UGC Gameplay Observation Agent`
- `UGC Genre Template Agent`

감지 조건은 platform, note, title, alias, tag에 `MapleStory Worlds`, `메이플스토리 월드`, `Roblox`, `Fortnite Creative`, `UGC`, `유저 제작`, `월드`, `모드`, `커스텀` 등이 포함되는 경우다.

MVP는 플랫폼 페이지 자동 크롤링을 보장하지 않고, 우선 정확한 candidate source와 trust flag를 남긴다. 직접 플레이 관찰이나 플랫폼 URL을 사용자가 추가하면 coverage가 올라간다.
