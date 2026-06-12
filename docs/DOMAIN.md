# DOMAIN.md

## 1. 지식 도메인 정의

본 프로젝트의 지식 도메인은 **게임 분석(Game Analysis)** 이다. 사용자가 게임 이름을 입력하면, LLM 에이전트들이 게임 관련 정보를 수집하고 검수한 뒤, 해당 게임의 핵심 재미, 구조, 장르적 차별점, 유사 게임 비교, 근거 자료를 Markdown 기반 LLM Wiki Page로 정리하는 것을 목표로 한다.

기본 강의 주제(CSE-3308)를 직접 Wiki Pages로 서빙하는 대신, 본 프로젝트는 강의에서 배운 Agentic Coding, Harness, MCP, Skill, Journal, Review Loop 개념을 활용하여 **게임 분석 전용 LLM Wiki Tool**을 설계한다.

## 2. 왜 게임 분석 Wiki인가?

게임 분석은 단순한 정보 요약이 아니라 다음과 같은 복합적인 판단을 요구한다.

- 게임의 장르와 기본 정보 파악
- 플레이어가 반복하는 핵심 행동 구조(Core Loop) 분석
- 핵심 재미 요소(Fun Factor) 도출
- 기존 장르 관습과 비교한 차별점 분석
- 유사 게임과의 비교
- 공식 정보, 관찰 정보, 해석, 평가의 구분
- 분석 근거의 신뢰도 관리

이 과정은 한 번의 프롬프트로 끝내기 어렵고, 여러 에이전트가 역할을 나누어 진행하는 Agentic Workflow에 적합하다.

## 3. 최종 사용자 시나리오

사용자는 다음과 같이 요청한다.

```text
Hades를 분석해서 게임 분석 Wiki Page로 만들어줘.
```

시스템은 다음 흐름으로 작업한다.

```text
사용자 게임명 입력
  -> Orchestrator Agent가 작업 세션 생성
  -> Research Agent가 웹 검색과 출처 수집
  -> Source Organizer Agent가 정보 정리
  -> Evidence Reviewer Agent가 사실/관찰/해석/평가 구분
  -> Game Analyst Agent가 Core Loop와 핵심 재미 분석
  -> Comparison Agent가 유사 게임과 차별점 비교
  -> Wiki Builder Agent가 Markdown Wiki Page 생성
  -> Review Agent가 schema, 링크, 근거, 문서 품질 검토
  -> Revision Agent가 피드백 반영
  -> Maintenance Agent가 index, graph, journal 갱신
```

## 4. Wiki에 저장할 지식

게임 분석 Wiki는 다음 유형의 페이지를 관리한다.

| Page Type | 설명 | 예시 |
| --- | --- | --- |
| Game Page | 개별 게임 분석 문서 | `wiki/games/hades.md` |
| Mechanic Page | 게임 메커닉 개념 문서 | `wiki/mechanics/meta-progression.md` |
| Genre Page | 장르 관습과 비교 기준 | `wiki/genres/roguelite.md` |
| Comparison Page | 유사 게임 비교 문서 | `wiki/comparisons/hades-vs-dead-cells.md` |
| Evidence Page | 출처, 플레이 메모, 검증 자료 | `wiki/evidence/hades-sources.md` |

## 5. 게임 분석 Page Schema 초안

게임 분석 Wiki Page는 다음 구조를 따른다.

```markdown
# 게임명

## 기본 정보

## 한 줄 정의

## Core Loop

## 핵심 재미 가설

## 주요 시스템

## 장르 관습과 비교

## 차별점 분석

## 유사 게임 비교

## 근거 자료

## 검증 필요 사항

## 관련 Wiki Pages

## 유지보수 메모
```

## 6. MCP 서버가 필요한 이유

Markdown Wiki만으로도 문서를 저장할 수 있지만, LLM 에이전트가 안정적으로 검색, 생성, 검증, 시각화를 수행하려면 도구 계층이 필요하다. MCP 서버는 이 도구 계층 역할을 한다.

MCP 서버는 다음 기능을 제공한다.

| MCP 기능 | 본 프로젝트에서의 역할 |
| --- | --- |
| Resources | Wiki Page, game index, graph data를 LLM에게 제공 |
| Tools | 검색, 비교, schema 검증, page 생성, graph 갱신 수행 |
| Prompts | 게임 분석, 검수, 비교 작업을 위한 재사용 가능한 prompt 제공 |

## 7. 사용할 MCP Tool 후보

MVP에서 사용할 MCP Tool은 다음과 같다.

| Tool | 목적 |
| --- | --- |
| `wiki.search` | 게임명, 장르, 메커닉, 태그 기반 Wiki 검색 |
| `wiki.get_page` | 특정 Wiki Page 내용을 반환 |
| `wiki.write_page` | 분석 결과를 Markdown Wiki Page로 저장 |
| `wiki.update_page` | 기존 Wiki Page 또는 특정 섹션을 갱신 |
| `game.compare` | 두 게임의 Core Loop, 메커닉, 차별점을 비교 |
| `schema.validate` | 생성된 Wiki Page가 schema를 만족하는지 검증 |
| `graph.get` | 게임-장르-메커닉 관계 graph JSON 반환 |
| `journal.append` | agent 작업 기록을 append-only 방식으로 저장 |

## 8. 시각화 방향

MVP GUI는 첨부 샘플처럼 3-panel 구조를 목표로 한다.

```text
왼쪽: Wiki Index / 게임 목록 / 장르 필터 / 메커닉 필터
중앙: 선택된 게임 분석 Wiki Page
오른쪽: Wiki Agent 대화 패널 / MCP Tool 호출 결과 / 검토 피드백
```

추가 시각화 요소:

- 게임-메커닉-장르 관계 그래프
- 유사 게임 비교표
- schema validation 상태
- evidence confidence 표시
- agent 작업 라운드 로그

## 9. MVP 범위

본 과제의 MVP는 완전 자동화된 상용 시스템이 아니라, 다음 흐름을 설명하고 시각화하는 최소 구현/설계 산출물이다.

- 게임명 입력
- 에이전트 기반 조사/정리/검수/위키 생성 workflow
- MCP Tool 목록과 동작 방식
- Markdown Wiki Page serving 구조
- MVP GUI 이미지

샘플 게임은 다음 세 개를 기준으로 설계한다.

- Hades
- Dead Cells
- Slay the Spire

## 10. 하네스 관점

본 프로젝트는 재사용 가능한 Harness를 중요하게 본다.

| Harness 요소 | 본 프로젝트의 대응 |
| --- | --- |
| Contract | PRD와 schema |
| Procedure | Agent workflow와 MCP Tool sequence |
| Journal | `DECISION_LOG.md`, `journal.append` |
| Preference | Agent SPEC과 allowed tool policy |
| Skill | 게임 분석, 비교, 검수 prompt/workflow |

따라서 이 프로젝트의 핵심은 단순한 Wiki UI가 아니라, **게임 분석을 반복 가능하게 만드는 Agent + MCP + Wiki Harness**이다.
