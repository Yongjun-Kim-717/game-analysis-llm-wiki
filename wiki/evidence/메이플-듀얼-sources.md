---
title: 메이플 듀얼 Sources
page_type: evidence
status: draft
tags:
  - evidence
  - 메이플-듀얼
last_reviewed: 2026-06-13
---

# 메이플 듀얼 Sources

## Search Scope

- scope: broad
- allowed tiers: tier-1, tier-2, tier-3, tier-4
- original query: 메이플 듀얼
- aliases: 메이플 듀얼, 조사 필요

## Source Agent Pool

- execution mode: sequential-local-runner
- cost strategy: No parallel LLM calls; skill-runner applies source agent specs in sequence.

- Research Orchestrator: completed - Resolved title, aliases, scope, and selected source agents.
- Official Source Agent: candidate-only - 0 confirmed source(s), 4 candidate source(s), 0 claim(s).
- Storefront Agent: candidate-only - 0 confirmed source(s), 2 candidate source(s), 0 claim(s).
- Critic Review Agent: candidate-only - 0 confirmed source(s), 2 candidate source(s), 0 claim(s).
- Community Agent: needs-player-signal - 0 confirmed source(s), 0 candidate source(s), 0 claim(s).
- Gameplay Evidence Agent: completed - 2 confirmed source(s), 4 candidate source(s), 3 claim(s).
- UGC Platform Agent: candidate-only - 0 confirmed source(s), 4 candidate source(s), 0 claim(s).
- Creator Profile Agent: candidate-only - 0 confirmed source(s), 2 candidate source(s), 0 claim(s).
- UGC Community Signal Agent: candidate-only - 0 confirmed source(s), 2 candidate source(s), 0 claim(s).
- UGC Gameplay Observation Agent: candidate-only - 0 confirmed source(s), 2 candidate source(s), 0 claim(s).
- UGC Genre Template Agent: candidate-only - 0 confirmed source(s), 2 candidate source(s), 0 claim(s).
- Cross-Check Agent: needs-review - Found 6 evidence gap(s).
- Synthesis Agent: completed - Prepared source perspectives for wiki synthesis.

## Evidence Coverage

- official: missing
- storefront: missing
- reference: covered
- community: missing
- critic: missing
- ugc-platform: missing
- creator: missing
- platform-community: missing
- gameplay-observation: missing
- template-comparison: missing

## Trust Flags

- needs-ugc-platform-page
- needs-creator-profile
- needs-direct-play-observation
- needs-platform-community-signal
- needs-template-comparison
- candidate-sources-present

## Sources

