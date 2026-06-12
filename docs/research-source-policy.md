# Research Source Policy

이 문서는 게임 분석 Wiki가 게임 이름 하나를 받았을 때 어떤 출처를 어떤 우선순위와 신뢰도 기준으로 다룰지 정의한다.

## 목표

게임 정보는 공식 페이지, 스토어, 비평 매체, 커뮤니티, 플레이 영상, 위키/DB에 흩어져 있다. 이 하네스는 하나의 출처를 정답으로 취급하지 않고, 출처군별 관점을 분리한 뒤 교차 검토하여 Wiki 문서에 남긴다.

## 출처 계층

| Tier | 출처군 | 예시 | 주 사용 목적 | 주의점 |
|---|---|---|---|---|
| Tier 1 | official/store | 공식 사이트, 개발사, 퍼블리셔, Steam, PlayStation, Xbox, Nintendo, Epic, App Store, Google Play | 출시 상태, 플랫폼, 공식 장르, 기본 설명 | 마케팅 문구는 재미 분석의 직접 근거로 단정하지 않는다 |
| Tier 2 | developer/press | 패치노트, devlog, 인터뷰, press kit | 개발 의도, 업데이트 방향, 운영 변화 | 오래된 자료는 현재 버전과 분리한다 |
| Tier 3 | reference/database | PCGamingWiki, MobyGames, GiantBomb, Fandom, Wikipedia | 역사, 시스템, 플랫폼 보조 확인 | 편집형 자료는 공식 사실보다 낮은 신뢰도로 둔다 |
| Tier 4 | review/community | Steam Reviews, Reddit, Discord, 커뮤니티, 리뷰 매체, YouTube/Twitch 플레이 관찰 | 실제 유저 반응, 반복 플레이 피로, 불만, 핵심 재미 체감 | 사실 정보가 아니라 플레이 경험 신호로만 사용한다 |

## 플랫폼 원칙

- Steam 중심으로 고정하지 않는다. 게임이 존재하는 플랫폼에 따라 Storefront Agent가 후보 플랫폼을 선택한다.
- PC/콘솔/모바일/온라인 게임은 서로 다른 평가 맥락을 가진다.
- 플랫폼별 평가가 충돌하면 하나로 합치지 않고 `출처별 관점 요약`과 `출처 충돌 및 해석`에 남긴다.
- 한국어 제목, 영문 제목, 별칭은 Title Resolver가 canonical title로 정규화하되 original query는 보존한다.

## 유저 반응 원칙

- 유저 리뷰와 커뮤니티 반응은 player-experience evidence로 분리한다.
- 리뷰 폭격, 밈성 반응, 지역 커뮤니티 편향, 패치 이전 평가를 bias risk로 기록한다.
- 유저 반응은 핵심 재미, 불만, retention factor, friction point 판단에는 쓸 수 있다.
- 유저 반응만으로 출시일, 개발사, 공식 장르 같은 기본 사실을 확정하지 않는다.

## 충돌 처리

출처 간 정보가 다르면 다음 순서로 처리한다.

1. 기본 사실은 Tier 1을 우선한다.
2. 개발 의도와 운영 변화는 Tier 2를 함께 본다.
3. 시스템 세부 설명은 Tier 3를 보조 근거로 둔다.
4. 체감 재미와 불만은 Tier 4를 별도 관점으로 둔다.
5. 서로 모순되는 주장은 `conflict`로 남기고, Wiki 문서에서 판단 근거를 표시한다.

## 비용 절감 원칙

본 MVP는 실제 병렬 LLM 서브에이전트 호출을 수행하지 않는다. 대신 `Spec-Based Agent Pool`을 사용한다.

- 각 source agent는 `agents/source-pool/*.md`에 역할과 출력 형식을 가진다.
- `skill-runner`는 하나의 로컬 실행 안에서 agent spec을 순차 적용한다.
- 나중에 필요한 agent만 실제 LLM/API worker로 승격할 수 있도록 evidence output format을 통일한다.
