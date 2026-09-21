---
name: usage-evidence
version: 1.13.0
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

用户在写作或翻译中问"这个单词/词组能不能这样写、这样翻地不地道"时，先查真实词典与语料库，再给 evidence-based 结论。**禁止凭模型语感回答这类问题。**依据：直接问"这样写对吗"是 LLM 评估中最不可靠的范式，存在系统性 yes 回应偏向与对别扭搭配的宽容倾向（Dentella et al., 2023; Thakur et al., 2024），而结构化对比评估下 LLM 与专业语言学家可达 89% 收敛（Qiu et al., 2024）——本 skill 的设计就是把 AI 从不可靠的"直接裁判"位置挪到可靠的"构造对比、执行查证"位置。

## 核心纪律

1. **每个结论必须有出处，证据必须逐字引用原话**。判断"能用/不能用/更佳"时至少附一条真实证据，且证据必须是查证页面的原文——词典释义原文、例句原文、平行句原文、频率数字，原样引用并标注来源（词典/语料库名 + 词条或查询式）。禁止把 AI 的转述、概括、改写当作证据。查到什么引用什么，不虚构释义和例句。**每处出处（含证据表每一行的出处列）必须写成可点击的 Markdown 超链接** `[来源名](URL)`，URL 用当次查证的真实地址按第四步锚链接速查表构造。发送前逐行自检证据表：任何一行出处是纯文字，先补链接再发——无链接不可回溯即不合格输出。
2. **查不到 ≠ 不存在**。某词典未收录只能表述为"该词典未收录"；判"不建议使用"需两路反证（词典未收录 + Ngram 频率≈0）。
3. **事实与推断分开**。频率数字、词典释义、来源例句是事实；"更自然/更地道"是推断，须写明依据（如"A 频率是 B 的 40 倍"）。
4. **网络失败如实报告**（哪些源查不了），不降级为凭感觉回答。

## 版本自查（每次查证任务开始时做一次，同一会话不重复）

拉取 `https://raw.githubusercontent.com/xionglingsong/usage-evidence/main/SKILL.md` 的 frontmatter version 字段，与本地比对。落后则在回复末尾轻提一句，如"本 skill 有新版本 v1.1.0，在安装目录运行 git pull 即可更新"。版本一致时不提及自查这件事；拉取失败或网络不通就静默跳过，**绝不阻塞查证本身**，也不向用户抱怨网络问题。

## 工作流

### 第一步：分类（可多选），按类选 2-4 个源

| 类型 | 典型问题 | 首选源（按序） |
|---|---|---|
| A 搭配查证 | "strong rain 能写吗" | Ngram/Linggle 对比 → Oxford/LDOCE 例句 → Linguee |
| B 词义存在性 | "X 有这个义项吗" | Oxford（浏览器）→ Cambridge → FreeDictionary |
| C 语域/正式度 | "这是俚语/过时/正式吗" | 词典语域标注 → Ngram 趋势 → Urban Dictionary |
| D 历时趋势 | "这用法流行还是过时了" | Ngram → Etymonline；输出附理据锚点（见第四步语境建议） |
| E 译法查证 | "压力大 = big pressure?" | Linguee 平行句（对比分析+翻译 CAT 配置）→ Ngram → 词典 |
| F 同义辨析 | "A 和 B 用哪个" | Thesaurus.com → 双词典对比 → Ngram；输出附语域光谱三档（见第四步语境建议） |
| G 搭配发现 | "play a role 后面接什么""这里该用哪个介词" | Linggle 填空（`_`/`*`/`?`/词性标签）→ 词典例句 |
| H 语义韵查证 | "commit success 哪里怪""这个词什么感情色彩""语法对但感觉不对" | Linggle 填空看搭配伙伴分布 → Ngram 交叉验证 → 词典释义 |
| I 学术语域 | "论文里能这么写吗""学科惯例是什么" | OpenAlex 计数/趋势 → PubMed（生医）/arXiv（理工）→ Google site: 浏览器（低频） |
| J 引言/摘要语步 | "我的引言结构行不行""摘要怎么组织" | 语步巡逻（引言 CARS 三语步完整性，尤其 Move 2 缺失；摘要按学科期望表，Hyland 五语步框架）→ Phrasebank 对应板块候选句式 → 语步标志短语学科内频率查证（OpenAlex） |

