---
name: usage-evidence
description: Evidence-based English usage verification for writing and translation. When the user asks whether a word, phrase, collocation, idiom, or Chinese-to-English translation is idiomatic or correct, query real online dictionaries and corpora (Oxford, Cambridge, Longman, Linguee, Google Books Ngram, etc.) and answer with cited evidence instead of model intuition.
metadata:
  keywords:
    - usage evidence
    - idiomatic check
    - collocation check
    - ngram comparison
    - natural english check
    - dictionary verification
---

# Usage Evidence（英语用法查证）

用户在写作或翻译中问"这个单词/词组能不能这样写、这样翻地不地道"时，先查真实词典与语料库，再给 evidence-based 结论。**禁止凭模型语感回答这类问题。**

## 核心纪律

1. **每个结论必须有出处，证据必须逐字引用原话**。判断"能用/不能用/更佳"时至少附一条真实证据，且证据必须是查证页面的原文——词典释义原文、例句原文、平行句原文、频率数字，原样引用并标注来源（词典/语料库名 + 词条或查询式）。禁止把 AI 的转述、概括、改写当作证据。查到什么引用什么，不虚构释义和例句。
2. **查不到 ≠ 不存在**。某词典未收录只能表述为"该词典未收录"；判"不建议使用"需两路反证（词典未收录 + Ngram 频率≈0）。
3. **事实与推断分开**。频率数字、词典释义、来源例句是事实；"更自然/更地道"是推断，须写明依据（如"A 频率是 B 的 40 倍"）。
4. **网络失败如实报告**（哪些源查不了），不降级为凭感觉回答。

## 工作流

### 第一步：分类（可多选），按类选 2-4 个源

| 类型 | 典型问题 | 首选源（按序） |
|---|---|---|
| A 搭配查证 | "strong rain 能写吗" | Ngram/Linggle 对比 → Oxford/LDOCE 例句 → Linguee |
| B 词义存在性 | "X 有这个义项吗" | Oxford（浏览器）→ Cambridge → FreeDictionary |
| C 语域/正式度 | "这是俚语/过时/正式吗" | 词典语域标注 → Ngram 趋势 → Urban Dictionary |
| D 历时趋势 | "这用法流行还是过时了" | Ngram → Etymonline |
| E 译法查证 | "压力大 = big pressure?" | Linguee 平行句 → Ngram → 词典 |
| F 同义辨析 | "A 和 B 用哪个" | Thesaurus.com → 双词典对比 → Ngram |
| G 搭配发现 | "play a role 后面接什么""这里该用哪个介词" | Linggle 填空（`_`/`*`/`?`/词性标签）→ 词典例句 |

不要全查 13 个源。词典直接收录（A 级）+ 语料高频（B 级）两条证据齐了即可下结论。

### 第二步：查证（各源 URL 模板、选择器、访问方式详见 references/sources.md）

- **curl 直连**：Cambridge、Longman、Etymonline、Linguee —— 在 code_exec 里拉取后按选择器提取
- **curl + 代理**：UrbanDictionary、FreeDictionary、Ngram、Thesaurus —— 先 `export https_proxy=<你的代理地址>（示例 http://127.0.0.1:7890 为 Clash 默认端口）`
- **浏览器工具**：Oxford（curl 被 TLS 指纹检测挡返回空，浏览器完全正常；短语/习语用搜索框查）；Linggle（SPA，curl 只拿到壳，浏览器直达 `https://search.linggle.com/?q={query}`）。详见 sources.md
- **被挡降级**：Collins、Merriam-Webster、Ludwig 被 Cloudflare 挡自动化访问 → Ludwig 的功能由 Linggle（填空/对比）+ Linguee（权威例句）+ FreeDictionary（Webster's/AHD/Collins 内容）覆盖
- **Ngram 定量对比**：`node scripts/ngram.mjs "phrase A,phrase B"`，自动输出近年均值、峰值年份、趋势和相对倍数

### 第三步：证据分级

| 级别 | 定义 | 说明 |
|---|---|---|
| A 词典收录 | 目标义项/搭配/习语被词典明确收录 | 最强证据 |
| B 语料高频 | Ngram 或 Linggle 显示显著频率 | 相对主流搭配 ≥1/10 为常见变体；<1/100 为罕见；Linggle 自带百分比/频次可直接引用 |
| C 平行例证 | Linguee 中联合国/欧盟/主流媒体等权威来源的平行句 | 译法查证核心证据 |
| D 反证 | 词典未收录 + Ngram≈0 | 需两路同时成立 |

### 第四步：输出（判断先行，原话优先，建议挂靠原话）

固定三段结构，顺序不可变。

```
## 结论
✅ 可用 / ⚠️ 有条件可用（注明语域/地区/年代条件）/ ❌ 不建议 → 给替代，一句话

## 原话证据（逐字引用查证页面，标注来源）
| 原话 / 数据 | 出处 |
|---|---|
| "[uncountable, singular] water that falls from the sky in separate drops" | OALD rain 名词 义项 1 |
| "We had heavy rain all day." | Cambridge rain 例句 |
| heavy rain 760,000 次（89.9%）| Linggle 查询结果表 |
| "所有接受采访者做出了匿名的承诺" ↔ "All respondents have been promised anonymity" | Linguee（daccess-ods.un.org） |

文本类证据用引号逐字引用，不改写、不缩写、不"翻译成自己的话"；频率类原样给数字与百分比；双语平行句两侧都引。查不到原话的源如实标注"该源未返回可用原文"。

## 语境建议（每条必须指明依据上面哪条原话）
针对用户当前的句子/语境：
- 怎么写，如"改用 heavy rain，依据 OALD 例句原话 …"
- 怎么翻译，挂平行句原话，说明视角差异（如受访者视角用 be interviewed，强调"同意接受"用 grant）
- 语域/地区/年代条件（如有）

## 易错易混辨析
- 此位置常见错误 + 反证数据（如 accept an interview，Linggle 前 51 高频动词中无此搭配）
- 近义/形近对比（如 damage 损害[不可数] vs damages 赔偿金[plural]，剑桥词典独立词条）
```

## 边界

- Urban Dictionary 是社区内容：只用于识别俚语义和流行度，不作为标准用法依据
- Ngram 是书籍语料：口语、2019 后新词覆盖弱，新词/网络语用 Urban Dictionary + Linguee 补充
- 所有源都查不到时明确说"未能查证"，给保守建议（改用更常见表达），不要硬下结论
