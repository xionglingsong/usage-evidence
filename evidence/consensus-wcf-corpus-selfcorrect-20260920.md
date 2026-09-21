# 方向一第三批检索：corpus self-correction vs teacher correction（2026-09-20，用户提供 Consensus 综述）

## 采纳进 v1.9.2 的结论

1. 错误类型匹配律（Satake, 2024, 2020）：语料自查擅长词汇/词形/搭配（精确字符串匹配类）；教师直接纠正擅长省略/一致/形态句法（难点是找缺失形式）→ 错误类型 × 反馈方式路由
2. 语料自查解决率（Yang & Ren, 2025）：词形 93.6%、搭配 62.7% → 词汇类自查邀请优先的量化依据
3. 间接编码 + 语料访问 = 最优自主性；过直接纠正消灭查证动机（Tono et al., 2014; Crosthwaite et al., 2020）→ v1.9.1 设计确认（Teacher-Coded DDL 的 AI 版）
4. 裸 DDL 认知超载：新手误读索引行或弃用改搜索引擎（Yang & Ren, 2025; Cheng, 2021; Qiu, 2024）→ skill 的差异化：AI 吃掉 concordance 解读负荷，学生拿查询路径+解读好的分布
5. 同伴互标先于语料查询提升识别率（Kim & Emeliyanova, 2019）→ 教师版课堂建议
6. 混合教学最优：结构直接纠、词汇间接引到语料（Satake, 2024; Crosthwaite, 2017）→ 与 v1.9.1 的「对答案直接 + 自查间接」双通道一致

## 未采纳（暂）

- peer feedback 作为独立反馈源的系统设计（Demir, 2021; Kim & Emeliyanova, 2019）：skill 单机场景无同伴角色，仅作课堂建议
- concordance 解读训练课程（Cheng, 2021）：超出 skill 范围，属于教学法

检索问题：learner self-correction versus teacher correction corpus data-driven learning
