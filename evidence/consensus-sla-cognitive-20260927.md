# SLA 与认知科学方向检索（2026-09-27，Consensus API；用户指正后替代 v1.17 的 NLP 工程视角）

API：https://api.consensus.app/v1/search（X-API-Key 会话内使用未落盘），五组查询。

## 采纳进 v1.18.0 的映射（作者名全部取自 API authors 字段，已核实）

- 词块心理现实性（10.1016/j.system.2018.11.009，Jeong & Chen, 2018）→ 词块单位意识
- 母语者整块 vs 学习者逐词（10.3758/s13421-025-01843-5，Milburn et al., 2025）→ 词块单位意识
- Pushing receptive→productive（10.1177/13621688221077028，Teng & Xu, 2022）→ 仿写=产出性任务
- Involvement Load（10.1177/13621688211008798，Teng & Zhang, 2021）→ 自查邀请认知正名
- Within-session retrieval（10.1017/s0272263116000280，Nakata, 2016）→ 会话内二次提取
- Cumulative testing（10.1002/tesq.3391，Maie et al., 2025）→ 多词条混测

## 其他高价值命中（未直接采纳，背景参考）

- DDL 认知过程六案例（10.1515/cjal-2023-0404）：个案深度，不写操作规则
- productive processing of formulaic sequences in writing（10.3389/fpsyg.2024.1281926，Fan & Wang, 2024）
- Cumulative tests 学期分布式提取（10.1002/tesq.596，Nakata et al., 2020）
- Working memory × multimedia input（10.1515/iral-2021-0130）

## 过程教训

初版 patch 的文献作者名为模型推断（Consensus 首轮检索未打印 authors 字段），经自查违反「禁止编造」纪律后，补查 API authors 字段全部纠正——引用作者必须来自检索结果，禁止推断。