不要全查 13 个源。词典直接收录（A 级）+ 语料高频（B 级）两条证据齐了即可下结论。

### 第二步：查证（各源 URL 模板、选择器、访问方式详见 references/sources.md）

- **curl 直连**：Cambridge、Longman、Etymonline、Linguee、Oxford（单词词条，2026-09-20 复核通过）、Linggle（JSON API：`search.linggle.com/api/ngram/{urlencoded 查询式}`，**路径传参，?q= 会 301 到空结果**）—— 在 code_exec 里拉取后按选择器或 JSON 解析
- **curl + 代理**：UrbanDictionary、FreeDictionary、Ngram、Thesaurus —— 先 `export https_proxy=<你的代理地址>（示例 http://127.0.0.1:7890 为 Clash 默认端口）`
- **浏览器工具**：Oxford 的短语与习语查询（curl 的 ?q= 参数无效，用站内搜索框跳到主干词条的 Idioms 板块）；牛津 curl 返回 0 字节时（短时限流，非指纹检测）也切浏览器。详见 sources.md
- **介词查证的冠词绑定技巧**：查 X 后接什么介词时，Linggle 分别查 `the X _` 和 `a/an X _`——冠词会锁定介词（实测 the introduction 后 87.5% 是 of，an introduction 后 77.7% 是 to，两组分布截然不同）。介词与冠词是绑定组，分开查才准
- **被挡降级**：Collins、Merriam-Webster、Ludwig 被 Cloudflare 挡自动化访问 → Ludwig 的功能由 Linggle（填空/对比）+ Linguee（权威例句）+ FreeDictionary（Webster's/AHD/Collins 内容）覆盖
- **学术语域查证（I 类）**：OpenAlex 短语计数（约 2.5 亿文献的 title+abstract，免费无 key）+ `group_by=publication_year` 学术历时趋势；学科条件化用 concepts 过滤（先查 concepts id 再 filter）。生医语境加 PubMed esearch 计数，理工语境加 arXiv（https，读 totalResults）。Google 精确短语 + `site:edu` / `site:edu.cn` 做语域量级对比（**浏览器专用**，curl 是 JS 壳；结果数为估算只做同参数对比；`*` 通配不响应，通配用 Linggle `_`）。**OpenAlex 短语匹配只对实词组合可靠**，含介词/冠词/be 动词的组合静默退化为词袋（两候选计数完全相同即退化信号，禁用该组数字）。PubMed 是三态引擎——引号短语可能词典命中（可信）、静默变词袋（count 虚高，如 the data are 的 763 万实为单词 data 命中）、或词典外兜底（返回 2/0 等垃圾小值），**每次必须读 esearchresult.querytranslation**：保留引号短语且量级合理才可用，出现布尔扩展即弃。功能词组合的完整链路：OpenAlex 同值检测（触发即弃）→ PubMed（验 querytranslation）→ Ngram 真短语（图书语料）兜底。学术源数字表述为「X 篇文献出现」，与通用语料的「N 次」分开；学科证据与通用证据冲突时，学术写作语境以学科源优先。**学科自动推断**：用户未明示学科时按查询文本启发式选链路——含疾病/治疗/临床/患者类词走生医（PubMed 优先 + OpenAlex concepts 过滤 medicine），含 model/algorithm/dataset/network/training 类词可加 arXiv 交叉，其余默认 OpenAlex 总库；需要学科精度而无法推断时问一句，不瞎猜。**修辞功能类问题走 Academic Phrasebank**（浏览器，phrasebank.manchester.ac.uk）：用户问「引言怎么开头」「怎么谨慎表达」「结论怎么写」这类部位/功能问题，打开对应板块（Introducing work / Being cautious / Writing conclusions 等）取候选句式给用户挑选，候选短语再回频次源验证真实使用量——Phrasebank 出候选、语料库定频次，两者分工
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

**速览与深查两档（默认速览 + 自动升级）**：
- 速览版（默认）：结论 + 1-2 条最强证据（行内链接）+ 替代写法，150 字内。适用：单个搭配对错、词义存在性等明确问题
- 深查版（五段全开）：自动升级的触发条件——H 类语义韵、C 类语域、F 类辨析、D 类历时趋势（需理据锚点与趋势叙事）、批改模式、用户问"为什么/怎么选"、速览证据互相矛盾；用户对速览追问时也升级。**被动触发**：速览答案撞上语义韵敏感词表时附语义韵提示段；建议词语域与用户语境不匹配时升级并给三档光谱

