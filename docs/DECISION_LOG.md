# DECISION_LOG.md

## 1. 문서 목적

이 문서는 게임 분석 LLM Wiki Tool을 설계하기 위해 Agent와 의사결정 라운드를 거쳐 정리한 기록이다. 지난 과제의 LLM Wiki Repository와 Journal 구조를 참고하여, 이번 과제에서는 **MCP 서버 기반 Wiki Tool + 게임 분석 도메인 + 시각화 MVP**를 목표로 의사결정을 정리한다.

본 문서는 단순 작업 로그가 아니라 다음 질문에 대한 판단 과정을 남긴다.

- 어떤 지식 도메인을 선택했는가?
- 왜 그 도메인이 LLM Wiki에 적합한가?
- MCP 서버가 어떤 역할을 해야 하는가?
- 어떤 Agent가 필요하며, 각 Agent는 어떤 권한을 가져야 하는가?
- MVP에서 어디까지 구현/시각화할 것인가?

## 2. Round 0 - 이전 과제에서 가져온 기반

### 입력

이전 과제에서 Markdown-only LLM Wiki Repository를 구현했다.

주요 구성:

- `AGENTS.md`
- `SCHEMA.md`
- `pipeline/`
- `handoffs/`
- `maintenance/`
- `hooks/`
- `journal.md`

### 관찰

이전 과제는 LLM Wiki의 기본 구조를 설계하는 데 집중했다. 그러나 실제 사용 관점에서는 다음 확장이 필요하다.

- 사용자가 자연어로 요청했을 때 Wiki를 자동 생성하는 workflow
- Wiki Page를 검색/검증/갱신하는 Tool 계층
- 여러 Wiki Page 간 관계를 시각화하는 UI
- Agent 작업 라운드를 추적하는 Journal/Handoff 구조

### 결정

이번 과제는 이전 과제의 Markdown-only Wiki 구조를 확장하여, **MCP 서버를 통해 LLM Agent가 사용할 수 있는 게임 분석 Wiki Tool**로 설계한다.

## 3. Round 1 - 지식 도메인 선택

### 후보

| 후보 도메인 | 장점 | 단점 |
| --- | --- | --- |
| CSE-3308 강의 주제 Wiki | 강의와 직접 연결됨 | 평가가 빡빡할 수 있고, 샘플과 유사해 차별성이 약함 |
| 소프트웨어 공학 개념 Wiki | 구조화하기 쉬움 | 이전 과제와 중복될 수 있음 |
| 게임 분석 Wiki | 비교, 시각화, 에이전트 분업이 명확함 | 분석 기준을 별도로 설계해야 함 |

### 판단

게임 분석은 다음 이유로 MCP 기반 LLM Wiki에 적합하다.

- 게임명 하나가 입력으로 주어지면 여러 출처를 조사해야 한다.
- 공식 정보, 관찰 정보, 해석, 평가를 구분해야 한다.
- 장르, 메커닉, Core Loop, 차별점, 유사 게임 비교를 구조화할 수 있다.
- 게임-장르-메커닉 관계를 graph로 시각화하기 쉽다.
- 반복 분석 workflow를 Skill/Harness로 재사용할 수 있다.

### 결정

최종 도메인은 **게임 분석 Wiki**로 선택한다.

## 4. Round 2 - 사용자 시나리오 정의

### 사용자 요청 예시

```text
Hades를 분석해서 게임 분석 Wiki Page로 만들어줘.
```

### 필요한 시스템 반응

1. 게임명으로 조사 범위를 결정한다.
2. 웹 검색과 출처 수집을 수행한다.
3. 수집한 정보를 사실/관찰/해석/평가로 분리한다.
4. Core Loop와 핵심 재미를 분석한다.
5. 유사 게임과 비교하여 차별점을 도출한다.
6. Schema에 맞는 Wiki Page를 작성한다.
7. Review와 Revision을 거친다.
8. Index, graph, journal을 갱신한다.

### 결정

MVP는 완전 자동 실행보다, 위 workflow가 MCP Tool과 Agent를 통해 어떻게 수행되는지 보여주는 **재사용 가능한 하네스 설계 + 시각화 가능한 MVP**로 구현한다.

## 5. Round 3 - Agent 역할 결정

### 필요한 Agent 후보

| Agent | 역할 | 필요성 |
| --- | --- | --- |
| Orchestrator Agent | 전체 작업 흐름 관리 | sub-agent 순서와 handoff 관리 |
| Research Agent | 웹 검색과 출처 수집 | 게임명 입력만으로 정보 확보 |
| Source Organizer Agent | 출처별 정보 정리 | 자료 혼합 방지 |
| Evidence Reviewer Agent | 사실/관찰/해석/평가 구분 | 분석 신뢰도 확보 |
| Game Analyst Agent | Core Loop와 핵심 재미 분석 | 게임 분석의 핵심 |
| Comparison Agent | 유사 게임 비교와 차별점 도출 | 게임 분석 Wiki의 차별점 |
| Wiki Builder Agent | Markdown Wiki Page 작성 | schema 기반 산출물 생성 |
| Review Agent | 문서 품질과 schema 검토 | 오류와 누락 방지 |
| Revision Agent | 피드백 반영 | Review Loop 완성 |
| Maintenance Agent | index, graph, journal 갱신 | 장기 유지보수 |

### 권한 원칙

