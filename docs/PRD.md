# PRD.md

## 1. Product Name

**Game Analysis LLM Wiki Tool**

## 2. Product Summary

Game Analysis LLM Wiki Tool은 사용자가 게임 이름을 입력하면, LLM Agent들이 웹 검색, 정보 정리, 근거 검수, 게임 분석, 위키 페이지 작성, 리뷰와 수정 적용을 순차적으로 수행하도록 설계된 MCP 기반 Wiki Tool이다.

최종 산출물은 Markdown 기반 게임 분석 Wiki Page이며, MCP 서버는 Wiki 검색, 페이지 조회, 초안 생성, 비교, schema 검증, graph 반환, journal 기록 기능을 LLM Agent에게 제공한다.

## 3. Problem Statement

게임 분석은 단순히 게임 소개 정보를 모으는 작업이 아니다. 좋은 게임 분석은 다음 질문에 답해야 한다.

- 이 게임은 어떤 장르 관습 위에 있는가?
- 플레이어는 어떤 행동을 반복하는가?
- 핵심 재미는 어떤 행동, 피드백, 선택, 보상 구조에서 발생하는가?
- 기존 유사 게임과 비교했을 때 무엇이 다른가?
- 분석 주장은 어떤 근거에 기반하는가?

일반적인 LLM 답변은 이 과정을 한 번에 처리하려고 하므로, 출처와 해석이 섞이고 재사용 가능한 지식으로 남기 어렵다. 따라서 본 프로젝트는 게임 분석을 **Wiki Page + Agent Workflow + MCP Tool + Journal** 구조로 관리한다.

## 4. Target Users

| User | 목적 |
| --- | --- |
| 게임 기획 학습자 | 기존 게임의 핵심 재미와 시스템 구조를 분석 |
| 인디 게임 개발자 | 유사 게임과 차별점을 비교하고 아이디어 검증 |
| 게임 리뷰어 | 감상문이 아닌 구조화된 분석 자료 작성 |
| LLM Agent 사용자 | 게임 이름만 입력해 반복 가능한 분석 Wiki 생성 |

## 5. User Story

### Main User Story

```text
사용자로서 나는 게임 이름을 입력하면,
에이전트들이 관련 정보를 조사하고 검수한 뒤,
그 게임의 핵심 재미와 차별점을 포함한 Wiki Page를 생성해주기를 원한다.
```

### Example

```text
User: Hades를 분석해서 게임 분석 Wiki Page로 만들어줘.

System:
1. Hades 관련 공식/공개 정보를 수집한다.
2. 장르와 유사 게임 후보를 정리한다.
3. Core Loop와 핵심 재미 가설을 작성한다.
4. Dead Cells, Enter the Gungeon 등과 차별점을 비교한다.
5. 근거 수준을 검토한다.
6. Markdown Wiki Page를 생성한다.
7. schema 검증 후 index와 graph를 갱신한다.
```

## 6. MVP Scope

### Included

- 게임 분석 도메인 정의
- Agent workflow 설계
- MCP Tool 목록과 동작 방식 정의
- Game Analysis Wiki Page schema
- 샘플 게임 3개 기반 UI 시각화
- 3-panel MVP GUI 이미지
- README 실행/동작 설명

### Excluded

- 실제 대규모 웹 크롤러
- 완전 자동 배포 시스템
- 실시간 상용 챗봇
- 대규모 게임 데이터베이스
- Public GitHub Repo 배포

## 7. Functional Requirements

### FR-1. Game Name Intake

사용자는 게임 이름을 입력할 수 있어야 한다.

입력 예:

```text
Hades
```

출력:

- 분석 세션 ID
- 필요한 Agent 목록
- 초기 검색 키워드

### FR-2. Research Workflow

Research Agent는 게임명 기반으로 정보를 수집한다.

수집 범위:

- 공식 홈페이지 또는 스토어 페이지
- 개발사/퍼블리셔 정보
- 장르 정보
- 공개 리뷰나 설명
- 유사 게임 후보

### FR-3. Evidence Classification

수집된 정보는 다음 유형으로 분류되어야 한다.

