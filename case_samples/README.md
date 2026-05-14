# case_samples 数据目录说明

更新时间：2026-05-13

## 推荐使用路径

后续训练、评测、zero-shot 对比实验优先使用：

```text
D:\Multimodel-Intelligence\case_samples\ct_report_dataset_release_20260512\01_current_dataset
```

该目录已经整合了旧 10 例和新 40 例的 headfix 修复版数据，并保留统一 manifest。

## 目录角色

```text
case_samples/
├── ct_report_dataset_release_20260512/
│   ├── 01_current_dataset/   # 当前固定发布版，优先使用
│   ├── 02_legacy_archive/    # 旧工作区和中间产物，回滚用
│   ├── tools/                # 数据集发布时用到的工具脚本副本
│   ├── CHANGELOG.md
│   └── README.md
└── AI诊疗课题/                 # 原始源数据和旧工作区，不作为默认入口
```

## 当前发布版内容

`01_current_dataset` 下包含：

- `batch_10_initial/`：第一批 10 例。
- `batch_40_new/`：新 40 例。
- `gt_reports/`：目前已提取的文本版 GT 报告。
- `unified_render_manifest.csv`：渲染图像清单。
- `unified_study_manifest.csv`：study 清单。

每个 batch 内的关键目录：

- `gt_pairs_by_study/`：study 级完整数据容器，包含 CT study、报告 PNG、病例文档和 metadata。
- `qwen_rendered_axial30_thick_headfix_v1/`：厚层头颅 CT 修复版渲染，30 张轴位 PNG。
- `qwen_rendered_axial30_thin_headfix_v1/`：薄层头颅 CT 修复版渲染，30 张轴位 PNG。
- `CT_nii_gz/`：DICOM 转换得到的 NIfTI 与元数据。
- `manifests/`：配对、渲染、series 选择等清单。
- `docs/`：该 batch 的处理说明。

## 删除/归档策略

本轮没有删除大数据目录。后续如果要释放空间，建议优先级如下：

1. 确认 `01_current_dataset` 已经满足训练/评测后，压缩或删除 `02_legacy_archive`。
2. 确认原始 DICOM 已有外部备份后，再考虑迁移或删除 `AI诊疗课题`。
3. 不要删除 `01_current_dataset`，这是当前固定数据集入口。
