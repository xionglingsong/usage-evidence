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
| H 语义韵查证 | "commit success 哪里怪""这个词什么感情色彩""语法对但感觉不对" | Linggle 填空看搭配伙伴分布 → Ngram 交叉验证 → 词典释义 |

不要全查 13 个源。词典直接收录（A 级）+ 语料高频（B 级）两条证据齐了即可下结论。

### 第二步：查证（各源 URL 模板、选择器、访问方式详见 references/sources.md）

- **curl 直连**：Cambridge、Longman、Etymonline、Linguee —— 在 code_exec 里拉取后按选择器提取
- **curl + 代理**：UrbanDictionary、FreeDictionary、Ngram、Thesaurus —— 先 `export https_proxy=<你的代理地址>（示例 http://127.0.0.1:7890 为 Clash 默认端口）`
- **浏览器工具**：Oxford（curl 被 TLS 指纹检测挡返回空，浏览器完全正常；短语/习语用搜索框查）；Linggle（SPA，curl 只拿到壳，浏览器直达 `https://search.linggle.com/?q={query}`）。详见 sources.md
- **被挡降级**：Collins、Merriam-Webster、Ludwig 被 Cloudflare 挡自动化访问 → Ludwig 的功能由 Linggle（填空/对比）+ Linguee（权威例句）+ FreeDictionary（Webster's/AHD/Collins 内容）覆盖
- **Ngram 定量对比**：`node scripts/ngram.mjs "phrase A,phrase B"`，自动输出近年均值、峰值年份、趋势和相对倍数。用户文章是英式或美式时加 `--corpus en-GB-2019` / `--corpus en-US-2019` 分库查证；未说明变体时用默认 en-2019 总库，若该搭配在两库频率差异显著，分别报告并在结论里标注地区归属
- **语义韵敏感词主动查**：commit、cause、pose、suffer、set in、happen、undergo、inflict、perpetrate、endure 、bring about（积极韵，与 cause 相对）、rife、budge 等词天生带氛围倾向，词典无此标签，且**对母语者直觉也是隐形的，系统语料分析是唯一检测途径**（Liu, 2020; Jurko, 2021）。用户问"哪里怪/语法对但感觉不对"，或建议中涉及这些词时，Linggle 查 `动词 + 冠词 + _`（如 commit a _）或 `动词 + _`，把返回伙伴按语义类别归类（消极/积极/中性/仅技术语境），伙伴分布即语义韵的直接证据；再用 Ngram 对比可疑搭配 vs 常规搭配交叉验证（如 commit an achievement vs achieve an achievement）。**注意语域条件化**：同一词在不同语域可呈现相反极性（如 erupted 在体育新闻偏积极、硬新闻偏消极，Nelson, 2005），用户语境有明显语域特征时在结论中注明

### 第三步：证据分级

| 级别 | 定义 | 说明 |
|---|---|---|
| A 词典收录 | 目标义项/搭配/习语被词典明确收录 | 词义类问题最强证据；**搭配类问题词典证据须配语料补充**——查词后产出错误率可高达 60%，在线搭配词典使用者反而写出更多怪搭配（Pyo, 2020; Cao, 2023），词典管什么意思，语料管怎么用 |
| B 语料高频 | Ngram 或 Linggle 显示显著频率 | 相对主流搭配 ≥1/10 为常见变体；<1/100 为罕见；Linggle 自带百分比/频次可直接引用 |
| C 平行例证 | Linguee 中联合国/欧盟/主流媒体等权威来源的平行句 | 译法查证核心证据。**平行句是参照不是答案**——盲目照抄语料命中的学生表现更差，须对比语境交叉验证后再定译法（Liu et al., 2024） |
| D 反证 | 词典未收录 + Ngram≈0 | 需两路同时成立 |

### 第四步：输出（判断先行，原话优先，建议挂靠原话）

四段固定 + 一段按需（语义韵）+ 固定末行（下次自查），顺序不可变。

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

文本类证据用引号逐字引用，不改写、不缩写、不"翻译成自己的话"；频率类原样给数字与百分比；双语平行句两侧都引。**精选 3-5 条最强证据，按 A→C 分级排序，A 级优先**——DDL 研究证实海量语料罗列会引发读者过载与误读（Söğüt, 2024; Farooqui, 2025），宁精勿滥。查不到原话的源如实标注"该源未返回可用原文"。

## 语境建议（每条必须指明依据上面哪条原话）
针对用户当前的句子/语境：
- 怎么写，如"改用 heavy rain，依据 OALD 例句原话 …"。对 C1+ 用户，除稳妥选项外附一个更老练的进阶选项（低频但词典明确收录的强搭配，标注难度）——评分员更看重搭配老练度而非绝对无误（Naismith & Juffs, 2025）
- 怎么翻译，挂平行句原话，说明视角差异（如受访者视角用 be interviewed，强调"同意接受"用 grant）
- 语域/地区/年代条件（如有）：有语域标注时必须引用原话（如 mitigate 词条音标后的 "(formal)"）；同义替换时给出级别标注（如牛津 "From the topic POLITICS C1"），帮用户判断这个词对自己的难度

## 可模仿例句（正例输入，2-3 条词典原话）
从查到的词典例句中挑 2-3 条最贴近用户语境的，逐字引用，并提炼可直接仿写的框架。**生词防护**：优先选不含超纲生词的例句；若最佳例句含 CEFR 高阶词，括注中文释义（38.5% 的学习者曾因语料生词受挫，Lusta et al., 2025）：
- "We had heavy rain all day."（Cambridge）→ 框架 have + heavy + 名词
- "The government is trying to mitigate the effects of the crisis."（OALD）→ mitigate the effects of …

