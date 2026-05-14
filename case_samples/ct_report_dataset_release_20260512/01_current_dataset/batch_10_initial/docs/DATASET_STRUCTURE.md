# AI诊疗课题数据集结构说明

本文档描述 `D:\Multimodel-Intelligence\case_samples\AI诊疗课题\多模态微调草稿` 下各目录的意义，以及
`CT_nii_gz`、病例目录和 `gt_pairs_by_study` 之间的对应关系，供后续 agent 直接复用。

## 1. 目录总览

- `CT_nii_gz/`
  - 已转成 NIfTI 的 CT 数据
  - 结构是：`影像号/检查日期/序列文件`
- `保守治疗/`
  - 保守治疗病例原始目录
- `手术治疗/`
  - 手术治疗病例原始目录
- `gt_pairs_by_study/`
  - 按“每次 CT 检查一条样本”整理出的 ground-truth 数据集
- `qwen_rendered_axial30_thick/`
  - 从每条样本中选择厚层主序列，按脑窗渲染成 30 张轴位 PNG
- `qwen_rendered_axial30_thin/`
  - 从每条样本中选择薄层主序列，按脑窗渲染成 30 张轴位 PNG
- `CT病人目录20260413.xlsx`
  - 桥表，用于连接病例目录与 CT 数据
- `病例文件索引.csv`
  - 病例目录中的文件索引
- `目录索引与命名说明.md`
  - 原始命名说明

## 2. 桥表的作用

工作簿 `CT病人目录20260413.xlsx` 只有一个 sheet，核心列是：

- `姓名`
- `住院号`
- `影像号`
- `头CT日期1`
- `头CT日期2`

它的作用是把两类数据连起来：

1. `姓名 + 住院号`
   - 对应 `保守治疗/` 或 `手术治疗/` 下的某一个病例目录
2. `影像号 + 头CT日期1 + 头CT日期2`
   - 对应 `CT_nii_gz/` 下的 CT study

也就是说，每个病例目录都可以被映射成：

- 第一次 CT 检查
- 第二次 CT 检查
- 两份对应的 CT 报告 PNG

## 3. 病例目录的含义

病例目录命名规则通常是：

- `姓名 + 住院号 + 疾病类型`

例如：

- `郝家梁 1433592 脑干出血`
- `李红 1442355 基底节出血`

### 3.1 保守治疗常见文件

- `入院CT图.mp4` 或 `入院CT图像.mp4`
- `入院CT报告.png`
- `复查CT图.mp4` / `复查CT图像.mp4` / `7dCT图.mp4`
- `复查CT报告.png` / `CT复查报告.png` / `7dCT报告.png`
- `首次病程记录.png`
- `出院记录.png`
- `谈话记录.png`

### 3.2 手术治疗常见文件

- `入院CT图像.mp4`
- `入院CT报告.png`
- `复查CT图像.mp4` 或 `出院CT图像.mp4`
- `复查CT报告.png` 或 `出院CT报告.png`
- `首次病程记录.png`
- `出院记录.png`
- `手术记录.png`
- `手术同意书.png`

## 4. `CT_nii_gz` 的含义

`CT_nii_gz` 的结构是：

- `影像号/检查日期/序列`

例如：

- `CT_nii_gz/62003626/20260105/`
- `CT_nii_gz/62003626/20260113/`

同一次 CT 检查下面通常不是 1 个 `nii.gz`，而是多个重建序列。
每个 `nii.gz` 旁边有一个同名 `.json`，保存该序列的元数据。

### 4.1 一个 study 下为什么会有多个 `nii.gz`

同一次 CT 检查可能包含多个重建序列，例如：

- scout
- `med, iDose (1)`
- `med, iDose (4)`
- `1.25mm stnd`
- `Recon 2`
- `5mm Std`

因此：

- “一份报告”通常对应“一次 CT 检查”
- 而不是只对应某一个单独的 `nii.gz`

## 5. `gt_pairs_by_study` 的样本粒度

`gt_pairs_by_study` 采用的粒度是：

- 每一次 CT 检查 = 一条样本

不是：

- 每个病人一条样本
- 每个 `nii.gz` 一条样本

这意味着一个病人通常会拆成两条样本：

- `study1`
- `study2`

### 5.1 `study1` 和 `study2` 的含义

- `study1`
  - 对应桥表中的 `头CT日期1`
  - 一般对应病例目录中的 `入院CT报告` 和 `入院CT图像`
- `study2`
  - 对应桥表中的 `头CT日期2`
  - 一般对应病例目录中的第二次报告和第二次 CT 视频
  - 第二次报告名字不统一，可能是：
    - `复查CT报告`
    - `CT复查报告`
    - `7dCT报告`
    - `出院CT报告`