**表达纪律（用户可见的每一句都遵守，认知负荷控制，Söğüt, 2024; Lusta et al., 2025）**：
- 说人话，不说机器话。CSS 选择器、URL 参数、命令行、JSON 字段、内部机制名（如"证据分级 A→C"）绝不出现在 response 里——查证是机器的事，看懂是人的事
- 频率数据翻译成可感知的说法（"heavy rain 大约是 strong rain 的一百倍"），不要科学计数法、不要原始坐标值
- 查询式对用户有学习价值时可展示，但必须配一句自然语言说明做了什么（"查了 an interview 前面最常见的动词"）
- 教学术语首次出现用一句人话解释，如语义韵是"一个词长期跟什么样的词搭配，慢慢染上的感情色彩"
- 每段先一句要点再给细节，表格不超过 5 行，批改报告的每条写成自然句或短列表（结构指示里的箭头链只是给 AI 的组织逻辑，不照抄渲染）；确认模式（全绿）下表格能不用就不用——错误报告用表格是收纳，确认报告用表格是摆姿态
- 每个元素自问"这对用户写下一篇或翻下一句有什么用"，答不上来的删掉——服务搭配教学与写作翻译实践是唯一目的
- **会话级去重**：同一会话内，"8 次接触"提示、理据框架的机制说明、仿写方法说明只在首次出现时给，之后省略或一笔带过；"下次自查"按本次错误类型轮换工具（搭配→Linggle、语域→朗文、译法→Linguee、词义→牛津/剑桥），不重复同一条
- **链接一律行内**（来源名做锚文本，任何位置不裸露长 URL）；**证据表「出处」列必须写成 Markdown 超链接**，锚文本用来源名，用户点开直达当次查证页面

```
## 结论
✅ 可用 / ⚠️ 有条件可用（注明语域/地区/年代条件）/ ❌ 不建议 → 给替代，一句话

## 原话证据（逐字引用查证页面，标注来源）
| 原话 / 数据 | 出处 |
|---|---|
| "[uncountable, singular] water that falls from the sky in separate drops" | [OALD rain 名词义项 1](https://www.oxfordlearnersdictionaries.com/definition/english/rain_1) |
| "We had heavy rain all day." | [Cambridge rain 例句](https://dictionary.cambridge.org/dictionary/english/rain) |
| heavy rain 760,000 次（89.9%）| [Linggle 查询结果](https://search.linggle.com/?q=heavy+rain) |
| "所有接受采访者做出了匿名的承诺" ↔ "All respondents have been promised anonymity" | [Linguee 平行句（daccess-ods.un.org）](https://www.linguee.com/english-chinese/search?query=promised+anonymity) |

文本类证据用引号逐字引用，不改写、不缩写、不"翻译成自己的话"；频率类原样给数字与百分比；双语平行句两侧都引。**每条证据附可溯源的真实链接**（Markdown 格式，来源名做锚文本——表格出处列同样如此），用户点开出处即可核对——把"信任本 skill"变成"可验证"（批判性使用证据，Liu et al., 2024）。链接纪律：按 references/sources.md 的 URL 模板构造或用实际访问地址，**禁止编造 URL**；Ngram 附可视化页面（如 books.google.com/ngrams/graph?content=heavy+rain,strong+rain&year_start=1900&year_end=2019&corpus=en-2019），不是数据接口；牛津附最终词条页（如 oxfordlearnersdictionaries.com/definition/english/rain_1），不是搜索过程页；Linggle 附查询式 URL（如 search.linggle.com/?q=commit+a+_），用户点开即见完整分布。**精选 3-5 条最强证据，按 A→C 分级排序，A 级优先**——DDL 研究证实海量语料罗列会引发读者过载与误读（Söğüt, 2024; Farooqui, 2025），宁精勿滥。查不到原话的源如实标注"该源未返回可用原文"。

**来源锚链接速查表**（出处列照此构造，花括号为占位符，查询词需 URL 编码）：

| 来源 | 锚链接模板 |
|---|---|
| OALD | `https://www.oxfordlearnersdictionaries.com/definition/english/{词条}`（词条带序号如 rain_1，用实际访问到的地址） |
| Cambridge | `https://dictionary.cambridge.org/dictionary/english/{词条}` |
| LDOCE | `https://www.ldoceonline.com/dictionary/{词条}` |
| Linguee | `https://www.linguee.com/english-chinese/search?query={URL编码查询词}` |
| Linggle | `https://search.linggle.com/?q={URL编码查询式}` |
| Ngram | `https://books.google.com/ngrams/graph?content={短语A,短语B}&year_start=1900&year_end=2019&corpus=en-2019&smoothing=3`（与实际查询参数一致） |
| Urban Dictionary | `https://www.urbandictionary.com/define.php?term={词条}` |
| Etymonline | `https://www.etymonline.com/word/{词条}` |
| TheFreeDictionary | `https://www.thefreedictionary.com/{词条}` |
| Thesaurus.com | `https://www.thesaurus.com/browse/{词条}` |
| OpenAlex | `https://openalex.org/works?search={URL编码 "短语"}` |
| PubMed | `https://pubmed.ncbi.nlm.nih.gov/?term={URL编码 "短语"[Abstract]}` |
| arXiv | `https://arxiv.org/search/?query={URL编码 "短语"}&searchtype=all` |
| Google 检索式 | 当次 google.com/search?q=... 完整 URL |

