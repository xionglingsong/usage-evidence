# Usage Evidence

**An evidence-based English usage verification skill for AI agents.** Instead of answering "is this phrase idiomatic?" from model intuition, the agent is forced to query real dictionaries and corpora first, then cite what it found.

写给英语学习者、译者和写作者的一个 AI Agent Skill：问"这个搭配能不能这样写"，AI 不再凭感觉回答，而是先查牛津、剑桥、朗文、Linguee、Google Books Ngram，拿真实证据再下结论。

---

## 为什么需要它

问 AI"strong rain 能写吗"，一般的回答是模型凭训练记忆给判断，听起来自信，但语感对学习者来说是黑箱，而且模型对低频搭配经常"幻觉式放行"。

这个 Skill 把回答流程改成了硬约束：

1. **每个结论必须有出处**——词典收录、词典例句、语料频率、平行例句，查到什么引用什么，禁止虚构
2. **查不到 ≠ 不存在**——判"不能用"需要两路反证（词典未收录 + 语料频率≈0）
3. **事实与推断分开**——频率数字是事实，"更地道"是推断，必须写明依据
4. **网络失败如实报告**，不降级为凭感觉回答

## 实测案例

**"under the background of" 能用吗？**（"在……的背景下"的直译，Chinglish 高发区）

Ngram 三短语对比（1900-2019，Google Books 英语语料）：

| 短语 | 相对频率 |
|---|---|
| in the context of | 基准（最高频） |
| against the background of | 主流的 3.4% |
| under the background of | **0.0004%，接近零** |

结论：标准搭配是后两者，under the background of 是中式直译。数据里还藏了一个细节：它近三十年上升了近 39 倍，但基数极小——恰好说明这是中国作者正在"带进"英语而非英语固有的用法。

**"接受采访"怎么翻？** accept an interview？

Linggle 语料库 `v. an interview` 动词搭配排行前 51 名里没有 accept：arrange / schedule / conduct（安排方）、give / grant（受访者方——英语里采访是"给出"的）、attend / get（参加方）。联合国文件平行语料里"接受采访"全部译作 be interviewed。

**damages 是 damage 的复数吗？**

剑桥词典将 damages 立为独立词条，语法标注 [plural]，释义"支付给受害者的钱"——法律意义上的"赔偿金"，不是"多种损害"。

## 工作流

用户提问 → 按类型分流 → 选 2-4 个源查证 → 按证据分级 → 输出"结论 + 证据表 + 替代建议"。

| 问题类型 | 典型问题 | 首选源 |
|---|---|---|
| 搭配查证 | "strong rain 能写吗" | Ngram / Linggle → 词典例句 → Linguee |
| 词义存在性 | "X 有这个义项吗" | Oxford → Cambridge → FreeDictionary |
| 语域正式度 | "这是俚语/过时/正式吗" | 词典语域标注 → Ngram 趋势 → Urban Dictionary |
| 历时趋势 | "这用法过时了吗" | Ngram → Etymonline |
| 译法查证 | "压力大 = big pressure?" | Linguee 平行句 → Ngram → 词典 |
| 同义辨析 | "A 和 B 用哪个" | Thesaurus.com → 双词典对比 |
| 搭配发现 | "这里该用哪个介词" | Linggle 填空 → 词典例句 |

证据分级：A 词典明确收录 > B 语料高频（Ngram / Linggle 百分比）> C 权威平行例句（Linguee 中联合国等来源）> D 反证。

## 支持的查证源（13 个，2026-09 实测）

| 源 | 访问方式 | 状态 |
|---|---|---|
| Oxford Learner's Dictionaries | 浏览器 | ✅ 挡 curl TLS 指纹，浏览器正常 |
| Cambridge Dictionary | curl 直连 | ✅ 释义/例句/英美标注可程序化提取 |
| Longman LDOCE | curl 直连 | ✅ 例句量最大 |
| Etymonline | curl 直连 | ✅ 词源与首用年代 |
| Linguee | curl 直连 | ✅ 中英平行句带权威来源 |
| Google Books Ngram | curl + 代理 | ✅ JSON API，配 ngram.mjs 自动统计 |
| Linggle | 浏览器 | ✅ 搭配发现：`_` `*` `?` 词性标签语法 |
| Urban Dictionary | curl + 代理 | ✅ 俚语识别（社区内容，不作标准用法证据） |
| TheFreeDictionary | curl + 代理 | ✅ 整合 AHD / Webster's / Collins 部分 |
| Thesaurus.com | curl + 代理 | ✅ 按义项分组的同反义词 |
| Collins | — | ❌ Cloudflare 挡自动化（降级 FreeDictionary） |
| Merriam-Webster | — | ❌ 同上（降级 FreeDictionary + Cambridge 美式） |
| Ludwig | — | ❌ 同上（功能由 Linggle + Linguee 覆盖） |

每个源的 URL 模板、HTML 提取选择器、反爬状态、降级链都写在 `references/sources.md`，全部经过实测验证。

## 安装

适用于任何支持 SKILL.md 格式的 Agent（Ekko、Claude Code 等）。

**Ekko：**

```bash
# 将仓库放入 skills 目录的 writing/ 分类下
git clone https://github.com/xionglingsong/usage-evidence.git \
  ~/.hermes-web-ui/.ekko/skills/default/writing/usage-evidence
```

**Claude Code：**

```bash
git clone https://github.com/xionglingsong/usage-evidence.git \
  ~/.claude/skills/usage-evidence
```

依赖：`curl`、`node`（ngram.mjs 用）、可用的浏览器自动化工具（查 Oxford 和 Linggle 需要）。中国大陆网络环境：4 个源需要代理，其余可直连，见 sources.md。

## 局限

- Ngram 是书籍语料（截至 2019），口语和最新网络用语覆盖弱，新词用 Urban Dictionary + Linguee 补
- Collins / Merriam-Webster / Ludwig 被 Cloudflare 挡住自动化访问，本 Skill 用等价源降级覆盖
- 源网站的页面结构或反爬策略变化后，sources.md 里的选择器需要更新

## License

MIT。各词典与语料网站内容版权归各自所有，本 Skill 只是查询流程编排，引用时请注明原始来源。
