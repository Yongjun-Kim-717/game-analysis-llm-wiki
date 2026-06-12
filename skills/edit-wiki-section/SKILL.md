# Edit Wiki Section Skill

## 목적

기존 Wiki Page의 특정 섹션만 안전하게 수정한다. 전체 문서를 새로 쓰지 않고, `## 섹션명` 단위로 교체하거나 없는 섹션은 문서 끝에 추가한다.

## 입력

- `path`: 수정할 Markdown 문서 경로
- `heading`: 수정할 섹션 제목. `##`는 생략 가능
- `content`: 해당 섹션에 들어갈 새 본문

## 출력

- 수정된 Markdown 문서
- `journal.md`에 섹션 수정 기록

## 운영 규칙

- 기존 문서를 삭제하지 않는다.
- 사실/출처 기반 문장을 수정할 때는 근거 출처를 유지하거나 새 근거를 함께 남긴다.
- 큰 구조 변경이 필요하면 먼저 Design Note나 Update Existing Page로 의사결정 기록을 남긴다.