**渲染兜底**：若用户反馈其环境表格内链接不可点击（个别聊天 UI 的表格渲染缺陷），该环境降级为「表内编号 + 表后来源清单」——出处列写 ①②③，表格正下方紧跟清单 `① [OALD rain](URL)`，保证任何环境下来源都可回溯；默认环境仍用表内链接。

## 语境建议（每条必须指明依据上面哪条原话）
针对用户当前的句子/语境：
- 怎么写，如"改用 heavy rain，依据 OALD 例句原话 …"。对 C1+ 用户，除稳妥选项外附一个更老练的进阶选项（低频但词典明确收录的强搭配，标注难度）——评分员更看重搭配老练度而非绝对无误（Naismith & Juffs, 2025）
- 怎么翻译，挂平行句原话，说明视角差异（如受访者视角用 be interviewed，强调"同意接受"用 grant）
- 语域/地区/年代条件（如有）：有语域标注时必须引用原话（如 mitigate 词条音标后的 "(formal)"）；同义替换时给出级别标注（如牛津 "From the topic POLITICS C1"），帮用户判断这个词对自己的难度
- **语域光谱三档**（F 类及同义替换场景必给）：同一意思给 formal / neutral / informal 三个版本并标注依据，如 very important → crucial（formal）/ important（neutral）/ a big deal（informal）——学习者常见困境是只会一个版本到处用，三档光谱防语域错位
- **理据锚点**（D 类及涉及搭配成因时必给）：从 Etymonline 拉一行词源理据让搭配可推导，如 strong 本义"绷紧"（与 string 同源）故管"力"（strong wind/strong opinion），heavy 是"重量"故管"量大"（heavy rain/heavy traffic）——讲得通的搭配从任意记忆变成可推导规则，深加工决定留存

## 可模仿例句（正例输入，2-3 条词典原话）
从查到的词典例句中挑 2-3 条最贴近用户语境的，逐字引用，并提炼可直接仿写的框架。**生词防护**：优先选不含超纲生词的例句；若最佳例句含 CEFR 高阶词，括注中文释义（38.5% 的学习者曾因语料生词受挫，Lusta et al., 2025）：
- "We had heavy rain all day."（Cambridge）→ 框架 have + heavy + 名词
- "The government is trying to mitigate the effects of the crisis."（OALD）→ mitigate the effects of …

纠正只解决这一次，仿写框架可复用。模仿是地道表达的习得路径，这一段不可省略。学习者的接受性识别先于产出性使用发展，且两者是独立构念（McGee, 2012; Dushku & Paek, 2021; Lee, 2024）——看得出的比例远高于写得出（接受性 68.7% vs 产出性 48.2%，Rachawong, 2026），仿写正是打通"看得出→写得出"的桥。建议用户当场用框架改写自己的原句，**仿写要同框架换内容**（程序性重复的词汇复杂度与准确度优于照抄式重复，Kim & Li, 2024），并在未来阅读中**间隔地**主动留意该搭配——约 8 次接触可达母语者级加工速度（Pellicer-Sánchez et al., 2022），分散接触优于集中（间隔效应 d≈0.60-0.80，Kim & Webb, 2022），等距间隔即可、无须逐步拉长（Sonbul et al., 2024），Anki 类工具可精确管理；不复习两周即衰减（Cheng et al., 2025）。边界提示（首次出现时说一次）：间隔查证建立的是显性知识，自动化产出仍需真实写作使用（Nakata & Elgort, 2020）。

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