## 6. `gt_pairs_by_study` 样本目录结构

每条样本目录命名规则：

- `{治疗方式}__{病例目录名}__study{1|2}__{影像号}__{检查日期}`

例如：

- `保守治疗__郝家梁 1433592 脑干出血__study1__62003626__20260105`

每条样本目录固定包含：

- `ct_study/`
  - 当前这次 CT 检查的全部 `nii.gz` 和同名 `.json`
- `report/report.png`
  - 当前这次 CT 检查对应的唯一报告 PNG
- `ct_video/ct_video.mp4`
  - 当前这次 CT 检查对应的唯一 CT 视频
- `case_docs/`
  - 当前病例的其他文书
- `metadata.json`
  - 本样本的映射和来源说明

## 7. `report` 为什么只有一份

因为当前样本粒度是“每次 CT 检查一条样本”。

例如 `郝家梁 1433592 脑干出血`：

- `study1`
  - 只包含 `入院CT报告`
- `study2`
  - 只包含 `复查CT报告`

两份报告没有放在一个样本里，而是分别放在这两个样本目录中。

## 8. `primary_series_candidate` 的含义

每条样本的 `metadata.json` 中有一个字段：

- `primary_series_candidate`

它表示该次 CT 检查下，默认最像“主序列”的 `nii.gz` 文件名。

这个字段只是标注，不影响样本内容。
当前样本依然保留整次检查的全部序列。

主序列挑选规则是：

- 尽量排除 scout
- 排除单层图像
- 优先切片数更多的序列
- 若描述存在，优先：
  - `med`
  - `iDose`
  - `1.25mm`
  - `Recon 2`
  - `5mm Std`

## 9. 当前特殊病例

只有 1 个已知特殊病例：

- `刘顶学 1447841 外伤`

工作簿里该病例写成：

- `62036945（无名氏）/62041493`

因此：

- `study1 -> 62036945 / 20260319`
- `study2 -> 62041493 / 20260327`

该规则已经写入样本 `metadata.json` 的 `special_rule=split_image_id_case`。

## 10. 后续 agent 推荐读取方式

推荐按下面顺序读取：

1. 先读本文档
2. 再读 `gt_pairs_by_study/pair_manifest.csv`
3. 若需要单样本细节，再进入某条样本目录读取 `metadata.json`
4. 若要看 CT 数据，进入该样本下的 `ct_study/`

如果后续要做：

- 选单个 `nii.gz`
- 抽 32 张切片
- 生成更干净的训练集
- 调用 `Qwen3-VL` 做 zero-shot 或微调

建议一律以 `gt_pairs_by_study` 为上游入口，不要重新从 `保守治疗/手术治疗/CT_nii_gz` 手工配对。

## 11. Qwen3-VL 渲染版数据集

当前已经额外构建了两套面向 `Qwen3-VL` 的渲染版数据集：

- `qwen_rendered_axial30_thick`
- `qwen_rendered_axial30_thin`

它们的目标不是直接保留 3D 医学体数据，而是把一个 study 中选定的主序列渲染成：

- 30 张轴位 PNG
- 每张大小 `512 x 512`
- 统一使用脑窗：
  - `WL = 37`
  - `WW = 82`

### 11.1 为什么要做渲染版

`Qwen3-VL` 原生支持的是：

- 图像
- 多图
- 视频

而不是直接把一个 `512 x 512 x 30` 的 3D 医学 tensor 作为模型输入。

因此当前做法是：

- 先从 `nii.gz` 里抽取 30 个轴位切片
- 渲染成 PNG 序列
- 后续可以把这 30 张图作为：
  - 多图输入
  - 或者帧序列视频输入

### 11.2 渲染版样本结构

每条样本目录中至少包含：

- `frames/`
  - `frame_000.png` 到 `frame_029.png`
- `preview_grid.png`
  - 30 张图的拼图预览
- `report/report.png`
  - 对应的 CT 报告 PNG
- `metadata.json`
  - 记录使用的是哪条 `nii.gz`、抽了哪些 slice

### 11.3 `thick` 和 `thin` 的含义

- `thick`
  - 优先选择厚层主序列
  - 一般 `z spacing > 1.5mm`
- `thin`
  - 优先选择薄层主序列
  - 一般 `z spacing <= 1.5mm`

注意：

- 并不是每个 study 都同时存在 `thick` 和 `thin`
- 当前 `qwen_rendered_axial30_thin` 缺 2 条样本，具体见各自目录下的 `warnings.json`
