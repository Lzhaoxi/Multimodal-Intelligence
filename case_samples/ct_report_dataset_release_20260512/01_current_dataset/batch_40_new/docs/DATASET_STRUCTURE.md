# 新数据 40 例处理后数据集结构说明

本文档说明 `D:\Multimodel-Intelligence\case_samples\新数据2026_05_10\processed_40cases` 的目录结构和字段含义。

## 1. 数据来源

- 病例文书来源：`D:\Multimodel-Intelligence\case_samples\新数据2026_05_10\40例`
- 原始 CT DICOM 来源：`D:\Multimodel-Intelligence\case_samples\新数据2026_05_10\40CT2026\CT2026\CT2026`
- 桥表：`CT目录20260425.xlsx`

桥表字段为：

- `姓名`
- `年龄`
- `性别`
- `住院号`
- `影像号`
- `头CT日期1`
- `头CT日期2`

桥表用于连接两类数据：

- `姓名 + 住院号` 对应 `保守治疗/` 或 `手术治疗/` 下的病例目录
- `影像号 + 头CT日期1/头CT日期2` 对应原始 DICOM 和转换后的 CT study

## 2. 主目录结构

- `保守治疗/`
  - 20 例保守治疗病例文书 PNG 的副本
- `手术治疗/`
  - 20 例手术治疗病例文书 PNG 的副本
- `CT_nii_gz/`
  - 从原始 DICOM 转换出的 CT-only NIfTI 数据
  - 结构为：`影像号/检查日期/series_*.nii.gz`
- `gt_pairs_by_study/`
  - 按“每次 CT 检查一条样本”整理的 ground-truth 配对数据集
- `qwen_rendered_axial30_thick/`
  - 厚层主序列渲染为 30 张轴位 PNG 的 Qwen3-VL 输入数据
- `qwen_rendered_axial30_thin/`
  - 薄层主序列渲染为 30 张轴位 PNG 的 Qwen3-VL 输入数据
- `logs/`
  - 转换、配对、渲染过程日志

## 3. CT_nii_gz

`CT_nii_gz` 当前包含：

- 40 个影像号目录
- 80 个检查日期目录
- 772 个 `.nii.gz`
- 772 个同名 `.json`
- `manifest.csv`

本轮转换只保留 `Modality = CT` 的 series。中断转换过程中曾混入的 `MR` 和 `DX` 生成物已从处理后目录清理，不影响原始 DICOM。

每个 `.json` 保存该 series 的元数据，包括：

- `patient_id`
- `study_date`
- `series_number`
- `modality`
- `series_description`
- `source_file_count`
- `size`
- `spacing`
- `direction`
- `output_nii_gz`

## 4. gt_pairs_by_study

`gt_pairs_by_study` 的样本粒度是：

- 每一次 CT 检查 = 一条样本

因此 40 个病例被拆成 80 条样本：

- `study1` 对应桥表中的 `头CT日期1`，通常对应 `入院CT报告.png`
- `study2` 对应桥表中的 `头CT日期2`，本批数据对应 `出院CT报告.png`

样本目录命名规则：

`{治疗方式}__{病例目录名}__study{1|2}__{影像号}__{检查日期}`

每条样本包含：

- `ct_study/`
  - 当前 study 的全部 CT-only NIfTI series 和同名 JSON
- `report/report.png`
  - 当前 study 对应的唯一 GT 报告 PNG
- `case_docs/`
  - 同一病例中除当前报告以外的其他 PNG 文书
- `metadata.json`
  - 当前样本的来源、桥表字段、study 信息、报告路径、主序列候选和 warning

本批新数据没有 CT mp4，因此 `gt_pairs_by_study/warnings.json` 中有 80 条 `missing_ct_video`，这是预期现象。

## 5. thick / thin 渲染版

Qwen3-VL 不直接接收 `nii.gz` 或 `512 x 512 x depth` 的 3D tensor。本批数据沿用前序流程，将选定 series 渲染为多帧 PNG：

- 轴位切片
- 每条样本 30 张 PNG
- 每张 `512 x 512`
- 脑窗：`WL = 37`，`WW = 82`

每条渲染样本包含：

- `frames/frame_000.png` 到 `frames/frame_029.png`
- `preview_grid.png`
- `report/report.png`
- `metadata.json`

当前渲染结果：

- `qwen_rendered_axial30_thick`
  - 79 条样本
  - 2370 张 frame PNG
  - 1 条 `missing_variant_series`
- `qwen_rendered_axial30_thin`
  - 75 条样本
  - 2250 张 frame PNG
  - 5 条 `missing_variant_series`

## 6. 已知风险

前序数据中曾发现 `study2` / 出院 / 复诊检查可能混入非颅脑 CT。新数据本轮先全量处理，不自动删除 `study2`。后续用于训练或评估前，建议重点人工质检：

- `study2`
- `series_description` 含 `lung`、`bone`、`Batch`、`Dose Record` 的序列
- 渲染预览 `preview_grid.png` 明显不是颅脑轴位的样本

