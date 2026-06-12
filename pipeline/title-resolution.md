# Title Resolution Pipeline

## 목적

사용자가 한글명, 약칭, 띄어쓰기 없는 영문명으로 게임 분석을 요청해도 Wiki에는 하나의 canonical game page가 생성되도록 한다.

예:

```text
서브나우티카2 -> Subnautica 2
서브노티카2 -> Subnautica 2
Subnautica2 -> Subnautica 2
```

## 현재 MVP 구현

현재 구현은 `tools/skill-runner.js`의 `TITLE_RESOLVER`와 `resolveCanonicalTitle()`을 사용한다.

1. 원 입력명 `original_query`를 보존한다.
2. known alias map에 있으면 canonical title로 변환한다.
3. canonical title, original query, aliases를 search terms로 만든다.
4. Steam/Wikipedia/Steam Reviews fetch는 search terms를 순차적으로 시도한다.
5. 생성된 game page frontmatter에 `aliases`와 `original_query`를 저장한다.
6. MCP `wiki.search`는 title, slug, aliases, body를 함께 검색한다.

## 현재 한계

- 모든 한글 게임명을 자동 번역하거나 공식 영문명으로 변환하지는 않는다.
- alias map에 없는 게임은 입력명을 그대로 canonical title로 사용한다.
- 외부 검색 결과의 정확도는 Steam/Wikipedia API 결과에 의존한다.

## 확장 계획

1. `data/title-aliases.json` 같은 별도 alias dictionary로 resolver를 분리한다.
2. Wikidata 또는 Steam fuzzy match를 사용해 공식명 후보를 추천한다.
3. GUI에서 canonical title 후보를 보여주고 사용자가 확정할 수 있게 한다.
4. 중복 생성이 발생하면 `Merge Duplicate Pages` Skill로 canonical page에 병합한다.

## 운영 규칙

- 별칭은 검색 편의를 위해 남긴다.
- 파일 경로는 alias로 넣지 않고 merge note에 기록한다.
- deprecated duplicate page는 GUI 기본 목록에서 숨기되 이력으로 유지한다.
