# Archive Wiki Page Skill

## 목적

잘못 생성되었거나 더 이상 대표 문서로 쓰지 않는 Wiki Page를 삭제하지 않고 보관 상태로 전환한다.

## 입력

- `path`: 보관할 Markdown 문서 경로
- `reason`: 보관 처리 사유

## 출력

- frontmatter `status: archived`
- `Archive Note` 섹션
- `journal.md` 기록

## 운영 규칙

- LLM Wiki의 지식 이력은 삭제보다 보관을 우선한다.
- 단순 오타/중복/검색 실패 문서도 원인을 남겨야 한다.
- 완전 삭제는 제출물 정리나 개인정보 제거처럼 명확한 사유가 있을 때만 수동으로 수행한다.