| Type | 의미 |
| --- | --- |
| Official | 공식 사이트, 스토어, 개발사 자료 |
| Observed | 플레이 영상, 직접 플레이, 스크린샷 기반 관찰 |
| Inferred | 수집 정보를 바탕으로 한 해석 |
| Evaluative | 장단점 또는 재미에 대한 평가 |
| Unverified | 추가 검증이 필요한 정보 |

### FR-4. Core Loop Analysis

Game Analyst Agent는 게임의 반복 플레이 구조를 분석한다.

출력 예:

```text
Explore room -> Fight enemies -> Choose reward -> Build character -> Die or clear -> Return with progression
```

### FR-5. Fun Factor Hypothesis

핵심 재미는 기능 이름이 아니라 다음 구조로 설명되어야 한다.

```text
반복 행동
  -> 즉각적 피드백
  -> 의미 있는 선택
  -> 보상 또는 변화
  -> 다시 플레이할 이유
```

### FR-6. Differentiation Analysis

Comparison Agent는 장르 관습과 유사 게임을 기준으로 차별점을 도출한다.

필수 비교 항목:

- Core Loop
- 주요 메커닉
- 실패/보상 구조
- 성장 구조
- 서사와 시스템의 연결

### FR-7. Wiki Page Generation

Wiki Builder Agent는 schema에 맞는 Markdown Page를 생성한다.

필수 섹션:

- 기본 정보
- 한 줄 정의
- Core Loop
- 핵심 재미 가설
- 주요 시스템
- 장르 관습과 비교
- 차별점 분석
- 유사 게임 비교
- 근거 자료
- 검증 필요 사항
- 관련 Wiki Pages
- 유지보수 메모

### FR-8. Schema Validation

Review Agent는 `schema.validate` MCP Tool을 호출하여 필수 섹션, metadata, 링크, 근거 수준을 확인한다.

### FR-9. Graph Visualization Data

MCP 서버는 게임, 장르, 메커닉, 차별점 관계를 graph JSON으로 반환해야 한다.

예:

```json
{
  "nodes": [
    {"id": "hades", "type": "game"},
    {"id": "roguelite", "type": "genre"},
    {"id": "meta-progression", "type": "mechanic"}
  ],
  "edges": [
    {"source": "hades", "target": "roguelite", "type": "belongs_to"},
    {"source": "hades", "target": "meta-progression", "type": "uses"}
  ]
}
```

### FR-10. Journal Append

Maintenance Agent는 작업 라운드별 결과를 append-only 방식으로 기록해야 한다.

## 8. Non-Functional Requirements

| Requirement | 설명 |
| --- | --- |
| Reusability | 다른 게임에도 동일 workflow를 반복 적용 가능해야 함 |
| Traceability | 분석 주장에는 출처 또는 근거 수준이 있어야 함 |
| Safety | Agent는 허용된 MCP Tool만 사용해야 함 |
| Maintainability | Wiki Page, graph, journal이 분리 관리되어야 함 |
| Inspectability | Agent 라운드와 Tool 호출 결과가 UI에 표시되어야 함 |

## 9. MCP Tool Requirements

| Tool | Input | Output | Permission |
| --- | --- | --- | --- |
| `wiki.search` | query, filters | page list | read |
| `wiki.get_page` | page path | markdown content | read |
| `wiki.write_page` | page path, markdown | validation result | write |
| `wiki.update_page` | page path, markdown or section | validation result | write/update |
| `game.compare` | game A, game B, axes | comparison table | read/analyze |
| `schema.validate` | markdown page | validation result | read |
| `graph.get` | optional filters | graph JSON | read |
| `journal.append` | event summary | journal entry | append-only |

## 10. Agent SPEC

### Orchestrator Agent

- Role: 전체 작업 라운드 관리
- Input: user request
- Output: task plan, agent route
- Allowed Tools: `wiki.search`, `journal.append`
- Forbidden: 직접 Wiki Page 작성

### Research Agent

- Role: 게임 관련 정보와 출처 수집
- Input: game name
- Output: source summary
- Allowed Tools: web search, `wiki.search`
- Forbidden: 출처 없는 평가 작성

### Source Organizer Agent

- Role: 수집 정보를 official/observed/inferred/evaluative/unverified로 분리
- Input: source summary
- Output: organized evidence table
- Allowed Tools: `wiki.get_page`
- Forbidden: 최종 평가 확정

