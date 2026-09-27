# 方向五检索：agent 查证编排元策略（2026-09-27，Consensus API 真实文献）

API：https://api.consensus.app/v1/search（X-API-Key，会话内使用未落盘），四组查询：

## 检索结果（top 命中）

### 检索策略规划
1. Enhancing Retrieval-Augmented LLMs with Iterative Retrieval-Generation Synergy（arXiv 2305.15294）
2. Hallucination to truth: a review of fact-checking and factuality evaluation in LLMs（Artif Intell Rev, 2025）
3. Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection（arXiv 2310.11511）
4. Hybrid Fact-Checking: Knowledge Graphs + LLMs + Search-Based Retrieval（WinLP 2025）

### 多源证据聚合
1. Multi-Sourced, Multi-Agent Evidence Retrieval for Fact-Checking（ACM 2025）
2. MultiFC: Real-World Multi-Domain Dataset for Evidence-Based Fact Checking（EMNLP 2019）
3. Multi-agent systems and credibility-based advanced scoring mechanism in fact-checking（Sci Rep 2026）
4. Towards Robust Fact-Checking: Multi-Agent System with Advanced Evidence Retrieval（arXiv 2506.17878）

### 引用接地防幻觉
1. Citation-Enhanced Generation for LLM-based Chatbots（ACL 2024 long）
2. Enabling LLMs to Generate Text with Citations（arXiv 2305.14627）
3. Progressive Training for Explainable Citation-Grounded Dialogue（arXiv 2603.18911）
4. Grounded Post-Training with Hard Examples for Reducing Hallucination（arXiv 2605.16411）

## 采纳进 v1.17.0 的映射

- Iterative RAG（迭代检索-生成协同）→ 证据充分性自检 + 缺口定向补查循环
- Multi-Agent Evidence Retrieval / credibility scoring（多源可信度评分）→ 置信度三档（高/中/低）
- Citation-Enhanced / Grounded Generation（引用接地）→ 装饰性引用禁令（与编造 URL 同罪）
- Self-RAG（自反思批判）→ 查证侧发前三问（源可信/结论不超证据/引用直撑句子）

## 未采纳（暂）

- Self-RAG 的检索决策 token 化（模型学习何时检索）：需模型级改造，超出文本 skill 范畴
- 知识图谱混合（Hybrid Fact-Checking）：skill 无 KG 基础设施
- MultiFC 数据集复现：非工具任务
