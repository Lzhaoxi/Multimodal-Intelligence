# 第一次 CT 数据 headfix_v1 交付说明

生成日期：2026-05-12

## 处理目标

对第一次数据集中的 `qwen_rendered_axial30_thick/thin` 做头颅 CT series 选择修复，避免 `study2` 同一检查日期下混入胸腹部、肢体或其他非颅脑 CT series。

原始目录、旧版渲染目录和 `gt_pairs_by_study` 均未覆盖；本次只新增 headfix 派生数据。

## 输出位置

数据根目录：

`D:\Multimodel-Intelligence\case_samples\AI诊疗课题\多模态微调草稿`

新增输出：

- `qwen_rendered_axial30_thick_headfix_v1`
- `qwen_rendered_axial30_thin_headfix_v1`
- `CT_nii_gz\series_dicom_tags.csv`
- `CT_nii_gz\series_dicom_tags.json`
- `head_series_selection_manifest.csv`
- `headfix_warnings.json`
- `headfix_qc_contact_sheets`

复用脚本：

`D:\Multimodel-Intelligence\scripts\build_qwen_headfix_datasets.py`

## 选择规则

- 先读取 DICOM tag：`StudyDescription / ProtocolName / SeriesDescription / BodyPartExamined / PixelSpacing / SliceThickness`。
- 强正例：`CT Head / head / brain / cranial`。
- 强排除：`chest / thorax / lung / abdomen / pelvis / humerus / femur / spine / cervical / neck / extremity / scout / for 3d / batch`。
- 不再把 `iDose` 当成 `dose` 排除。
- 厚薄层优先按 DICOM `SliceThickness` 判断：`> 1.5mm` 为 thick，`<= 1.5mm` 为 thin。
- 对旧数据中存在的标签冲突做窄范围放行：若 `StudyDescription=CT Chest`，但 `ProtocolName` 明确包含 `Head`，且图像是 512x512、小 FOV、非 scout，则标记为 `conflict_override:protocol_head_geometry`。
- 若没有可信 head thick/thin，不用体部 CT 顶替，只写 `missing_head_variant_series` warning。

## 结果统计

基础数据：

- `CT_nii_gz/manifest.csv`：141 条 CT series
- `CT_nii_gz/series_dicom_tags.csv`：138 个唯一 series UID
- `gt_pairs_by_study/pair_manifest.csv`：20 条 study 样本
- `head_series_selection_manifest.csv`：40 条选择记录

headfix 输出：

- `qwen_rendered_axial30_thick_headfix_v1`：20 条样本，0 条 warning
- `qwen_rendered_axial30_thin_headfix_v1`：18 条样本，2 条 warning

两个 thin 缺失样本：

- `保守治疗__刘顶学 1447841 外伤__study2__62041493__20260327`
- `手术治疗__刘灵芝 1447338 基底节出血__study1__62035985__20260317`

缺失原因：对应 `ct_study` 中只有可信 5mm thick head series，没有 thin head series。

## 重点样本

- `保守治疗__郝家梁 1433592 脑干出血__study2__62003626__20260113`
  - thick：`series_2__CT__5mm_stnd__933_1768087759_421.nii.gz`
  - thin：`series_3__CT__Recon_2_5mm_stnd__1768087759_421_3.nii.gz`
  - 选择理由：`conflict_override:protocol_head_geometry`
- `保守治疗__胡子清 1443964 额叶出血__study2__62027804__20260307`
  - thick：`series_1__CT__5mm_stnd__653_1772095344_849.nii.gz`
  - thin：`series_2__CT__Recon_2_5mm_stnd__1772095344_849_2.nii.gz`
  - 选择理由：`conflict_override:protocol_head_geometry`
- `保守治疗__刘顶学 1447841 外伤__study2__62041493__20260327`
  - thick：`series_1__CT__head__1992_1774580709_804183.nii.gz`
  - thin：缺失，合理
- `手术治疗__王芷琴 1300240 额叶出血__study2__60882357__20260128`
  - thick：`series_6__CT__5mm_stnd__6_1769297784_428.nii.gz`
  - thin：`series_7__CT__Recon_2_5mm_stnd__1769297784_428_7.nii.gz`
  - 选择理由：`conflict_override:protocol_head_geometry`

## 验收结论

自动验收：

- 所有已生成样本均包含 30 张 `frames/frame_*.png`。
- 所有已生成样本均包含 `preview_grid.png`、`report/report.png`、`metadata.json`。
- 所有已选 series 均通过 head classifier，且无 reject reason。

subagent 只读视觉复核：

- `thick_headfix_v1` 的 10 个 `study2` 已选样本全部明确颅脑。
- `thin_headfix_v1` 的 9 个 `study2` 已选样本全部明确颅脑。
- 未发现胸腹部、肢体或其他非颅脑 CT 污染。
- 胡子清、王芷琴存在切面倾斜或术后/金属伪影，但不属于部位污染。

后续训练和 zero-shot 推理应优先使用：

- `qwen_rendered_axial30_thick_headfix_v1`
- `qwen_rendered_axial30_thin_headfix_v1`

旧版 `qwen_rendered_axial30_thick/thin` 仅保留作问题追踪和对照。
