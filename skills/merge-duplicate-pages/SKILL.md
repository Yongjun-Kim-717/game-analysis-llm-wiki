# Merge Duplicate Pages Skill

## 목적

한글/영문 표기 차이, 별칭, 오타 등으로 같은 게임 문서가 중복 생성되었을 때 canonical page로 병합한다.

## 입력

- `canonicalPath`: 유지할 대표 문서 경로
- `duplicatePath`: deprecated 처리할 중복 문서 경로
- `reason`: 병합 사유

## 출력

- canonical page의 `aliases`에 중복 문서명 또는 별칭 추가
- duplicate page의 `status: deprecated`
- duplicate page의 `replaced_by`에 canonical page 경로 추가
- canonical page에 `Merge Note` 추가
- duplicate page에 `Deprecated Note` 추가
- `journal.md` 기록

## 운영 규칙

- 중복 문서를 즉시 삭제하지 않는다.
- 파일 경로는 alias로 넣지 않고 merge note에만 기록한다.
- GUI 기본 목록에서는 `deprecated` 문서를 숨기되, 직접 경로나 MCP 조회로 이력 확인은 가능하게 둔다.
- 검색 실패로 생성된 seed 문서는 canonical page가 생긴 뒤 deprecated 처리한다.