### Evidence Reviewer Agent

- Role: 분석 주장과 근거 수준 검토
- Input: organized evidence, draft claims
- Output: evidence review
- Allowed Tools: `schema.validate`, `wiki.get_page`
- Forbidden: 검증되지 않은 주장을 stable로 표시

### Game Analyst Agent

- Role: Core Loop와 핵심 재미 분석
- Input: organized evidence
- Output: core loop, fun factor hypothesis
- Allowed Tools: `wiki.search`, `wiki.get_page`
- Forbidden: 출처 없는 사실 단정

### Comparison Agent

- Role: 유사 게임 비교와 차별점 도출
- Input: target game, comparable games
- Output: comparison table, differentiators
- Allowed Tools: `game.compare`, `wiki.search`
- Forbidden: 비교 기준 없는 차별점 주장

### Wiki Builder Agent

- Role: schema 기반 Markdown Wiki Page 생성
- Input: reviewed analysis package
- Output: draft Wiki Page
- Allowed Tools: `wiki.write_page`, `wiki.get_page`
- Forbidden: index/journal 직접 수정

### Review Agent

- Role: 문서 품질, schema, 링크, 근거 검토
- Input: draft Wiki Page
- Output: review feedback
- Allowed Tools: `schema.validate`
- Forbidden: 직접 수정

### Revision Agent

- Role: Review feedback 반영
- Input: draft page, review feedback
- Output: revised page
- Allowed Tools: `wiki.update_page`, `schema.validate`
- Forbidden: 승인되지 않은 구조 변경

### Maintenance Agent

- Role: index, graph, journal 갱신
- Input: revised page
- Output: updated graph, journal entry
- Allowed Tools: `graph.get`, `journal.append`, `schema.validate`
- Forbidden: 기존 지식 삭제

## 11. Game Page Metadata

```yaml
---
title: Hades
page_type: game-analysis
status: draft | reviewed | stable
game_slug: hades
genre:
  - roguelite
  - action
platform:
  - PC
evidence_level: medium
core_loop:
  - room-combat
  - reward-selection
  - death-return
mechanics:
  - meta-progression
  - build-crafting
  - narrative-on-failure
similar_games:
  - dead-cells
  - enter-the-gungeon
last_reviewed: YYYY-MM-DD
---
```

## 12. Acceptance Criteria

MVP는 다음 조건을 만족하면 완료로 본다.

- [ ] 게임 분석 도메인이 명확히 정의되어 있다.
- [ ] 사용자가 게임 이름을 입력하는 workflow가 설명되어 있다.
- [ ] Agent 역할, 권한, 허용 Tool이 정리되어 있다.
- [ ] MCP Tool 목록과 입출력이 설명되어 있다.
- [ ] Game Analysis Wiki Page schema가 정의되어 있다.
- [ ] Wiki Page를 어떤 방식으로 시각화할지 설명되어 있다.
- [ ] MVP GUI 이미지가 포함되어 있다.
- [ ] README에 실행 방법, 환경, 의존성, MCP Tool 동작 방식이 포함되어 있다.

## 13. Risks

| Risk | 대응 |
| --- | --- |
| 웹 검색 정보의 신뢰도 부족 | Evidence Reviewer Agent가 근거 수준을 표시 |
| 분석이 감상문처럼 흐름 | Core Loop, Fun Factor, Differentiation schema 강제 |
| MCP Tool 범위가 과도해짐 | MVP는 search, get, draft, compare, validate, graph, journal로 제한 |
| GUI 구현 범위 과대 | 제출용 MVP 이미지는 핵심 흐름 시각화에 집중 |

## 14. MVP Success Definition

사용자가 MVP 이미지를 보았을 때 다음을 이해할 수 있으면 성공이다.

- 게임 분석 Wiki가 어떤 지식을 관리하는지
- 게임 이름 입력 후 Agent들이 어떤 순서로 작업하는지
- MCP Tool이 어떤 역할을 하는지
- Wiki Page와 graph가 어떻게 시각화되는지
- 이 구조가 다른 게임 분석에도 재사용 가능한 Harness라는 점