- Research Agent는 읽기와 검색만 수행한다.
- Wiki Builder Agent는 draft page 작성만 수행한다.
- Review Agent는 직접 수정하지 않고 피드백만 작성한다.
- Revision Agent는 승인된 피드백만 반영한다.
- Maintenance Agent는 index, graph, journal 갱신 권한을 가진다.

### 결정

Agent 역할을 명확히 분리하고, 각 Agent의 입력/출력/허용 Tool을 PRD와 README에 명시한다.

## 6. Round 4 - MCP Tool 결정

### Tool 설계 기준

MCP Tool은 Agent가 직접 파일을 무작위로 조작하지 않고, 정의된 기능을 통해 Wiki를 다루도록 만드는 안전한 인터페이스여야 한다.

### MVP Tool 목록

| Tool | 기능 | 호출 Agent |
| --- | --- | --- |
| `wiki.search` | Wiki Page 검색 | Orchestrator, Research, Review |
| `wiki.get_page` | 특정 Page 읽기 | 모든 Agent |
| `wiki.write_page` | 분석 결과를 Markdown Wiki Page로 저장 | Wiki Builder |
| `wiki.update_page` | 기존 Page 또는 특정 섹션을 갱신 | Revision, Maintenance |
| `game.compare` | 두 게임의 Core Loop와 차별점 비교 | Comparison Agent |
| `schema.validate` | Wiki Page schema 검증 | Review Agent |
| `graph.get` | graph 시각화용 JSON 반환 | UI, Orchestrator |
| `journal.append` | 작업 기록 추가 | Maintenance Agent |

### 제외한 Tool

| 제외 Tool | 제외 이유 |
| --- | --- |
| `wiki.delete_page` | MVP에서는 지식 삭제가 위험함 |
| `web.auto_crawl_all` | 범위가 커지고 출처 신뢰도 관리가 어려움 |
| `game.score_review` | 점수화는 주관성이 커서 MVP에서는 제외 |

### 결정

MVP는 검색, 읽기, 초안 생성, 비교, 검증, graph 반환, journal 기록에 집중한다.

## 7. Round 5 - Wiki Page Schema 결정

### Game Page 필수 섹션

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

### 근거 분류

게임 분석에서는 정보의 성격을 구분해야 한다.

| 분류 | 의미 |
| --- | --- |
| 공식 정보 | 개발사, 퍼블리셔, 스토어, 공식 홈페이지 등 |
| 관찰 정보 | 플레이 영상, 직접 플레이, 스크린샷 등에서 확인 |
| 해석 | 수집 정보를 기반으로 한 분석 |
| 평가 | 장단점과 재미에 대한 판단 |
| 미확인 | 추가 검증이 필요한 주장 |

### 결정

Wiki Page는 단순 리뷰가 아니라 근거 기반 분석 문서로 작성한다.

## 8. Round 6 - 시각화 방식 결정

### 후보

| 방식 | 장점 | 단점 |
| --- | --- | --- |
| 단순 Markdown 목록 | 구현이 쉬움 | MCP 기반 Tool의 효과가 잘 보이지 않음 |
| 3-panel Wiki UI | 샘플 이미지와 유사하고 직관적 | 오른쪽 패널의 역할을 명확히 해야 함 |
| Graph 중심 UI | 관계 시각화에 강함 | MVP가 복잡해질 수 있음 |

### 결정

MVP 이미지는 **좌측 그룹형 Wiki 목록 + 중앙 Markdown Viewer + 우측 Skill Runner** 구조로 구성한다.

구성:

- 왼쪽: Games, Comparisons, Design Notes, Research Logs, Knowledge Base 그룹 목록과 태그 검색
- 중앙: 선택된 Game Analysis Wiki Page
- 오른쪽: Analyze, Compare, Validate, Quality Backfill 등 로컬 Skill 실행 패널과 pipeline 결과

## 9. Round 7 - MVP 범위 결정

### 포함

- 게임 분석 도메인 정의
- MCP Tool 기반 workflow 설명
- Agent 역할과 권한 설계
- Game Analysis Wiki Page schema
- 샘플 게임 3개 기준 시각화
- MVP GUI 이미지

### 제외

- 실제 완전 자동 웹 크롤링
- 대규모 게임 DB
- 실시간 MCP Apps 구현
- 완전한 챗봇 백엔드
- Public GitHub Repo 배포

### 이유

이번 과제의 제출물은 `.md 4종 + PNG/PDF 1종`이므로, 구현 범위를 과도하게 키우기보다 **재사용 가능한 하네스와 MCP Tool 설계가 명확히 보이는 MVP**에 집중한다.

## 10. 최종 결정 요약

| 항목 | 최종 결정 |
| --- | --- |
| 도메인 | 게임 분석 Wiki |
| 핵심 입력 | 사용자가 입력한 게임 이름 |
| 핵심 출력 | Markdown 기반 Game Analysis Wiki Page |
| Agent 구조 | Orchestrator + Research + Organizer + Reviewer + Builder + Maintenance |
| MCP 역할 | Wiki 검색, 읽기, 생성, 비교, 검증, graph 반환, journal 기록 |
| 시각화 | 그룹형 Wiki 목록 + Markdown Viewer + Skill Runner |
| 제출 전략 | 문서 4종과 MVP PNG로 하네스 중심 설계 증명 |

## 11. 다음 단계

다음 문서는 `PRD.md`이다. PRD에서는 본 프로젝트의 제품 목표, 사용자, 기능 요구사항, 비기능 요구사항, acceptance criteria, MVP 범위를 명확히 작성한다.
