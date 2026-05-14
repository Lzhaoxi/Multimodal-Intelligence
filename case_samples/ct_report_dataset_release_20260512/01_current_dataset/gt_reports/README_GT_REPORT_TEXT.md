# GT Report Text

这个目录保存从 `report/report.png` 中提取出的报告正文 GT，用于后续 LLM/VLM 生成报告的量化评测。

当前版本先手动录入今天评测需要的 2 个旧数据 study1 样本，并同步写入 thick/thin 两个渲染版本：

- `保守治疗__郝家梁 1433592 脑干出血__study1__62003626__20260105`
- `手术治疗__刘健 1330792 小脑出血__study1__61741255__20240720`

每条样本的 `report/` 目录新增：

- `report_gt_text.txt`：只包含 `检查所见` 和 `印象`，便于人工阅读。
- `report_gt_text.json`：结构化字段，便于指标脚本读取。

统一索引：

- `gt_report_text_manifest.csv`
- `gt_report_text_manifest.json`

## 抽取原则

- 不保留页眉、医院名、二维码、患者姓名、年龄、性别、影像号、临床诊断、医生签名、报告时间等非报告结论内容。
- 当前用于指标的主字段是 `findings` 和 `impression`。
- `report_method` 会保留在 JSON 中，但默认不拼入 `gt_report_text`，避免不同医院模板影响报告内容指标。

## 后续全量 OCR 建议

全量自动抽取 256 张 `report.png` 需要可靠中文 OCR，例如 PaddleOCR、CnOCR 或 Tesseract 中文模型。本机当前没有这些依赖，因此本版本不做全量自动 OCR。

推荐后续流程：

1. OCR 先裁掉报告上半部页眉和底部署名区域，只保留 `检查方法/检查所见/印象` 附近文本。
2. 用规则抽取 `检查所见:` 到 `印象:` 之间的正文，以及 `印象:` 后的编号条目。
3. 对 OCR 结果做人工校验，尤其是标点、左右侧、脑室/脑池、血肿部位和编号条目。
4. 通过同样的 `report_gt_text.json` schema 回写，保持评测脚本不变。
