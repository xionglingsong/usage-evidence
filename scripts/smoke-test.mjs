#!/usr/bin/env node
// usage-evidence 自测脚本：验证查证链路核心不变量（改版后跑一遍防回归）
// 用法：node scripts/smoke-test.mjs [--proxy http://127.0.0.1:7890]
// 网络受限项（Ngram/版本自查）在无代理时自动 SKIP，不算失败

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const proxyIdx = args.indexOf("--proxy");
const PROXY = proxyIdx >= 0 ? args[proxyIdx + 1] : "http://127.0.0.1:7890";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

const results = [];
function record(name, pass, detail, skip = false) {
  results.push({ name, status: skip ? "SKIP" : pass ? "PASS" : "FAIL", detail });
}

function curlJson(url, withProxy = false) {
  const cmd = `${withProxy ? `https_proxy=${PROXY} ` : ""}curl -s -m 25 -A '${UA}' '${url}'`;
  const out = execSync(cmd, { encoding: "utf-8", timeout: 30000, stdio: ["pipe", "pipe", "pipe"] });
  return JSON.parse(out);
}

// ---------- 1. OpenAlex 实词组合区分性 ----------
try {
  const c1 = curlJson("https://api.openalex.org/works?search=%22conduct%20research%22&per-page=1").meta.count;
  const c2 = curlJson("https://api.openalex.org/works?search=%22do%20research%22&per-page=1").meta.count;
  record("openalex-实词短语区分", c1 > 3 * c2 && c1 > 500000, `conduct ${c1.toLocaleString()} vs do ${c2.toLocaleString()}（应 >3 倍）`);
} catch (e) { record("openalex-实词短语区分", false, e.message.slice(0, 120)); }

// ---------- 2. OpenAlex 同值退化检测器 ----------
try {
  const a = curlJson("https://api.openalex.org/works?search=%22play%20a%20role%20in%22&per-page=1").meta.count;
  const b = curlJson("https://api.openalex.org/works?search=%22play%20a%20role%20on%22&per-page=1").meta.count;
  record("openalex-同值退化检测", a === b && a > 1000000, `in/on 均 ${a.toLocaleString()}（同值=检测器前提成立）`);
} catch (e) { record("openalex-同值退化检测", false, e.message.slice(0, 120)); }

// ---------- 3. PubMed querytranslation 词典命中判读 ----------
try {
  const d = curlJson("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=%22to%20the%20best%20of%20our%20knowledge%22%5BAbstract%5D&retmode=json").esearchresult;
  const tr = d.querytranslation || "";
  const isDict = tr.includes('"to the best of our knowledge"') && !tr.includes(" AND ");
  record("pubmed-词典命中判读", isDict && +d.count > 50000, `count ${(+d.count).toLocaleString()}，翻译保留引号短语=${isDict}`);
} catch (e) { record("pubmed-词典命中判读", false, e.message.slice(0, 120)); }

// ---------- 4. Ngram 真短语比例（需代理） ----------
try {
  const d = curlJson("https://books.google.com/ngrams/json?content=play+a+role+in,play+a+role+on&year_start=1900&year_end=2019&corpus=en-2019&smoothing=3", true);
  const recent = (arr) => arr.slice(-10).reduce((s, x) => s + parseFloat(x), 0) / 10;
  const ratio = recent(d[0].timeseries) / Math.max(recent(d[1].timeseries), 1e-12);
  record("ngram-真短语比例", ratio > 100, `in/on 近十年均值比 ${ratio.toFixed(0)} 倍（应 >100）`);
} catch (e) { record("ngram-真短语比例", false, "网络受限（代理不可达）", true); }

// ---------- 5. 版本自查链路（需代理） ----------
try {
  const local = readFileSync(join(root, "SKILL.md"), "utf-8").match(/^version:\s*(.+)$/m)[1];
  const raw = execSync(`https_proxy=${PROXY} curl -s -m 15 'https://raw.githubusercontent.com/xionglingsong/usage-evidence/main/SKILL.md'`, { encoding: "utf-8", timeout: 20000 });
  const remote = raw.match(/^version:\s*(.+)$/m)?.[1]?.trim();
  record("版本自查链路", remote === local.trim(), `本地 ${local.trim()} vs 远程 ${remote ?? "不可达"}`);
} catch (e) { record("版本自查链路", false, "网络受限（代理不可达）", true); }

// ---------- 汇总 ----------
const fails = results.filter((r) => r.status === "FAIL").length;
const skips = results.filter((r) => r.status === "SKIP").length;
console.log("usage-evidence smoke test");
console.log("=".repeat(60));
for (const r of results) console.log(`[${r.status}] ${r.name}  ${r.detail}`);
console.log("=".repeat(60));
console.log(`${results.length - fails - skips} pass, ${fails} fail, ${skips} skip`);
process.exit(fails > 0 ? 1 : 0);
