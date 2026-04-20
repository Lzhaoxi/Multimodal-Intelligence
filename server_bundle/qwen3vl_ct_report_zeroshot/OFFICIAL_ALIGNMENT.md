# Official Qwen3-VL Alignment

This bundle was aligned against the official local copy:

- `D:/Multimodel-Intelligence/external/Qwen3-VL`

and the official upstream repository:

- [QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)

## What was reused conceptually

The zero-shot inference script follows the official Qwen3-VL inference path:

1. `AutoModelForImageTextToText.from_pretrained(...)`
2. `AutoProcessor.from_pretrained(...)`
3. `qwen_vl_utils.process_vision_info(...)`
4. Passing local frame paths as a `video` input

This is consistent with the official README examples for:

- transformers inference
- frame-list video input
- Qwen3-VL multimodal generation

## Why this bundle does not vendor the whole official repo

The official repo is much larger than needed for this project.

For first-round zero-shot inference on server, the minimum required parts are:

- the official runtime dependencies
- the official input style
- our project-specific dataset adaptation

So this bundle keeps:

- our rendered CT datasets
- our prompt
- our wrapper inference script

and relies on pip-installed:

- `transformers`
- `qwen-vl-utils`

instead of copying the full official source tree into the runtime package.

## Project-specific adaptation

The official code is image/video general-purpose. This bundle adds:

- rendered CT frame datasets
- structured Chinese report prompt
- sample manifest reading
- result export per sample
