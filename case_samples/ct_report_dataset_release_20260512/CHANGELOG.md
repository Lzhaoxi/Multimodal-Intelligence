# 数据集维护记录

## 2026-05-12 固定版 release

交付目录：

`D:\Multimodel-Intelligence\case_samples\ct_report_dataset_release_20260512`

### 数据整理

- 将第一次 10 例和新数据 40 例统一整理到 `01_current_dataset`。
- 将两个原工作目录整体归档到 `02_legacy_archive`。
- 原工作目录位置已清理：
  - `D:\Multimodel-Intelligence\case_samples\AI诊疗课题\多模态微调草稿`
  - `D:\Multimodel-Intelligence\case_samples\新数据2026_05_10\processed_40cases`

### 最新数据入口

- `01_current_dataset\unified_study_manifest.csv`：100 条 study。
- `01_current_dataset\unified_render_manifest.csv`：156 条渲染样本。
- `batch_10_initial`：20 条 thick，18 条 thin。
- `batch_40_new`：62 条 thick，56 条 thin。

### headfix 规则

- 新增 DICOM tag 级别 series 选择，优先识别 `CT Head / head / brain / cranial`。
- 强排除胸腹部、肢体、颈椎、scout、batch 等非颅脑 series。
- 修复 `iDose` 被 `dose` 误排的问题。
- 厚薄层优先按 DICOM `SliceThickness` 判断，而不是只看 NIfTI sidecar 的 z spacing。
- 对第一次数据中的标签冲突做窄范围放行：`StudyDescription=CT Chest` 但 `ProtocolName` 明确为 Head 且几何特征符合颅脑 CT 时，标记为 `conflict_override:protocol_head_geometry`。

### 视觉闭环

- 新数据 40 例：subagent 复核 `headfix_v1` 的 study2 contact sheet，未发现非颅脑污染。
- 第一次 10 例：subagent 复核 `headfix_v1` 的 study2 contact sheet，未发现非颅脑污染。
- 两批数据中缺失的 variant 均按 warning 保留，不使用体部 CT 补假数据。

### 路径维护

- 复制到 release 后，已重写 `pair_manifest.csv` 和渲染 `manifest.csv` 中的关键路径：
  - `report_png`
  - `ct_study_dir`
  - `case_docs_dir`
  - `frames_dir`
  - `preview_grid`
  - `metadata_json`
- 每个 batch 的 `manifests/` 中已将重名文件改成明确名称：
  - `ct_nii_manifest.csv`
  - `pair_manifest.csv`
  - `rendered_thick_manifest.csv`
  - `rendered_thin_manifest.csv`
  - `rendered_thick_warnings.json`
  - `rendered_thin_warnings.json`
  - `head_series_selection_manifest.csv`
  - `headfix_warnings.json`
  - `series_dicom_tags.csv/json`

## 历史风险

- 旧版 `qwen_rendered_axial30_thick/thin` 的 study2 曾因同一检查日期混有多部位 CT，选到胸腹部或肢体 CT。
- 当前默认入口必须使用 `*_headfix_v1` 或统一 manifest。
