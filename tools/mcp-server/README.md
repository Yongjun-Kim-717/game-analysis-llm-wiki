# MCP Server

이 폴더는 Game Analysis LLM Wiki를 MCP Tool로 노출하기 위한 로컬 실행 서버이다. 외부 npm install 없이도 현재 runtime Wiki를 검색, 조회, 검증, 비교, graph 반환, journal append 할 수 있도록 순수 Node.js로 구현되어 있다.

## Resources

- `wiki://index`
- `wiki://games`
- `wiki://games/{slug}`
- `wiki://graph`

## Tools

- `wiki.search`
- `wiki.get_page`
- `schema.validate`
- `game.compare`
- `graph.get`
- `journal.append`

## 실행 방법

```bash
node src/index.js tools/list
node src/index.js tools/call wiki.search "{\"query\":\"Slay the Spire\"}"
node src/index.js tools/call wiki.get_page "{\"slug\":\"slay-the-spire\"}"
node src/index.js tools/call schema.validate "{\"path\":\"wiki/games/slay-the-spire.md\"}"
node src/index.js tools/call game.compare "{\"gameA\":\"slay-the-spire\",\"gameB\":\"hades\"}"
node src/index.js tools/call graph.get "{}"
```

## MCP stdio 모드

인자 없이 실행하면 JSON-RPC line 기반 stdio 서버로 동작한다.

```bash
node src/index.js
```

지원 method:

- `initialize`
- `tools/list`
- `tools/call`
- `resources/list`
- `resources/read`
- `prompts/list`

## 현재 구현 수준

이 서버는 운영용 MVP이다. 실제 Wiki Markdown 파일을 읽고 결과를 반환한다. 다만 LLM 모델 호출이나 웹 검색 자동화는 포함하지 않는다. Research 단계는 현재 사람이 확인한 출처 또는 별도 Agent가 제공한 raw 자료를 입력으로 받는 구조이다.