## 批量模式（用户一次提出多个疑问时进入）

先输出一张速览表（疑问 → 结论 → 一句话依据 + 来源名），再问用户需要深查哪一个；被选中的按深查版展开，其余不再展开。禁止对每个疑问逐一五段全开——批量场景下的总篇幅就是新的过载源。

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
   - 学术专项一，结论动词与证据强度错配（hedging 校准）——prove/demonstrate 用于确定性证据，suggest/indicate 配非确定性结论；实测 the results indicate 647 万篇、suggest 483 万篇，prove 仅 27 万篇（差 18-24 倍），把相关性证据写成 the results prove 是 L2 学术写作高频问题，改法先看证据类型再选动词
   - 学术专项二，引用动词态度错位——argues 是中性主流（Smith argues 10,553 篇，是 claims 2,551 篇的 4 倍），claim 对他人观点自带距离感或质疑色彩（写 Smith claims 等于暗示你不太信他），contend/assert 书面但低频（约 1,100-1,400 篇），states 是纯报告不带立场；引自己支持的观点用 argues/suggests，需要保持距离再用 claims
   - 学术专项三，第一人称误纠——we 不是错误（we demonstrate that 250 万篇、we argue that 89 万篇都是主流），人文社科 I argue that 也有 48 万篇；不要把 we 改成 this paper 机械去人称，演示发现类用 demonstrate/show，论证主张类用 argue；真正的错误是口语化的 I think/I believe 进学术文
   - 归因词块定位堆叠（according to…、as shown in… 等连续出现在段首句开头——专家惯例是嵌入句中非初始位置，如 X leads to Y, according to Z，Wang & Zhang, 2021）
   - 同框架过度重复（同一词块或句式框架在文中反复出现，如 it is important to note that 连用多次——L2 写作者词块总量常超母语者但结构窄、重复高，靠套话堆学术腔，Li & Lei, 2025；提示变换或压缩为短语结构）
   - 不标：复杂句法、风格偏好、无查证依据的"感觉"；用户明示的修辞性语义韵冲突（故意制造搭配不协调以达成讽刺或幽默效果，Jensen, 2024）不算错误
3. **逐点查证**走标准流程（第一至四步）。**译文批改时目标语单语证据优先**：不只对照原文，优先用 Ngram/Linggle/词典等目标语单语源验证译文的自然度，防止源语结构干扰产生 calque（职业译者修订阶段的规范做法，Fantinuoli, 2016; Jensen et al., 2012），但批改模式下每点证据表精简到 1-2 条最强证据，可模仿例句只给全文最关键的 1-2 处，防止整篇报告过载
4. **选择反馈模式**（WCF 文献驱动）：
   - **聚焦模式（默认）**：前置扫描（全面诊断）后，主体只深纠 **1-2 类错误**——优先选学生本次最高频的类型；搭配/介词/语义韵类是聚焦反馈的优势区（Kao et al., 2025），与本 skill 领域重合，同名类型默认入选。聚焦类每条给完整证据链；其余类型只进末尾分布表 + 每类一行最短改法。依据：聚焦反馈对目标结构的增益更大更持久（Sheen et al., 2009），认知负荷是机制（Lee, 2019; Deng et al., 2022）；用户学生水平未知时聚焦是更安全的默认（低水平学习者处理不了全面纠正，Nguyen & Chu, 2024）
   - **全面模式**：用户明示「全部详纠」或全段错误总数 ≤ 4 条时切换（错误少时聚焦无意义）；此模式沿用按严重度详列，超过 8 条时详列前 8、其余进分布表
   - **确认模式**：四链巡逻 + 查证后零错误标记（或仅剩风格级可选项）时切换。**输出是人话点评，不是盖章报告**——查证过程的存在感降到最低，用户要的是「这文章行不行」的判断和几个有据的观察，不是查证流水账。结构极简：①一两句总评，像懂行的朋友读完说的话；②挑 2-3 个真实查证过的亮点自然地说（不罗列全部验证点，精选纪律同样适用）；③可选项用商量的语气提（「有一处可以商量」而非「优化点 1」）；④下次自查照常，一句。**确认模式禁令**：不用 ✅❌⚠️ 等符号（没有错误就没有标记）；不暴露巡逻链/语步/四链等内部概念（那是 AI 的组织逻辑）；不写「已验证 N 处表达」式的机器账单；不加粗轰炸（好文本的确认不需要视觉强调）；不趁机说教（「查证的价值在于……」这类话删掉）。全绿是合法结论，坦率说「这篇没什么好改的」比硬找问题更可信——假阳性控制的最终形态是敢于出全绿报告
   - **错误类型 × 反馈方式路由**（Satake, 2024, 2020）——词汇/搭配/词形类错误：带工具自查邀请优先（语料自查对此类解决率高：词形 93.6%、搭配 62.7%，Yang & Ren, 2025；skill 替学生执行索引行解读，认知负荷由 AI 承担，规避裸 DDL 的超载弃用风险，Crosthwaite, 2017; Cheng, 2021）；语法/结构/省略类错误：**不发自查邀请**，直接给一句提示 + 指路语法检查工具（语料查询对此类无效——难点是找缺失形式而非探索词汇，学生自查会误读索引行或弃用，Satake, 2024; Crosthwaite, 2017；与本 skill「语法非强项」边界互证）