- [S1] tier-1 / store / candidate / storefront-agent: Steam Store Search - 메이플 듀얼 - https://store.steampowered.com/search/?term=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC
- [S2] tier-1 / official-search / candidate / official-source-agent: Official Site Search - 메이플 듀얼 - https://www.google.com/search?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC+official+site
- [S3] tier-2 / press-search / candidate / official-source-agent: Press Kit Search - 메이플 듀얼 - https://www.google.com/search?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC+press+kit+developer
- [S4] tier-3 / reference-search / candidate / gameplay-evidence-agent: Public Wiki Search - 메이플 듀얼 - https://www.google.com/search?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC+game+wiki
- [S5] tier-3 / database-search / candidate / gameplay-evidence-agent: MobyGames Search - 메이플 듀얼 - https://www.mobygames.com/search/?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC
- [S6] tier-4 / review-search / candidate / critic-review-agent: Review Search - 메이플 듀얼 - https://www.google.com/search?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC+review+game
- [S7] tier-1 / store / candidate / storefront-agent: Steam Store Search - 조사 필요 - https://store.steampowered.com/search/?term=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94
- [S8] tier-1 / official-search / candidate / official-source-agent: Official Site Search - 조사 필요 - https://www.google.com/search?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94+official+site
- [S9] tier-2 / press-search / candidate / official-source-agent: Press Kit Search - 조사 필요 - https://www.google.com/search?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94+press+kit+developer
- [S10] tier-3 / reference-search / candidate / gameplay-evidence-agent: Public Wiki Search - 조사 필요 - https://www.google.com/search?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94+game+wiki
- [S11] tier-3 / database-search / candidate / gameplay-evidence-agent: MobyGames Search - 조사 필요 - https://www.mobygames.com/search/?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94
- [S12] tier-4 / review-search / candidate / critic-review-agent: Review Search - 조사 필요 - https://www.google.com/search?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94+review+game
- [S13] tier-1 / ugc-platform-search / candidate / ugc-platform-agent: MapleStory Worlds Search - 메이플 듀얼 - https://www.google.com/search?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC%20%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC%20%EC%9B%94%EB%93%9C
- [S14] tier-1 / ugc-platform-search / candidate / ugc-platform-agent: MapleStory Worlds English Search - 메이플 듀얼 - https://www.google.com/search?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC%20MapleStory%20Worlds
- [S15] tier-2 / creator-search / candidate / creator-profile-agent: Creator/Profile Search - 메이플 듀얼 - https://www.google.com/search?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC+creator+profile+MapleStory+Worlds
- [S16] tier-3 / gameplay-video / candidate / ugc-gameplay-observation-agent: YouTube Gameplay Search - 메이플 듀얼 - https://www.youtube.com/results?search_query=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC%20%ED%94%8C%EB%A0%88%EC%9D%B4%20%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC%20%EC%9B%94%EB%93%9C
- [S17] tier-3 / korean-community / candidate / ugc-community-signal-agent: Naver Community Search - 메이플 듀얼 - https://search.naver.com/search.naver?query=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC%20%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC%20%EC%9B%94%EB%93%9C
- [S18] tier-3 / ugc-template-search / candidate / ugc-genre-template-agent: UGC Template Comparison Search - 메이플 듀얼 - https://www.google.com/search?q=%EB%A9%94%EC%9D%B4%ED%94%8C%20%EB%93%80%EC%96%BC%20%EB%93%80%EC%96%BC%20PVP%20%EB%AF%B8%EB%8B%88%EA%B2%8C%EC%9E%84%20%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC%20%EC%9B%94%EB%93%9C
- [S19] tier-1 / ugc-platform-search / candidate / ugc-platform-agent: MapleStory Worlds Search - 조사 필요 - https://www.google.com/search?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94%20%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC%20%EC%9B%94%EB%93%9C
- [S20] tier-1 / ugc-platform-search / candidate / ugc-platform-agent: MapleStory Worlds English Search - 조사 필요 - https://www.google.com/search?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94%20MapleStory%20Worlds
- [S21] tier-2 / creator-search / candidate / creator-profile-agent: Creator/Profile Search - 조사 필요 - https://www.google.com/search?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94+creator+profile+MapleStory+Worlds
- [S22] tier-3 / gameplay-video / candidate / ugc-gameplay-observation-agent: YouTube Gameplay Search - 조사 필요 - https://www.youtube.com/results?search_query=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94%20%ED%94%8C%EB%A0%88%EC%9D%B4%20%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC%20%EC%9B%94%EB%93%9C
- [S23] tier-3 / korean-community / candidate / ugc-community-signal-agent: Naver Community Search - 조사 필요 - https://search.naver.com/search.naver?query=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94%20%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC%20%EC%9B%94%EB%93%9C
- [S24] tier-3 / ugc-template-search / candidate / ugc-genre-template-agent: UGC Template Comparison Search - 조사 필요 - https://www.google.com/search?q=%EC%A1%B0%EC%82%AC%20%ED%95%84%EC%9A%94%20%EB%93%80%EC%96%BC%20PVP%20%EB%AF%B8%EB%8B%88%EA%B2%8C%EC%9E%84%20%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC%20%EC%9B%94%EB%93%9C
- [U1] user-note / user-note / provided / gameplay-evidence-agent: User Raw Note
- [S25] tier-3 / reference / fetched / gameplay-evidence-agent: Wikipedia - Yoo Ah-in (matched: 조사 필요) - https://en.wikipedia.org/wiki/Yoo_Ah-in

## Claims

- C1: platform = MapleStory Worlds (medium, user-note, U1, gameplay-evidence-agent)
- C2: raw_note = 메이플스토리 월드 플랫폼의 유저 제작 게임. 플랫폼 내부 페이지, 제작자, 플레이 영상, 커뮤니티 반응 확인 필요. (medium, user-note, U1, gameplay-evidence-agent)
- C3: alias = 메이플 듀얼 (medium, resolver, resolver, research-orchestrator)
- C4: alias = 조사 필요 (medium, resolver, resolver, research-orchestrator)
- C5: summary = Uhm Hong-sik, known professionally as Yoo Ah-in (Korean: 유아인), is a South Korean actor, creative director, and gallerist. As an actor, he is known for his roles in Punch (2011), Secret Affair (2014), Veteran (2015), The Throne (2015), Six Flying Dragons (2015–2016), Burning (2018), #Alive (2020), Voice of Silence (2020), and Hellbound (2021). He is the recipient of various accolades, including two Blue Dragon Film Awards and two Baeksang Arts Awards. He ranked 2nd on the 2016 Forbes Korea Power Celebrity list. (medium, source-backed, S25, gameplay-evidence-agent)

## Raw Note

메이플스토리 월드 플랫폼의 유저 제작 게임. 플랫폼 내부 페이지, 제작자, 플레이 영상, 커뮤니티 반응 확인 필요.

## Evidence Level

medium

## Open Verification Items

- 핵심 재미와 차별점은 플레이 관찰 또는 공식 설명으로 보강해야 한다.
- Steam fetch did not find a usable match. tried=메이플 듀얼, 조사 필요
- Steam review fetch skipped: no fetched Steam app id.
