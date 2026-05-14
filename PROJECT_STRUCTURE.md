# 项目目录结构说明

更新时间：2026-05-13

## 当前推荐入口

```text
D:\Multimodel-Intelligence
├── case_samples/        # 数据集、原始数据、发布版数据
├── scripts/             # DICOM/NIfTI/PNG/GT/数据集构建脚本
├── server_bundle/       # 本地模型与 API zero-shot 推理、评测实验
├── docs/                # 调研、会议、数据说明文档
├── presentations/       # 最终汇报 PPT
├── references/          # 论文 PDF
├── external/            # 外部框架或官方代码仓库
├── archive/             # 已归档的散落文件、临时文件、重复文档
└── tmp/                 # 新的临时工作目录，默认应保持可删除
```

## 数据目录

当前固定可用的数据集在：

```text
case_samples/ct_report_dataset_release_20260512/01_current_dataset
```

该目录是后续训练、评测、zero-shot 对比实验应优先使用的入口。内部包含：

- `batch_10_initial/`：第一批 10 例修复版数据。
- `batch_40_new/`：新 40 例修复版数据。
- `gt_reports/`：目前已人工提取的报告 GT 文本。
- `unified_render_manifest.csv`：统一渲染图像清单。
- `unified_study_manifest.csv`：统一 study 级清单。

旧处理目录和回滚材料在：

```text
case_samples/ct_report_dataset_release_20260512/02_legacy_archive
```

该目录保留旧版工作区、旧版渲染、修复前后的中间产物。它占空间较大，属于“确认当前发布版无问题后可再讨论压缩/删除”的候选，不建议在没有备份前直接删除。

原始源数据仍在：

```text
case_samples/AI诊疗课题
```

该目录包含早期原始 CT、40 例原始 DICOM、病例文书和 Excel 桥表。它不是训练/评测的默认入口，但如果后续要重新转换 DICOM、修复 study 或追溯源文件，仍然需要保留。

## 脚本目录

```text
scripts/
├── convert_ct_dicom_to_nii.py          # DICOM 转 NIfTI
├── build_gt_pairs_by_study.py          # study 级图像-报告配对
├── build_qwen_rendered_datasets.py     # 旧版渲染数据集
├── build_qwen_headfix_datasets.py      # 头颅 CT 修复版渲染数据集
├── seed_manual_gt_report_text.py       # 手动 GT 报告文本落盘
├── ct_nii_viewer.py                    # NIfTI 查看器
└── study_sagittal_triplet_viewer.py    # study 多序列查看器
```

## 实验目录

```text
server_bundle/
├── qwen3vl_ct_report_zeroshot/          # 本地 Qwen3-VL zero-shot 实验
└── api_multimodal_ct_report_zeroshot/   # OpenAI/Claude/API 对比实验与指标
```

API 评测指标报告当前在：

```text
server_bundle/api_multimodal_ct_report_zeroshot/metrics/baseline_report_eval_20260513
```

## 文档目录

```text
docs/
├── research/    # 技术路线、诊断流程等调研
├── dataset/     # 数据集汇报素材、病例结构分析
├── meetings/    # 会议记录与会议 PDF
└── examples/    # 示例材料
```

重复文档 `ich-diagnostic-workflow-research.md` 与 `脑出血诊断流程调研.md` 内容完全相同，已保留中文文件为主版本，英文命名副本归档。

## 归档目录

```text
archive/cleanup_20260513/
├── root_misc_files/       # 原根目录散落测试文件
├── duplicate_docs/        # 重复文档副本
├── tmp_legacy_contents/   # 原 tmp 下旧临时输出
├── .nifti_tmp/            # 原空临时 NIfTI 目录
└── move_log.csv           # 本轮移动记录
```

归档目录中的内容暂时不参与训练、评测和数据集发布。若后续确认完全不需要，可以再做一次带确认的删除。

## 暂未自动删除的大目录

以下目录占空间大，但本轮未删除：

- `.git/`：约 75GB，疑似包含历史大文件。若要瘦身，需要单独做 Git 历史清理或重新建仓，不能直接删除。
- `case_samples/ct_report_dataset_release_20260512/02_legacy_archive`：约 64GB，旧工作区回滚材料。
- `case_samples/AI诊疗课题`：约 51GB，原始源数据和旧项目数据。

建议顺序：

1. 先使用 `01_current_dataset` 继续训练/评测。
2. 确认当前数据集稳定后，再决定是否压缩或删除 `02_legacy_archive`。
3. 原始 DICOM 源数据建议至少保留一份外部备份后再删除。
4. `.git` 瘦身需要单独处理，不能用普通文件夹清理替代。
