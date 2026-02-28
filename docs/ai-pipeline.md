# 🤖 VidIQ — AI Pipeline Architecture

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AI ANALYSIS PIPELINE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Video Input                                                │
│     │                                                       │
│     ▼                                                       │
│  Frame Extraction (4 FPS)                                   │
│     │                                                       │
│     ▼                                                       │
│  Frame Batching (groups of 8–16)                            │
│     │                                                       │
│     ▼                                                       │
│  NVIDIA Vision API                                          │
│  ┌──────────────────────────┐                               │
│  │  System Prompt:          │                               │
│  │  "Describe the video.    │                               │
│  │   Add timestamps in      │                               │
│  │   mm:ss format."         │                               │
│  │                          │                               │
│  │  <think> reasoning </think>                              │
│  │  Structured output       │                               │
│  └──────────────────────────┘                               │
│     │                                                       │
│     ▼                                                       │
│  Response Parser                                            │
│  ├→ Extract scene boundaries                                │
│  ├→ Parse timestamps                                        │
│  ├→ Identify objects & brands                               │
│  └→ Generate structured JSON                                │
│     │                                                       │
│     ▼                                                       │
│  Store Analysis in Convex DB                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Model Tiers

### Tier 1: Core Video/Image Understanding

| Model                         | Best For                                    |
|-------------------------------|---------------------------------------------|
| cosmos-reason2-8b             | Physics-aware video reasoning + timestamps  |
| kimi-k2.5                     | 1T MoE — long, complex videos              |
| nemotron-nano-12b-v2-vl       | Multi-image/video understanding, Q&A        |
| cosmos-nemotron-34b           | Text/image/video, informative responses     |
| qwen3.5-397b-a17b            | Vision, chat, RAG — massive 400B VLM        |
| llama-3.2-90b-vision-instruct| Strong vision-language reasoning             |
| llama-3.2-11b-vision-instruct| Lighter weight, faster passes                |

### Tier 2: Supplementary Models

| Model                         | Use Case                                    |
|-------------------------------|---------------------------------------------|
| mistral-large-3               | MoE VLM — agentic, image-to-text           |
| google/gemma-3-27b-it         | High-quality reasoning from images          |
| microsoft/phi-4-multimodal    | Image and audio reasoning                   |

## Pipeline Modes

### Mode: "demo" (Default)
- No API key needed
- Generates mock analysis with realistic structure
- Random scene count, objects, brands
- Instant results for development/testing

### Mode: "single-model"
- One API call per video
- Uses cosmos-reason2-8b by default
- Fastest real analysis

### Mode: "multi-model"
- Runs analysis through 2+ models
- Compares results side-by-side
- Higher accuracy, higher cost

## Prompt Design

### System Prompt
```
You are an expert video analyst. Analyze the provided video frames and describe the video content.

Add timestamps in mm:ss format for each scene or significant change.

For each scene, provide:
1. Timestamp range (start-end in mm:ss)
2. Scene title (short, descriptive)
3. Detailed description of what's happening
4. Objects detected
5. Any brand logos or text visible
6. Actions or movements occurring

Format your analysis as structured JSON.
```

### Custom Prompts
Users can append custom instructions:
- "Focus on the cooking techniques"
- "Identify all sports equipment"
- "Track the red car throughout the video"
- "List all spoken text visible in the video"

## Output Parsing

The AI response is parsed through multiple stages:

1. **JSON extraction** — Find and parse the JSON block from the response
2. **Schema validation** — Verify required fields exist
3. **Timestamp normalization** — Convert all timestamps to mm:ss format
4. **Scene merging** — Merge overlapping or very short scenes
5. **Deduplication** — Remove duplicate objects/brands across scenes
6. **Summary generation** — Create an overall video summary from scene descriptions

## Error Handling

- **Malformed JSON** — Retry with simplified prompt (up to 3 attempts)
- **Rate limiting** — Exponential backoff with jitter
- **Model unavailable** — Fallback to next model in tier
- **Empty response** — Return error with helpful message
- **Timeout** — 120-second timeout per analysis, return partial results if available
