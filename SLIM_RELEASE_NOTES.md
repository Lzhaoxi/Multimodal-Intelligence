# 瘦身 Git 发布说明

生成时间：2026-05-14

这个目录是为 Git 远端推送准备的瘦身版固定数据集。

## 包含内容

- `case_samples/ct_report_dataset_release_20260512/01_current_dataset`
- `README.md`
- `PROJECT_STRUCTURE.md`
- `case_samples/README.md`
- `case_samples/ct_report_dataset_release_20260512/README.md`
- `case_samples/ct_report_dataset_release_20260512/CHANGELOG.md`

## 排除内容

为避免 GitHub 普通 Git / LFS 体积问题，本瘦身版排除了：

- `CT_nii_gz/`
- `gt_pairs_by_study/`

也就是说，这个仓库保留的是后续训练/评测最直接使用的渲染 PNG、报告、metadata、manifest、docs、workbook 等轻量固定数据集，不包含完整 NIfTI study 容器。

完整本地数据仍保留在：

```text
D:\Multimodel-Intelligence\case_samples\ct_report_dataset_release_20260512\01_current_dataset
```

## 推送策略

建议先推送到独立分支，例如：

```text
slim-current-dataset-20260514
```

确认远端仓库是私有仓库且内容合规后，再考虑是否强制替换 `main`。
