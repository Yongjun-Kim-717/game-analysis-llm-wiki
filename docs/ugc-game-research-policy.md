# UGC Game Research Policy

이 문서는 MapleStory Worlds, Roblox, Fortnite Creative, Minecraft server/mod, Steam Workshop 같은 사용자 제작 게임을 분석할 때의 출처 정책을 정의한다.

## 왜 별도 정책이 필요한가

사용자 제작 게임은 Steam, Wikipedia, MobyGames, 전문 리뷰 매체에 등록되지 않은 경우가 많다. 정보는 보통 플랫폼 내부 페이지, 제작자 프로필, 업데이트 공지, 댓글/좋아요/방문자 수, 플레이 영상, 한국 커뮤니티 글에 흩어져 있다.

따라서 UGC 게임 분석은 상용 게임처럼 `official/store/reference/critic` 중심으로 시작하지 않고, 플랫폼 내부 신호와 플레이 관찰을 우선한다.

## UGC Source Coverage

| Coverage | 의미 | 예시 |
|---|---|---|
| `ugc-platform` | 플랫폼 내부 게임 페이지 또는 플랫폼 검색 후보 | MapleStory Worlds, Roblox, Fortnite Creative |
| `creator` | 제작자 프로필, 제작자 공지, 제작자의 다른 게임 | creator page, dev note |
| `platform-community` | 플랫폼 내부 댓글/좋아요/방문자 수 또는 플랫폼 커뮤니티 반응 | comments, likes, visits |
| `gameplay-observation` | 직접 플레이, 플레이 영상, 스크린샷 기반 관찰 | YouTube gameplay, user note |
| `template-comparison` | 플랫폼 내부 유사 장르/템플릿 비교 | duel arena, tycoon, obby, battleground |

## UGC Evidence Level

- `high`: 플랫폼 페이지, 플레이 관찰, 커뮤니티 신호가 함께 있다.
- `medium`: 플랫폼 페이지와 설명/영상/스크린샷 기반 분석이 있다.
- `low`: 사용자 메모나 후보 링크만 있다.
- `seed`: 플랫폼 페이지도 찾지 못했다.

## Trust Flags

- `needs-ugc-platform-page`
- `needs-creator-profile`
- `needs-direct-play-observation`
- `needs-platform-community-signal`
- `needs-template-comparison`

## Rules

- 플랫폼 내부 게임 상세 페이지는 UGC 게임의 Tier 1 출처로 본다.
- 좋아요/방문자 수/댓글은 사실 정보가 아니라 activity signal로 취급한다.
- 플레이 영상과 직접 관찰은 core loop와 onboarding 판단에 중요하지만, 전체 게임 품질을 단정하지 않는다.
- 한국어 제목 게임은 Naver, YouTube, 플랫폼명 조합 검색 후보를 반드시 만든다.
- 출처가 없으면 분석을 억지로 채우지 않고 `seed` 또는 `needs-research`로 둔다.
