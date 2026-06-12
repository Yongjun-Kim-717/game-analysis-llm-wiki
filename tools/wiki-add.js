import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function arg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function slugify(value) {
  return String(value || "untitled-game")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const title = arg("title", "Untitled Game");
const genre = arg("genre", "unknown");
const platform = arg("platform", "unknown");
const note = arg("note", "사용자가 추가한 raw item입니다.");
const slug = slugify(title);
const date = new Date().toISOString().slice(0, 10);

const rawPath = path.join(ROOT, "raw", "requests", `${date}-${slug}.md`);
const wikiPath = path.join(ROOT, "wiki", "games", `${slug}.md`);

if (fs.existsSync(wikiPath)) {
  throw new Error(`Wiki page already exists: ${path.relative(ROOT, wikiPath)}`);
}

const raw = `# ${title} raw request

- title: ${title}
- genre: ${genre}
- platform: ${platform}
- note: ${note}
- created_at: ${date}
`;

const wiki = `---
title: ${title}
page_type: game-analysis
status: draft
game_slug: ${slug}
genre:
  - ${genre}
platform:
  - ${platform}
evidence_level: seed
core_loop:
  - 조사 필요
mechanics:
  - 조사 필요
similar_games: []
last_reviewed: ${date}
---

# ${title}

## 기본 정보

- 장르: ${genre}
- 플랫폼: ${platform}
- 상태: draft

## 한 줄 정의

${note}

## Core Loop

1. 조사 필요

## 핵심 재미 가설

- 조사 필요

## 주요 시스템

- 조사 필요

## 장르 관점과 비교

- 조사 필요

## 차별점 분석

- 조사 필요

## 유사 게임 비교

- 조사 필요

## 근거 자료

- ${path.relative(ROOT, rawPath).replaceAll("\\", "/")}

## 검증 필요 사항

- 공식 출처, 스토어 페이지, 리뷰/플레이 자료를 추가해야 한다.

## 관련 Wiki Pages

- [Wiki Index](../index.md)

## 유지보수 메모

- ${date}: \`npm run wiki:add\`로 생성된 초안.
`;

fs.mkdirSync(path.dirname(rawPath), { recursive: true });
fs.mkdirSync(path.dirname(wikiPath), { recursive: true });
fs.writeFileSync(rawPath, raw, "utf8");
fs.writeFileSync(wikiPath, wiki, "utf8");
fs.appendFileSync(path.join(ROOT, "journal.md"), `\n- ${date}: [wiki-add] ${title} 초안 페이지 생성\n`, "utf8");

console.log(JSON.stringify({
  ok: true,
  raw: path.relative(ROOT, rawPath).replaceAll("\\", "/"),
  wiki: path.relative(ROOT, wikiPath).replaceAll("\\", "/")
}, null, 2));
