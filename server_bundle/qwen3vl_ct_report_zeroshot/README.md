# Qwen3-VL CT Zero-Shot Bundle

This folder is the self-contained package intended to be pushed to a server for first-round zero-shot inference on the rendered CT dataset.

## Contents

- `datasets/qwen_rendered_axial30_thick`
  - 30-frame axial rendered dataset built from thick-slice series
- `datasets/qwen_rendered_axial30_thin`
  - 30-frame axial rendered dataset built from thin-slice series
- `scripts/run_qwen3vl_zero_shot.py`
  - Zero-shot inference script adapted to the official Qwen3-VL inference flow
- `prompts/default_report_prompt.txt`
  - Default Chinese structured-report prompt
- `requirements-server.txt`
  - Minimal Python dependencies for server setup
- `OFFICIAL_ALIGNMENT.md`
  - Notes on which official Qwen3-VL code paths this bundle follows

## Model choice

Default model:

- `Qwen/Qwen3-VL-8B-Instruct`

Reason:

- The official 8B weights are practical for first-round zero-shot inference on a 48GB RTX 4090.
- It is materially safer than moving directly to larger Qwen3-VL variants for initial validation.

## Input format

Qwen3-VL does **not** take a raw 3D `512x512x30` tensor as input.

This bundle uses the official supported multimodal path:

- a list of local frame images passed as a `video`

Each sample therefore provides:

- `frames/frame_000.png` ... `frames/frame_029.png`
- `report/report.png` as ground truth reference
- `metadata.json`

## Quick start

### 1. Create environment

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements-server.txt
```

If you have a CUDA-specific PyTorch requirement, install the correct torch build first and then run the `requirements-server.txt` install.

### 2. Dry run

```bash
python scripts/run_qwen3vl_zero_shot.py \
  --dataset-root datasets/qwen_rendered_axial30_thin \
  --limit 1 \
  --dry-run
```

### 3. Run one sample

```bash
python scripts/run_qwen3vl_zero_shot.py \
  --dataset-root datasets/qwen_rendered_axial30_thin \
  --sample-id "保守治疗__郝家梁 1433592 脑干出血__study1__62003626__20260105"
```

### 4. Run a small batch

```bash
python scripts/run_qwen3vl_zero_shot.py \
  --dataset-root datasets/qwen_rendered_axial30_thin \
  --limit 5
```

## Outputs

Predictions are written under:

- `outputs/<model_alias>/<sample_id>/prediction.txt`
- `outputs/<model_alias>/<sample_id>/prediction.json`
- `outputs/<model_alias>/predictions.jsonl`

## Notes

- `thin` is the preferred first-pass dataset for medical-image zero-shot validation.
- `thick` is included for comparison, not because it is necessarily the better final training source.
- Two thin-slice studies are absent by construction; see the dataset warnings file.
