# 当前固定数据集说明

本目录是训练/评测默认入口。

## 批次

- `batch_10_initial`：第一次 10 例，20 个 study。
- `batch_40_new`：新数据 40 例，80 个 study。

## 推荐入口

- `unified_study_manifest.csv`：study 级信息，每行对应一次 CT 检查。
- `unified_render_manifest.csv`：模型输入级信息，每行对应一个 thick 或 thin 渲染样本。

训练 Qwen3-VL 或 zero-shot 评测时，优先读取 `unified_render_manifest.csv`：

- `frames_dir` 是 30 张 PNG 输入帧目录。
- `report_png` 是对应 GT 报告 PNG。
- `preview_grid` 是快速检查图。
- `variant` 区分 `thick` 和 `thin`。

## 样本粒度

样本粒度固定为 study，即一次 CT 检查日期一条 study。一个 study 可以有 thick 渲染、thin 渲染，或只有其中一种。

## 质量控制

本版本已做 headfix：

- 已选渲染样本均通过头颅 CT series 选择器。
- study2 已通过 contact sheet 和 subagent 视觉复核。
- 缺失的 thick/thin 不用其他部位 CT 顶替。
