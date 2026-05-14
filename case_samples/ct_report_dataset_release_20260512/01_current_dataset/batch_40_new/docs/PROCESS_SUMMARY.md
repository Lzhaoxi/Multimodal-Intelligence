# 新数据 40 例处理流程与验收摘要

## 1. 输入数据确认

本轮处理使用两组输入：

- 病例文书：`D:\Multimodel-Intelligence\case_samples\新数据2026_05_10\40例`
- 原始 DICOM：`D:\Multimodel-Intelligence\case_samples\新数据2026_05_10\40CT2026\CT2026\CT2026`

检查结果：

- `40例/保守治疗`：20 个病例目录
- `40例/手术治疗`：20 个病例目录
- `CT目录20260425.xlsx`：40 行病例，40 个唯一影像号
- 原始 DICOM：40 个影像号目录，每个影像号 2 个检查日期目录
- 原始 DICOM 文件数：86546
- 抽样文件在偏移 128 字节后包含 `DICM` 标记
- Excel 中 80 个 `影像号 + 日期` 均能在原始 DICOM 目录中找到
- Excel 中 40 行均能按 `姓名 + 住院号` 唯一匹配病例目录

## 2. 关键处理步骤

1. 建立处理后工作区：

   `D:\Multimodel-Intelligence\case_samples\新数据2026_05_10\processed_40cases`

2. 复制病例文书和桥表：

   - `保守治疗`
   - `手术治疗`
   - `CT目录20260425.xlsx`

3. DICOM 转 NIfTI：

   - 使用 `scripts/convert_ct_dicom_to_nii.py`
   - 源目录：`40CT2026\CT2026\CT2026`
   - 输出目录：`processed_40cases\CT_nii_gz`
   - 启用 `--modality CT`，只保留 CT series
   - 启用 `--resume`，用于中断后续跑

4. 清理和重建 CT manifest：

   - 使用 `scripts/rebuild_nii_manifest_from_json.py`
   - 删除处理后目录中已生成的非 CT series
   - 重建 `CT_nii_gz/manifest.csv`

5. 构建 study 级 GT 配对：

   - 使用 `scripts/build_gt_pairs_by_study.py`
   - `--workbook-name CT目录20260425.xlsx`
   - 输出目录：`gt_pairs_by_study`
   - 每个病例拆成 `study1` 和 `study2`
   - `study1` 对应 `入院CT报告.png`
   - `study2` 对应 `出院CT报告.png`

6. 构建 Qwen3-VL 渲染版输入：

   - 使用 `scripts/build_qwen_rendered_datasets.py`
   - 轴位渲染
   - 每条样本 30 帧
   - 每帧 `512 x 512`
   - 脑窗 `WL = 37`，`WW = 82`
   - 输出 `qwen_rendered_axial30_thick` 和 `qwen_rendered_axial30_thin`

## 3. 验收结果

`CT_nii_gz`：

- 影像号目录：40
- 检查日期目录：80
- `.nii.gz`：772
- `.json`：772
- `manifest.csv` 行数：772
- manifest 中 modality：全部为 `CT`

`gt_pairs_by_study`：

- 样本目录：80
- `metadata.json`：80
- `report/report.png`：80
- `pair_manifest.csv` 行数：80
- `warnings.json`：80 条，均为 `missing_ct_video`

`qwen_rendered_axial30_thick`：

- 样本数：79
- frame PNG：2370
- `preview_grid.png`：79
- warning：1 条 `missing_variant_series`

缺 thick 的样本：

- `手术治疗__鲍振声 1414616 颞叶出血__study2__60541346__20251016`

`qwen_rendered_axial30_thin`：

- 样本数：75
- frame PNG：2250
- `preview_grid.png`：75
- warning：5 条 `missing_variant_series`

缺 thin 的样本：

- `保守治疗__郭萍 1242205 外伤__study1__60105453__20250905`
- `手术治疗__郝宝银 1438271 基底节出血__study1__62014471__20260126`
- `保守治疗__郝明 1415746 基底节出血__study2__61958785__20260109`
- `保守治疗__刘彩霞 1049119 脑干出血__study1__60905781__20250825`
- `保守治疗__刘冬生 1389911 颞枕叶脑出血__study2__61894180__20250605`

## 4. 与旧流程保持一致的细节

- DICOM 文件不依赖扩展名，按文件头和 DICOM tag 读取。
- NIfTI 按 `影像号/检查日期/series` 保存，而不是把同一病例合成一个文件。
- 一个 study 对应一份 CT 报告，但一个 study 下可包含多个重建 series。
- `study1` / `study2` 表示桥表中的第一次 / 第二次 CT 检查，不等同于固定的“入院 / 出院”绝对概念。
- 渲染给 Qwen3-VL 的输入不是原始 3D NIfTI，而是 30 张轴位 PNG 序列。
- 渲染使用临床脑窗，避免默认强度拉伸导致脑组织对比度偏差。
- `thick` 与 `thin` 分别按 z spacing 选择厚层 / 薄层主序列；缺少对应序列时只写 warning，不生成假样本。

## 5. 后续建议

- 优先人工核查 `study2` 的 `preview_grid.png`，确认是否存在胸腹部或其他非颅脑 CT 混入。
- 对 `qwen_rendered_axial30_thin` 和 `qwen_rendered_axial30_thick` 先抽样质检，再决定训练时采用哪一版。
- 如果后续要做 Qwen3-VL zero-shot 或微调，推荐以渲染版目录为输入，以 `report/report.png` 作为 GT 报告来源。

