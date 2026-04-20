import argparse
import csv
import json
import time
from pathlib import Path


DEFAULT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_THIN_DATASET = DEFAULT_ROOT / "datasets" / "qwen_rendered_axial30_thin"
DEFAULT_MODEL_ID = "Qwen/Qwen3-VL-8B-Instruct"
DEFAULT_PROMPT_PATH = DEFAULT_ROOT / "prompts" / "default_report_prompt.txt"


def load_manifest(dataset_root: Path) -> list[dict]:
    manifest_path = dataset_root / "manifest.csv"
    with manifest_path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def select_rows(rows: list[dict], sample_id: str | None, limit: int | None, offset: int) -> list[dict]:
    if sample_id:
        selected = [row for row in rows if row["sample_id"] == sample_id]
        if not selected:
            raise SystemExit(f"Sample not found: {sample_id}")
        return selected
    selected = rows[offset:]
    if limit is not None:
        selected = selected[:limit]
    return selected


def model_alias(model_id: str) -> str:
    return model_id.replace("/", "__")


def detect_flash_attention() -> str | None:
    try:
        import flash_attn  # noqa: F401
    except Exception:
        return None
    return "flash_attention_2"


def build_messages(frame_paths: list[Path], prompt: str, sample_fps: float) -> list[dict]:
    return [
        {
            "role": "user",
            "content": [
                {
                    "type": "video",
                    "video": [path.resolve().as_uri() for path in frame_paths],
                    "sample_fps": str(sample_fps),
                },
                {"type": "text", "text": prompt},
            ],
        }
    ]


def run_single_sample(
    row: dict,
    model,
    processor,
    process_vision_info,
    prompt: str,
    sample_fps: float,
    max_new_tokens: int,
    generation_kwargs: dict,
) -> dict:
    import torch

    metadata_path = Path(row["metadata_json"])
    with metadata_path.open("r", encoding="utf-8-sig") as handle:
        metadata = json.load(handle)

    frame_paths = [Path(path) for path in metadata["render"]["frame_paths"]]
    messages = build_messages(frame_paths, prompt, sample_fps)
    text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

    images, videos, video_kwargs = process_vision_info(
        messages,
        image_patch_size=16,
        return_video_kwargs=True,
        return_video_metadata=True,
    )

    if videos is not None:
        videos, video_metadatas = zip(*videos)
        videos = list(videos)
        video_metadatas = list(video_metadatas)
    else:
        video_metadatas = None

    inputs = processor(
        text=[text],
        images=images,
        videos=videos,
        video_metadata=video_metadatas,
        return_tensors="pt",
        do_resize=False,
        **video_kwargs,
    )
    inputs = inputs.to(model.device)

    start = time.time()
    with torch.inference_mode():
        generated_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            **generation_kwargs,
        )
    latency = time.time() - start

    trimmed = [
        out_ids[len(in_ids):]
        for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
    ]
    prediction = processor.batch_decode(
        trimmed,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False,
    )[0]

    return {
        "sample_id": row["sample_id"],
        "dataset_variant": row["variant"],
        "model_id": model.config._name_or_path,
        "frame_count": len(frame_paths),
        "sample_fps": sample_fps,
        "prompt": prompt,
        "series_file": row["series_file"],
        "series_kind": row["series_kind"],
        "series_description": row["series_description"],
        "ground_truth_report_png": row["report_png"],
        "prediction": prediction,
        "latency_seconds": latency,
        "source_metadata_json": str(metadata_path),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Qwen3-VL zero-shot CT report generation.")
    parser.add_argument("--dataset-root", default=str(DEFAULT_THIN_DATASET), help="Rendered dataset root.")
    parser.add_argument("--sample-id", default=None, help="Optional exact sample_id from manifest.csv.")
    parser.add_argument("--limit", type=int, default=1, help="Number of samples to run if sample-id is not set.")
    parser.add_argument("--offset", type=int, default=0, help="Offset into manifest.")
    parser.add_argument("--model-id", default=DEFAULT_MODEL_ID, help="Model id to load.")
    parser.add_argument("--prompt-file", default=str(DEFAULT_PROMPT_PATH), help="Prompt file path.")
    parser.add_argument("--output-root", default=None, help="Optional output directory.")
    parser.add_argument("--sample-fps", type=float, default=1.0, help="sample_fps metadata for frame-list video input.")
    parser.add_argument("--max-new-tokens", type=int, default=768, help="Generation length.")
    parser.add_argument("--dtype", default="bfloat16", choices=["bfloat16", "float16", "auto"], help="Torch dtype.")
    parser.add_argument("--device-map", default="auto", help="Transformers device_map.")
    parser.add_argument("--dry-run", action="store_true", help="Only print planned execution.")
    args = parser.parse_args()

    dataset_root = Path(args.dataset_root)
    prompt = Path(args.prompt_file).read_text(encoding="utf-8")
    rows = load_manifest(dataset_root)
    selected = select_rows(rows, args.sample_id, args.limit, args.offset)

    output_root = Path(args.output_root) if args.output_root else DEFAULT_ROOT / "outputs" / model_alias(args.model_id)
    output_root.mkdir(parents=True, exist_ok=True)

    if args.dry_run:
        print(json.dumps(
            {
                "dataset_root": str(dataset_root),
                "model_id": args.model_id,
                "samples": [row["sample_id"] for row in selected],
                "output_root": str(output_root),
            },
            ensure_ascii=False,
            indent=2,
        ))
        return 0

    import torch
    from qwen_vl_utils import process_vision_info
    from transformers import AutoModelForImageTextToText, AutoProcessor

    if args.dtype == "bfloat16":
        torch_dtype = torch.bfloat16
    elif args.dtype == "float16":
        torch_dtype = torch.float16
    else:
        torch_dtype = "auto"

    model_kwargs = {
        "device_map": args.device_map,
    }
    if torch_dtype == "auto":
        model_kwargs["dtype"] = "auto"
    else:
        model_kwargs["torch_dtype"] = torch_dtype

    attn_impl = detect_flash_attention()
    if attn_impl:
        model_kwargs["attn_implementation"] = attn_impl

    model = AutoModelForImageTextToText.from_pretrained(args.model_id, **model_kwargs)
    model.eval()
    processor = AutoProcessor.from_pretrained(args.model_id)

    generation_kwargs = {
        "do_sample": True,
        "top_p": 0.8,
        "top_k": 20,
        "temperature": 0.7,
        "repetition_penalty": 1.0,
    }

    predictions: list[dict] = []
    for row in selected:
        result = run_single_sample(
            row=row,
            model=model,
            processor=processor,
            process_vision_info=process_vision_info,
            prompt=prompt,
            sample_fps=args.sample_fps,
            max_new_tokens=args.max_new_tokens,
            generation_kwargs=generation_kwargs,
        )
        predictions.append(result)

        sample_output_dir = output_root / row["sample_id"]
        sample_output_dir.mkdir(parents=True, exist_ok=True)
        (sample_output_dir / "prediction.json").write_text(
            json.dumps(result, ensure_ascii=False, indent=2),
            encoding="utf-8-sig",
        )
        (sample_output_dir / "prediction.txt").write_text(result["prediction"], encoding="utf-8-sig")

    with (output_root / "predictions.jsonl").open("w", encoding="utf-8-sig") as handle:
        for item in predictions:
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")

    print(json.dumps(
        {
            "dataset_root": str(dataset_root),
            "model_id": args.model_id,
            "output_root": str(output_root),
            "samples_run": len(predictions),
        },
        ensure_ascii=False,
        indent=2,
    ))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
