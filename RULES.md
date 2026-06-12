# RULES.md

이 저장소는 Markdown 기반 Game Analysis LLM Wiki를 운영하기 위한 하네스다.

## 운영 원칙

1. 모든 새 지식은 `raw/` 요청 또는 출처 메모를 거쳐 `wiki/`로 정리한다.
2. `wiki/games/*.md`는 `SCHEMA.md`의 게임 분석 스키마를 따른다.
3. 에이전트는 근거가 약한 내용을 단정하지 않고 `검증 필요 사항`에 기록한다.
4. 비교 분석은 추측보다 근거와 기존 wiki page를 우선한다.
5. 작업 완료 시 `journal.md`에 변경 이유와 역할을 기록한다.
6. 삭제보다 `deprecated` 또는 `archived` 상태를 우선한다.
7. Wiki 저장/수정/보관/병합은 MCP `wiki.write_page`, `wiki.update_page`, `wiki.archive_page`, `wiki.merge_page`를 우선 사용한다.

## 허용 작업

- raw item 생성
- wiki page 초안 생성 및 수정
- MCP Tool을 통한 검색, 조회, 저장, 검증, 비교
- viewer를 통한 결과 확인
- graph, index, journal 유지보수
- duplicate page 병합과 archive/deprecated 처리

## 금지 작업

- API Key 또는 개인 토큰 커밋
- 출처 없는 수치나 사실 단정
- 기존 지식의 물리 삭제
- private repo 제출
- deprecated 문서를 canonical 문서처럼 GUI 기본 목록에 노출
