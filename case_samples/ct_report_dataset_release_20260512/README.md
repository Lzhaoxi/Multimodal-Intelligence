# CT 报告生成数据集固定版 release

固定版日期：2026-05-12

本目录是当前用于 Qwen3-VL 训练/评测的固定数据交付目录。旧版、中间版和原工作目录已归档，不再作为默认训练入口。

## 目录结构

```text
ct_report_dataset_release_20260512/
  01_current_dataset/      # 最新统一数据集，后续训练/评测优先使用
  02_legacy_archive/       # 原工作目录和历史输出归档
  tools/                   # 本次 headfix 渲染使用的脚本快照
  README.md
  CHANGELOG.md
```

## 当前固定数据集

入口目录：

`D:\Multimodel-Intelligence\case_samples\ct_report_dataset_release_20260512\01_current_dataset`

包含两个 batch：

- `batch_10_initial`：第一次 10 例，20 个 study。
- `batch_40_new`：新数据 40 例，80 个 study。

统一清单：

- `01_current_dataset\unified_study_manifest.csv`：100 条 study 级样本。
- `01_current_dataset\unified_render_manifest.csv`：156 条渲染输入样本。

渲染样本统计：

- thick headfix：82 条，来自 `batch_10_initial` 20 条 + `batch_40_new` 62 条。
- thin headfix：74 条，来自 `batch_10_initial` 18 条 + `batch_40_new` 56 条。

每个 batch 内包含：

- `CT_nii_gz/`：CT series 的 NIfTI 与 sidecar JSON。
- `gt_pairs_by_study/`：按 study 配对的 CT、报告 PNG、病例文档。
- `qwen_rendered_axial30_thick_headfix_v1/`：厚层 headfix 渲染，30 张轴位 PNG。
- `qwen_rendered_axial30_thin_headfix_v1/`：薄层 headfix 渲染，30 张轴位 PNG。
- `headfix_qc_contact_sheets/`：study2 快速复核拼图。
- `source_case_dirs/`：原病例文书目录副本。
- `workbook/`：Excel 桥表。
- `manifests/`：按用途重命名后的清单和 warning 文件。
- `docs/`：该 batch 的处理说明。

## 默认使用方式

后续训练/评测优先读取：

```text
01_current_dataset\unified_render_manifest.csv
```

其中每一行是一条可输入模型的渲染样本，包含：

- `batch_id`
- `variant`：`thick` 或 `thin`
- `sample_id`
- `frames_dir`
- `preview_grid`
- `report_png`
- `metadata_json`
- `series_file`
- `head_reasons`

如果只想使用厚层：

```text
variant == "thick"
```

如果只想使用薄层：

```text
variant == "thin"
```

## 归档数据

旧版和中间版放在：

`D:\Multimodel-Intelligence\case_samples\ct_report_dataset_release_20260512\02_legacy_archive`

包含：

- `batch_10_initial_original_workdir`
- `batch_40_new_original_workdir`

这里保留了原工作目录中的旧版 `qwen_rendered_axial30_thick/thin`、headfix 结果、logs、原始处理说明等内容，仅用于追溯和对比，不作为默认训练入口。

## 注意事项

- 旧版非 headfix 渲染曾出现 study2 选到胸腹部/肢体 CT 的问题，默认不要再用于训练。
- 固定版中的 manifest 已重写为 release 目录下的绝对路径。
- 部分样本没有 thin 或 thick head series 时，不用体部 CT 顶替，而是在 warning 中保留缺失记录。