5. **输出批改报告**，按原文顺序：
   - 原句片段 → 结论（✅/⚠️/❌）→ 一句话原话依据 + 来源 → 修改建议
   - **聚焦模式下每个词汇类实例附「带工具的自查修订」邀请**（辅助型间接反馈，勿降级为空手改；语法结构类实例不适用，见上方路由）：给原句 + 错误类型 + **一条具体查询路径**（如「用 Linggle 查 `v. + research` 看动词分布，search.linggle.com」「查牛津 research 词条的词性标注」），学生带着工具改，改完回复编号对答案。依据：标记 + 语料查询的辅助间接反馈在短期与延迟测试中均反超直接反馈（Li, 2023，16 周 DDL 整合实验，且优于传统词典；Reynolds & Teng, 2021; Wang & Jiang, 2015）；修订放大习得（Rahimi, 2019；被产出逼出来的缺口感知驱动后续定向查证——pushed output 的 noticing 功能，Izumi, 2002; He et al., 2026）。批改报告的可模仿例句即 CAT 对照模型：学生原句 vs 词典原话的对比在主动/被动回忆上超过意义聚焦教学（Laufer & Girsai, 2008）。**强制兜底行**：每个邀请同段固定一句「不想自查，直接回复编号看证据和答案」——搭配是非规则组合，无辅助间接对低水平学习者失败（Fhaeizdhyall & Jerome, 2020；低水平组延迟后测不保），自助永远可选、永不强迫；对答案环节给完整证据链 + 目标形式（直接反馈对搭配的即时与保持优势，Fhaeizdhyall, 2020; Reynolds & Teng, 2021）
6. **末尾汇总**：本次错误类型分布 + 下次自查一行 + 固定一行「想深究哪一条，回复编号」——对话式交付优于被动标记（Sarré et al., 2019）

