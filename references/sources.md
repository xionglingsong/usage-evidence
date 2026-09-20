# 查证源档案（2026-09-19 实测）

## 访问矩阵

| 源 | 访问方式 | 实测状态 |
|---|---|---|
| Oxford Learner's | curl 直连（浏览器备用） | OK，2026-09-20 双端复核通过（此前 0 字节为短时限流，非指纹检测） |
| Cambridge | curl 直连 | OK，HTML 结构最规整 |
| Longman LDOCE | curl 直连 | OK |
| Etymonline | curl 直连 | OK |
| Linguee | curl 直连 | OK（注意 HTML 属性用单引号） |
| Urban Dictionary | curl + 代理 | OK |
| TheFreeDictionary | curl + 代理 | OK |
| Google Ngram JSON | curl + 代理 | OK，有 JSON API |
| Thesaurus.com | curl + 代理 | OK |
| Linggle | curl 直连（JSON API） | OK，`/api/ngram/` 路径传参返回 JSON（2026-09-20 workbuddy 实验发现，本地复核通过） |
| Collins | 不可用 | Cloudflare 挡 curl 和浏览器 |
| Merriam-Webster | 不可用 | Cloudflare Turnstile 连浏览器都过不去 |
| Ludwig | 不可用 | Cloudflare Turnstile，浏览器验证也过不去 |

代理设置（curl 需要代理的源时先执行）：

```
export https_proxy=<你的代理地址>  # 示例 http://127.0.0.1:7890 为 Clash 默认端口，按需替换
```

curl 统一带 UA：`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36`

## 1. Oxford Learner's（OALD/OALDE，用户最常用，每天在用）

- URL 模板：
  - 英式：`https://www.oxfordlearnersdictionaries.com/definition/english/{word}`
  - 美式：`/definition/american_english/{word}`
  - 单词会自动 301 到 `{word}_1`/`{word}_2`（按词性分条目），直接访问不带编号的 URL 即可
- **curl 直连可用**（2026-09-20 复核：带 Chrome UA 返回 200 + 完整 HTML 约 84KB，释义/搭配式/例句选择器解析正常；2026-09-19 曾遇连续 0 字节，当时误判为 TLS 指纹检测，实为短时限流——遇 0 字节稍候重试或切浏览器）
- **短语/习语不能猜 URL slug**（如 `be-raining-cats-and-dogs` 会 404）。正确姿势用搜索框：
  1. `browser_navigate` 打开任一词条页
  2. `browser_type` 在 "Enter search text" 输入框填入短语
  3. `browser_click` 点击 Search 按钮
  - 搜索会跳到主干词条（如 raining cats and dogs → cat 词条），习语在该页 Idioms 板块
- `?q=` 查询参数无效（跳回首页），不要用
- 词条页快照可直接读出：义项编号+释义、Idioms 板块（含 British English/informal 等语域标注）、Collocations、Word Origin、Other results 同词族链接、Oxford Learner's Dictionary of Academic English 入口
- 教学增强信息（2026-09-19 实测 mitigate 词条）：
  - 语域标注紧跟音标，如 mitigate 词条的 "(formal)"
  - 同义词直接给出，如 "SYNONYM alleviate"，可 browser_click 跟进对比
  - 级别标注两种形态——词头区域的 Oxford 3000/5000 徽标 + CEFR 字母、topic 标签（如 rain 页 "TOPICS WeatherA1"、词云板块 "From the topic POLITICS C1"），备考和选词难度判断用
  - "See … in the Oxford Advanced American Dictionary" 与 "… Dictionary of Academic English" 入口，英美差异和学术语域可直接跳转
- 猜错 URL 的错误页有 "Did you mean" 建议链接，可直接 browser_click 跟进

## 2. Cambridge（结构最规整，curl 解析首选）

- URL：`https://dictionary.cambridge.org/dictionary/english/{word}`
- curl 直连。提取选择器（HTML class，双引号）：
  - 释义：`def ddef_d db`（所属块 `def-block ddef_block`）
  - 例句：`examp dexamp`
  - 短语：`phrase haf`
  - 地区标注 US/UK：`region dreg`
  - 语法信息：`gram dgram`
- 强项：英美双地区标注、语域标注、页面约 370KB 但 class 稳定