纠正只解决这一次，仿写框架可复用。模仿是地道表达的习得路径，这一段不可省略。学习者的接受性识别先于产出性使用发展（McGee, 2012; Dushku & Paek, 2021），仿写正是打通"看得出→写得出"的桥，建议用户当场用框架改写自己的原句，并在未来阅读中主动留意该搭配（约 8 次接触可达母语者级加工速度，Pellicer-Sánchez et al., 2022；不复习两周即衰减，Cheng et al., 2025）。

## 语义韵提示（涉及语义韵敏感词或 H 类查证时必给，其余情况省略）
用 Linggle 填空列出该词的高频搭配伙伴，按语义类别归类展示，伙伴分布即氛围证据（百分比原样引用）：
- commit a _ → crime 39.8% / felony 9.3% / sin 3.2% / murder 2.7% / fraud / robbery …（前 51 伙伴零积极词，transaction/file 等仅限技术语境）——Linggle
- 结论一句话，如"commit 携带消极语义韵，成就类宾语应改用 achieve / make / attain"
- 如有 Ngram 交叉验证（如 commit an achievement vs achieve an achievement 频率悬殊），一并引用

## 易错易混辨析
- 此位置常见错误 + 反证数据（如 accept an interview，Linggle 前 51 高频动词中无此搭配）
- 近义/形近对比（如 damage 损害[不可数] vs damages 赔偿金[plural]，剑桥词典独立词条）

下次自查（固定末行，教用户脱离本 skill 也能查）：
按本次问题类型给一条最短自助路径，一行即可——搭配疑问 → Linggle 填空；译法疑问 → Linguee 中文查询；词义疑问 → 牛津/Cambridge。hands-on 自查的记忆保持显著优于被动接受结果（Saeedakhtar et al., 2020），这一行不可省略。
```

## 批改模式（用户贴整段英文或译文时自动进入）

文献依据：无预标记的独立纠错是认知难题，成功实现都是"先标记错误 → 再语料查询"（Chambers & O'Sullivan, 2004; Crosthwaite, 2017; Tono et al., 2014; Li, 2023）。本 skill 的 AI 承担标记角色，语料承担裁判角色。

1. **范围声明先行**：告知用户本次检查用词层（搭配、介词、词形、语义韵、语域），不含语法句法——语料查证对复杂句法效果低（Crosthwaite, 2017）
2. **标记可疑点**，只标本 skill 强项类。**一致性启发式优先**：中英逐词对应的搭配（强风 strong wind）有一致性促进、风险低；中英不对应的（浓茶正确说法是 strong tea 而非直译 dense tea，强降雨是 heavy rain 而非 strong rain）是负迁移高发区，优先标记（Min et al., 2023; Wang, 2011——83.7% 的虚化动词产出直接镜像中文结构）
   - 搭配可疑（中文直译痕迹、动宾反常，如 strong rain / accept an interview）
   - 虚化动词错配（do/make/take + 名词的错选——中国学习者第一大搭配错误源，92.3% 的此类错误遵循普通话语义模式，do 型占 75%，Zhu, 2022; Liang & Dong, 2022，如 do exercise 做题）
   - 名词复合直译（词性混淆型 Chinglish，如 today morning、freedom life、singers match，Zhu, 2022）
   - 介词、冠词、词形问题
   - 语义韵敏感词（commit/cause/pose/suffer 等的宾语氛围是否匹配）
   - 近义词互换导致的韵错位（如 gain/obtain 被当完全同义互换——母语者 gain 限积极韵、obtain 中性，Zhang, 2009；cause/lead to 同理）
   - 语域错位（口语表达进了正式文）
   - 同框架过度重复（同一词块或句式框架在文中反复出现，如 it is important to note that 连用多次——L2 写作者词块总量常超母语者但结构窄、重复高，靠套话堆学术腔，Li & Lei, 2025；提示变换或压缩为短语结构）
   - 不标：复杂句法、风格偏好、无查证依据的"感觉"；用户明示的修辞性语义韵冲突（故意制造搭配不协调以达成讽刺或幽默效果，Jensen, 2024）不算错误
3. **逐点查证**走标准流程（第一至四步）。**译文批改时目标语单语证据优先**：不只对照原文，优先用 Ngram/Linggle/词典等目标语单语源验证译文的自然度，防止源语结构干扰产生 calque（职业译者修订阶段的规范做法，Fantinuoli, 2016; Jensen et al., 2012），但批改模式下每点证据表精简到 1-2 条最强证据，可模仿例句只给全文最关键的 1-2 处，防止整篇报告过载
4. **输出批改报告**，按原文顺序：
   - 原句片段 → 结论（✅/⚠️/❌）→ 一句话原话依据 + 来源 → 修改建议
5. **末尾汇总**：本次错误类型分布 + 下次自查一行

## 边界

- Urban Dictionary 是社区内容：只用于识别俚语义和流行度，不作为标准用法依据
- Ngram 是书籍语料：口语、2019 后新词覆盖弱，新词/网络语用 Urban Dictionary + Linguee 补充
- **本 skill 强项是用词**——搭配、语域、语义韵、译法。语法准确性不是它的强项（DDL 研究显示语料查询对语法准确性的提升不显著，Kızıl, 2023），用户问语法问题时建议其使用语法检查工具，不要用词典证据硬答语法判断
- 所有源都查不到时明确说"未能查证"，给保守建议（改用更常见表达），不要硬下结论
