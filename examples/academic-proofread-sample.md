# 学术批改样例（v1.7.0 教师版输出格式）

> 这是一份完整的批改输出样例，输入是一段带典型错误的模拟学生摘要。所有数据来自真实查证（OpenAlex / Ngram / PubMed / OALD，2026-09-20 实测），证据链接可点击回溯。

## 输入（学生摘要）

In recent years, with the rapid development of online education, more and more researchers have begun to do research on its effectiveness. As far as we know, few studies have examined its long-term effects. This research collects 200 questionnaires from three universities. The data is analyzed using SPSS. Smith (2023) claims that online learning is as effective as traditional classroom teaching, but his sample size was small. This research proves that students' satisfaction plays an important role on learning outcomes. In the future, we will do more researches on this topic. We make a conclusion that universities should invest more in online platforms.

## 逐条批改（按严重度排序，详列前 8 条）

1. **plays an important role on** → ❌ 介词错误，应为 **in**
   Ngram 图书语料为基准，play a role in 是 on 的约 250 倍（100% vs 0.4%）｜[Ngram 可视化](https://books.google.com/ngrams/graph?content=play+a+role+in,play+a+role+on&year_start=1900&year_end=2019&corpus=en-2019&smoothing=3)
   改法：plays an important role **in** learning outcomes

2. **This research proves that** → ❌ 结论动词强度错配（问卷+SPSS 是相关性证据，配不动 prove）
   this research suggests 812,013 篇 vs this research proves 53,318 篇（15 倍差距，学术惯例明确）｜[OpenAlex 检索](https://openalex.org/works?search=%22this%20research%20suggests%22)
   改法：This research **suggests** that（如证据较强可用 indicates）

3. **The data is analyzed** → ❌ 单复数惯例，学术写作中 data 是复数
   PubMed 摘要中 the data is 仅 2 篇（词典外兜底值，但方向与词典一致）；牛津词典 data 词条标注源于拉丁复数｜[OALD data 词条](https://www.oxfordlearnersdictionaries.com/definition/english/data)
   改法：The data **are** analyzed

4. **Smith (2023) claims that** → ⚠️ 引用动词态度错位（claim 自带距离感，暗示你不信他；下文确实在质疑他的样本量，如果想保留质疑色彩可以不改）
   Smith argues 10,553 篇 vs Smith claims 2,551 篇（argues 是中性转述的主流选择）｜[OpenAlex 检索](https://openalex.org/works?search=%22Smith%20argues%22)
   改法：中立转述用 **argues that**；保留批评立场则维持 claims 并在下一句明确指出问题

5. **make a conclusion** → ❌ 中式搭配
   draw a conclusion 398,751 篇 vs make a conclusion 81,917 篇（5 倍差距）｜[OpenAlex 检索](https://openalex.org/works?search=%22draw%20a%20conclusion%22)
   改法：We **draw the conclusion** that（或直接 We conclude that）

6. **do research / do more researches** → ❌ 虚化动词错配 + 不可数名词复数化（双重错误）
   conduct research 715,110 篇 vs do research 208,357 篇（3.4 倍）；牛津词典 research 词条标注 [uncountable]，researches 不是「多项研究」的意思｜[OpenAlex 检索](https://openalex.org/works?search=%22conduct%20research%22) · [OALD research 词条](https://www.oxfordlearnersdictionaries.com/definition/english/research)
   改法：**conduct research** on / In the future, we will **conduct further research** on

7. **As far as we know** → ⚠️ 语域错位（口语体进学术文）
   to the best of our knowledge 1,242,147 篇 vs as far as we know 163,512 篇（7.6 倍）；PubMed 摘要词典命中 57,259 篇验证｜[OpenAlex 检索](https://openalex.org/works?search=%22to%20the%20best%20of%20our%20knowledge%22)
   改法：**To the best of our knowledge**, few studies...

8. **collects 200 questionnaires**（时态）→ ⚠️ 方法描述用过去时（研究已完成）
   改法：This research **collected** 200 questionnaires（此条属语法规范，超出词典查证范围，建议用语法检查工具复核全文时态）

## 末尾三件套

### ① 错误类型分布

| 类型 | 条数 | 实例 |
|---|---|---|
| 介词/功能词错配 | 1 | #1 |
| 结论动词强度（学术专项一） | 1 | #2 |
| 名词单复数 | 1 | #3 |
| 引用动词态度（学术专项二） | 1 | #4 |
| 动宾搭配 | 2 | #5 #6 |
| 语域错位 | 2 | #7 #9* |
| 语法（时态） | 1 | #8 |

\* #9 = with the rapid development of 开场白（「随着XX的发展」直译），学术惯例直接进入主题，候选开场句式见 [Academic Phrasebank · Introducing work](https://www.phrasebank.manchester.ac.uk/)——按篇幅护栏并入分布表，不单列详批

### ② 本次最值得讲的一个点

结论动词的强度阶梯。把学生所有「结果句」的动词圈出来排一排：prove（确定性）→ demonstrate（实证较强）→ indicate/suggest（相关性）。这篇摘要把 prove 用在了问卷研究上，是 L2 学术写作最典型的强度错配——单一动词的选择就暴露了作者对「证据能支撑什么结论」的把握。课堂例句就用 #2 的 15 倍数据对比。

### ③ 学生自查清单（下次交稿前）

- 把摘要里所有 results/proves/suggests 的句子找出来，逐个问：我的证据是因果还是相关？（对应实例 #2）
- 查一下自己写的每个「research」，前面动词是 do 还是 conduct，有没有加 s（对应 #5 #6）
- 开头第一句删掉「In recent years, with the development of...」直接说研究对象（对应 #9）

---

批改数据源：OpenAlex（2.5 亿文献）、Google Books Ngram、PubMed、Oxford Learner's Dictionaries，查询于 2026-09-20。功能词组合（play a role in/on）经 OpenAlex 同值检测触发降级，由 Ngram 真短语定谳。
