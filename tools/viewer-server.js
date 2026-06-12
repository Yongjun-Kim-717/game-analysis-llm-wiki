import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  gameCompare,
  schemaValidate,
  wikiGetPage,
  wikiSearch
} from "./mcp-server/src/index.js";
import { runSkill } from "./skill-runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const VIEWER_ROOT = path.join(ROOT, "viewer");
const PORT = Number(process.env.PORT || 4173);

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, " ")
    .trim();
}

function findMentionedGames(question) {
  const pages = wikiSearch({ query: "", filters: ["game-analysis"] }).results;
  const normalizedQuestion = normalize(question);
  return pages.filter((page) => {
    const title = normalize(page.title);
    const slug = normalize(page.slug);
    return normalizedQuestion.includes(title) || normalizedQuestion.includes(slug);
  });
}

function formatCompareAnswer(compareResult) {
  const lines = [
    `${compareResult.gameA.title}와 ${compareResult.gameB.title} 비교 결과입니다.`,
    "",
    `근거 문서: ${compareResult.gameA.path}, ${compareResult.gameB.path}`,
    compareResult.existing_comparison_page ? `기존 비교 문서: ${compareResult.existing_comparison_page}` : "기존 비교 문서: 없음",
    ""
  ];
  for (const row of compareResult.rows) {
    lines.push(`- ${row.axis}`);
    lines.push(`  - ${compareResult.gameA.title}: ${Array.isArray(row[compareResult.gameA.slug]) ? row[compareResult.gameA.slug].join(", ") : row[compareResult.gameA.slug] || "정보 없음"}`);
    lines.push(`  - ${compareResult.gameB.title}: ${Array.isArray(row[compareResult.gameB.slug]) ? row[compareResult.gameB.slug].join(", ") : row[compareResult.gameB.slug] || "정보 없음"}`);
  }
  if (compareResult.summary) {
    lines.push("");
    lines.push(`요약: ${compareResult.summary}`);
  }
  return lines.join("\n");
}

function assistantAnswer(question) {
  const text = String(question || "").trim();
  if (!text) {
    return {
      mode: "empty",
      answer: "질문을 입력하면 Wiki 안의 게임 분석 문서를 검색하거나 비교합니다.",
      sources: []
    };
  }

  const mentionedGames = findMentionedGames(text);
  const wantsCompare = /비교|compare| vs |차이|다른|유사/.test(text.toLowerCase());
  if (wantsCompare && mentionedGames.length >= 2) {
    const result = gameCompare({
      gameA: mentionedGames[0].slug,
      gameB: mentionedGames[1].slug
    });
    return {
      mode: "compare",
      answer: formatCompareAnswer(result),
      sources: [result.gameA.path, result.gameB.path, result.existing_comparison_page].filter(Boolean),
      raw: result
    };
  }

  const searchResult = wikiSearch({ query: text });
  const top = searchResult.results.slice(0, 5);
  return {
    mode: "search",
    answer: top.length
      ? `관련 Wiki 문서 ${top.length}개를 찾았습니다.\n\n${top.map((item) => `- ${item.title} (${item.path})`).join("\n")}`
      : "관련 문서를 찾지 못했습니다. 게임명, 태그, 메커니즘 키워드로 다시 검색해보세요.",
    sources: top.map((item) => item.path),
    raw: searchResult
  };
}

function send(res, status, body, contentType = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": contentType });
  res.end(body);
}

function sendJson(res, status, value) {
  send(res, status, JSON.stringify(value, null, 2));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(res, pathname) {
  const target = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(VIEWER_ROOT, target);
  if (!filePath.startsWith(VIEWER_ROOT) || !fs.existsSync(filePath)) {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
    return;
  }
  const ext = path.extname(filePath);
  const mime = ext === ".css"
    ? "text/css; charset=utf-8"
    : ext === ".js"
      ? "text/javascript; charset=utf-8"
      : "text/html; charset=utf-8";
  send(res, 200, fs.readFileSync(filePath), mime);
}

async function handleApi(req, res, url) {
  try {
    if (url.pathname === "/api/skill/run") {
      const body = req.method === "POST" ? await readJsonBody(req) : Object.fromEntries(url.searchParams.entries());
      sendJson(res, 200, await runSkill(body));
      return;
    }
    if (url.pathname === "/api/search") {
      sendJson(res, 200, wikiSearch({
        query: url.searchParams.get("q") || "",
        filters: url.searchParams.getAll("filter")
      }));
      return;
    }
    if (url.pathname === "/api/assistant") {
      sendJson(res, 200, assistantAnswer(url.searchParams.get("q") || ""));
      return;
    }
    if (url.pathname === "/api/page") {
      sendJson(res, 200, wikiGetPage({
        path: url.searchParams.get("path") || "",
        slug: url.searchParams.get("slug") || ""
      }));
      return;
    }
    if (url.pathname === "/api/compare") {
      sendJson(res, 200, gameCompare({
        gameA: url.searchParams.get("a") || "slay-the-spire",
        gameB: url.searchParams.get("b") || "hades"
      }));
      return;
    }
    if (url.pathname === "/api/validate") {
      sendJson(res, 200, schemaValidate({
        path: url.searchParams.get("path") || "wiki/games/slay-the-spire.md"
      }));
      return;
    }
    sendJson(res, 404, { error: "Unknown API route" });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
    return;
  }
  serveStatic(res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Game Analysis LLM Wiki viewer: http://localhost:${PORT}`);
});
