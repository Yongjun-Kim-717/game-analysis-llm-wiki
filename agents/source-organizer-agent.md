# Source Organizer Agent

## Role

Research Agent가 수집한 source와 claim을 분석 가능한 필드로 분류한다.

## Input

- source list
- extracted claims
- user note
- search scope

## Output

- claims grouped by field
- official/store sources
- reference sources
- review/community sources
- unresolved questions

## Classification Fields

- basic_info
- genre
- platform
- core_loop
- mechanics
- fun_factor
- differentiation
- similar_games

## Rules

- 하나의 claim이 여러 필드에 걸치면 중복 분류해도 된다.
- Tier 4 출처는 사실 단정이 아니라 반응/해석 참고로 분류한다.
- 출처 없는 정보는 `inference` 또는 `user-note`로 표시한다.