## 3. Longman LDOCE

- URL：`https://www.ldoceonline.com/dictionary/{word}`
- curl 直连。选择器：例句 `EXAMPLE`（注意大写）、义项 `Sense`
- 强项：例句量最大（单词条 50+ 条）、搭配与语域信息密

## 4. Etymonline（词源）

- URL：`https://www.etymonline.com/word/{word}`
- curl 直连，正文即词源叙述
- 强项：首用年代、语义演变，判断"新词还是老词""何时开始流行"

## 5. Linguee（平行文本，译法查证核心）

- URL：`https://www.linguee.com/english-chinese/translation/{query}.html`（词间用 `+`，此模式稳定）
  - 备用：`/english-chinese/search?query={query}`
  - 中文当查询词也可以，双向都能查
- curl 直连。**HTML 属性是单引号**，提取选择器（td 标签，class 可能带 warn 等后缀）：
  - 查询语言侧：`/<td class='sentence left[^']*'>[\s\S]*?<\/td>/g`
  - 目标语言侧：`/<td class='sentence right2[^']*'>[\s\S]*?<\/td>/g`
  - **左右方向随查询语言反转**（2026-09-19 实测）：英文查询时 left=英文、right2=中文；中文查询时 left=中文、right2=英文
  - 来源域名跟在例句尾部（如 daccess-ods.un.org、legco.gov.hk），引用时注明
- 高亮陷阱：Linguee 用 `<b class='bN'>` 逐字包裹查询词，先 `html.replace(/<\/b>\s*<b[^>]*>/g, '')` 再 strip 标签，否则单词被拆散（如 "whe n"）

## 6. Urban Dictionary（俚语）

- URL：`https://www.urbandictionary.com/define.php?term={term}`（空格用 `+`）
- curl + 代理。提取选择器（2026-09-19 实测，每页 6 个词条按热度排）：
  - 词条块：`/class="definition bg-white[^"]*"[\s\S]*?(?=class="definition bg-white|<\/main|$)/g`
  - 释义：块内 `/class="break-words meaning mb-5"[^>]*>([\s\S]*?)<\/(?:p|div)>/`
  - 例句：块内 `/class="break-words example italic[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div)>/`，`<br>` 是换行
  - 查不到词条会跳到随机页或无结果页，词条块数为 0 即未收录
- 社区内容：用于识别俚语/网络用语含义与流行度（多词条看共识，个别词条质量差），**不作为标准用法证据**

## 7. TheFreeDictionary（Collins/Merriam-Webster 的降级替代）

- URL：`https://www.thefreedictionary.com/{word}`
- curl + 代理
- 整合 American Heritage、Webster's Revised Unabridged、Collins 部分内容，一站多词典

## 8. Google Books Ngram（定量频率）

- JSON API：`https://books.google.com/ngrams/json?content={A},{B}&year_start=1800&year_end=2019&corpus=en-2019&smoothing=3`
  - 多短语逗号分隔（URL 编码 `%2C`）；**区分大小写**，变体分别列出对比
  - corpus：`en-2019`（默认总库）/ `en-US-2019` / `en-GB-2019` / `eng_2019`（百万书平衡库，查 19 世纪前用它）
- curl + 代理，或直接用 `scripts/ngram.mjs`（自动统计均值/峰值/趋势/倍数）
- 解读：数值为该短语占语料库全部对应长度词组的比例；绝对值无意义，**相对倍数和趋势才有意义**
- 英美分库教学用法：en-GB-2019 与 en-US-2019 分别查同一搭配，频率差异大即该搭配有明显地区归属（英式习语常见此类），结论需标注地区；ngram.mjs 用 `--corpus` 参数切换
- 局限：书籍语料，口语和 2019 后新词覆盖弱

## 9. Thesaurus.com（同义词）

- URL：`https://www.thesaurus.com/browse/{word}`
- curl + 代理
- 按义项分组的同/反义词列表，辨析选词用

## 10. Linggle（搭配发现 + 频率排序，浏览器路径）