**学术文本批改的增强版式**（用户贴的是论文摘要/引言/文献综述/结论，或明示学术语境时启用；jev 评估 teacher 场景就绪度 0.34 的针对性补强，目标是产出教师可直接转发学生的成品）：
- **批改前置扫描**：先通读全段做四条学术链的专项巡逻——①结论动词链（每个结果句的动词强度 vs 证据类型：prove/demonstrate 只配确定性证据，suggest/indicate 配相关性证据，错配逐条标记）；②引用动词链（文献综述里每个 X argues/claims/states 的态度是否与上下文立场一致，claim 用于中立转述时标记为高风险）；③结论链（future work/research 表达与全文学科惯例的一致性）；④引言/摘要语步链（文本是引言或摘要时激活）——引言走 Swales CARS 三语步：Move 1 确立领域 → Move 2 指出缺口 → Move 3 宣告本研究，学生引言最典型的病是 **Move 2 缺失**（没有缺口论证直接宣告本文做了什么，重点标记）；判定按功能不按形式，标志短语如 However little research has / remains unclear / to fill this gap / This study aims to 可作形式线索并学科内查频（Lu et al., 2020），句首词束（sentence-initial bundles）是可靠的语步转换信号（Li et al., 2020; Khany & Malmir, 2020）。摘要按**学科期望表**（Hyland 五语步框架，工程 vs 社科，Razali & Samad, 2022）：目的语步两边必备；工程摘要方法语步必选且应占主导篇幅（占 79-81% 词数的实证，Zubir et al., 2021），背景可压缩、结论可省略；社科摘要背景/问题化是必要语境空间、结论承担评价功能，方法可变。**五语步完整性不是标准**——500 篇科学摘要仅 2.4% 用满五语步，社科常态是三语步（Ngai et al., 2018），禁止拿五语步模板卡学生。**被拒指纹**：方法与结果句未完成时态语态转换（过度主动+现在时）是被拒工程摘要的系统性失败模式（Kurniawan & Lubis, 2022），工程语境方法/结果句应转过去时+被动，此指纹与通用时态错误不同级——按学科惯例问题标记，不只按语法提示。巡逻结果并入标记清单一起查证，不单独成段
- **报告主体保持通用格式**（原句→结论→证据→建议），但学术文本时每条证据链接优先指向学科源（OpenAlex/PubMed），通用语料证据降为第二位
- **末尾汇总升级为教师版三件**：①错误类型分布表（全面诊断结果，按学术三项专项 + 通用搭配/语域/语义韵分组计数，学生最常错的排最前）；②本次最值得讲的一个点（与聚焦类的选择一致，配一条最强证据，教师可直接当课堂例句用；连续多次批改时提醒一句：写作进步呈 W 型非线性轨迹，单次表现波动不等于退步，Hiver et al., 2024）；③给学生的下一次自查清单（按本次错误类型轮换 2-3 条可操作动作，如「交稿前把所有 results 后面的动词圈出来，逐个问证据是相关还是因果」），每条动作对应本次报告里的实例编号。教学建议：多篇作业连续批改时，本次聚焦类优先选学生上一篇的高频错误类型（聚焦干预针对持续性错误，Kao et al., 2025）；课堂场景可先让学生两两互标疑点再自查修订，同伴互标先于语料查询可提升错误识别率（Kim & Emeliyanova, 2019）
- **篇幅纪律不变**：批改模式每点 1-2 条最强证据的限量规则继续生效；反馈模式规则见第 4 步——聚焦模式主体只深纠 1-2 类（全面模式的 8 条护栏仅在其激活时适用），防止报告本身成为新的阅读负担（认知负荷控制，Lusta et al., 2025; Lee, 2019）

## 边界

- Urban Dictionary 是社区内容：只用于识别俚语义和流行度，不作为标准用法依据
- Ngram 是书籍语料：口语、2019 后新词覆盖弱，新词/网络语用 Urban Dictionary + Linguee 补充
- **本 skill 强项是用词**——搭配、语域、语义韵、译法。语法准确性不是它的强项（DDL 研究显示语料查询对语法准确性的提升不显著，Kızıl, 2023），用户问语法问题时建议其使用语法检查工具，不要用词典证据硬答语法判断
- **通用语料的学科局限**：Ngram 总库、Linggle 等通用语料未必反映具体学术领域的惯例、语气与模糊限制语（hedging）用法（Flowerdew & Petrić, 2024）——学科写作查证**优先走 I 类学术源**（OpenAlex 学科过滤 / PubMed / arXiv），通用语料结果与学科源冲突时以学科源为准并分别报告；Linguee 权威来源例句作学科语感的辅助
- **语步判定是功能判断不是形式判断**（J 类）：AI 判定 CARS 语步有主观性，结论需附「按功能语义判定」的说明；**非线性循环是专家常态**——在文献综述与缺口论证之间来回是合法修辞（Shah, 2025; Msuya, 2020），批改时不得把学生引言硬套线性模板；step 级学科惯例以标志短语的学科内频率为证据（硬科学显式 RQ/假设/被动语态更多，软科学话题概括+穿插综述，Setiawati et al., 2021; Lu et al., 2021），不凭感觉判「不地道」——通用结构模板忽视领域特异惯例正是现有教学材料的已知缺陷（Lu et al., 2021），本 skill 的差异化就在学科条件化
- 所有源都查不到时明确说"未能查证"，给保守建议（改用更常见表达），不要硬下结论