- **JSON API（首选，curl 直连）**：`GET https://search.linggle.com/api/ngram/{urlencode(查询式)}`，空格编码为 `%20`，如 `https://search.linggle.com/api/ngram/the%20introduction%20_`
  - 返回 `{"query":..., "ngrams":[["短语", 次数], ...]}`，按频次降序，直接解析 JSON
  - **必须路径传参：`?q=` 形式会 301 到空结果**（实测陷阱）
  - 例句接口：`POST /api/example/`
  - 查询式语法在 API 中同样有效：`_` 任意一词、`*` 0+ 词、`?` 可选词、`v./n./adj./prep.` 词性标签
- 网页版（备用，适合人看分布表）：`https://search.linggle.com/?q={query}`，SPA 需浏览器渲染，curl 只拿到壳
- 结果表格（Phrases / % / Count）快照可直接读，自带百分比和频次
- 查询语法（台湾清华 NLPLab 学术语料，2026-09-19 实测全部有效）：
  - `_` 匹配任意一个词：`play a role _` → play a role in（89.9%，76 万次）/ as（2%）/ of（1%）…
  - `*` 匹配 0 个或多个词：`in * way` → in any way / in the way / in a way
  - `?` 可选词：`listen ?to music` → 对比 listen to music vs listen music 哪个常用
  - 词性标签：`adj. dinner`（dinner 前的形容词）、`v. war`、`n.`、`prep.` 等
- 与 Ngram 分工：**Ngram 验证**"想到的两个短语哪个常用"；**Linggle 发现**"这个位置上常用什么词"。填空类问题 Linggle 一步到位
- 语义韵查证用法（2026-09-19 实测 commit a _）：查 `动词 + 冠词 + _` 或 `动词 + _`，把返回搭配伙伴按语义类别归类（消极/积极/中性/仅技术语境），伙伴分布即语义韵证据——commit a _ 前 51 伙伴全是 crime 39.8% / felony 9.3% / sin 3.2% / murder 2.7% / fraud / robbery 一族，加 transaction / file 等技术语境，零积极词。词典无语义韵标签，此法是唯一可查证路径。**释义限定语线索**（2026-09-20 实测 cause）：少数敏感词的韵直接写在释义里——剑桥 cause 名词释义原话 "the reason why something, especially something bad, happens"，especially something bad 就是韵。查敏感词时先扫释义中的 especially / mostly / usually + 评价性形容词，再上 Linggle 伙伴分布验证，两路证据互证
- 输出的百分比/频次可直接引用为 B 级证据（语料高频）

## 11. Ludwig（当前被挡）

- Cloudflare Turnstile：curl 403，浏览器点验证也过不去（2026-09-19 实测）
- 原功能全有替代，降级损失小：
  - "A VS B" 词频对比 → Linggle 分别查两个搭配看百分比，或 Ngram
  - `*` 缺词填空 → Linggle 的 `_` / `*` 语法
  - `_` 同义替换 → Linggle 填空 + Thesaurus.com
  - 权威媒体例句（NYT、经济学人）→ Linguee 平行句（带权威来源）
- 不必依赖；Cloudflare 策略变化时可偶尔重试

## 12. Collins（当前被挡）

- Cloudflare 挡自动化访问：curl 403，浏览器 challenge 无法通过
- 降级：词频功能用 Ngram 替代；释义用 FreeDictionary（含 Collins 部分内容）
- 可偶尔重试（Cloudflare 策略会变），但不要依赖

## 13. Merriam-Webster（当前被挡）

- Cloudflare Turnstile：curl 403，浏览器点了验证框也过不去
- 降级：FreeDictionary（Webster's Revised Unabridged）+ Cambridge 美式标注

## code_exec 提取代码模式（Node，无第三方依赖）

```js
import { execFileSync } from 'node:child_process';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const html = execFileSync('curl', ['-s', '-m', '20', '-A', UA, url], { encoding: 'utf8', env: { ...process.env } });
// Cambridge 释义块：
// html.match(/<div class="def ddef_d db"[^>]*>([\s\S]*?)<\/div>/g)
// Cambridge 例句：
// html.match(/<div class="examp dexamp"[^>]*>([\s\S]*?)<\/div>/g)
// LDOCE 例句：<span class="EXAMPLE" ...>...</span>
// Linguee（单引号 td）：<td class='sentence left[^']*'>...</td>，先 html.replace(/<\/b>\s*<b[^>]*>/g, '') 合并高亮再 strip
// 提取后 strip 标签再给用户
```
