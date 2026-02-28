import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * NVIDIA Vision API — Analyze video frames.
 *
 * Pipeline modes:
 *   "demo"         → Returns mock data (no API key needed)
 *   "single-model" → One API call with configured model
 *
 * When NVIDIA_API_KEY is set, uses real API. Otherwise falls back to demo.
 */

// ─── Real NVIDIA API call ─────────────────────────────────────────

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert video analyst. Analyze the provided video frames and describe the video content.

Add timestamps in mm:ss format for each scene or significant change.

For each scene, provide:
1. Timestamp range (start-end in mm:ss)
2. Scene title (short, descriptive)
3. Detailed description of what's happening
4. Objects detected
5. Any brand logos or text visible
6. Actions or movements occurring

Return your analysis as a JSON object with this exact structure:
{
  "scenes": [
    {
      "startTime": "00:00",
      "endTime": "00:05",
      "title": "Scene Title",
      "description": "Detailed description of the scene.",
      "objects": ["object1", "object2"],
      "actions": ["action1", "action2"]
    }
  ],
  "summary": "Overall video summary.",
  "brandsDetected": ["Brand A"]
}

IMPORTANT: Return ONLY valid JSON. No markdown code fences. No explanatory text outside the JSON.`;

interface NvidiaScene {
    startTime: string;
    endTime: string;
    title: string;
    description: string;
    objects?: string[];
    actions?: string[];
}

interface NvidiaAnalysis {
    scenes: NvidiaScene[];
    summary: string;
    brandsDetected?: string[];
}

function sanitizeJsonResponse(raw: string): string {
    let cleaned = raw.trim();
    // Remove markdown code fences
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    // Remove any <think>...</think> blocks
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, "");
    cleaned = cleaned.trim();
    return cleaned;
}

function parseAnalysisResponse(raw: string): NvidiaAnalysis {
    const cleaned = sanitizeJsonResponse(raw);

    try {
        return JSON.parse(cleaned);
    } catch {
        // Try to extract JSON from the response
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch {
                // Fall through
            }
        }
        throw new Error(`Failed to parse AI response as JSON: ${cleaned.substring(0, 200)}...`);
    }
}

async function callNvidiaApi(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    base64Frames?: string[],
): Promise<{ content: string; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
        { role: "system", content: systemPrompt },
    ];

    if (base64Frames && base64Frames.length > 0) {
        // Multi-modal: text + images
        const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
            { type: "text", text: userPrompt },
            ...base64Frames.map((frame) => ({
                type: "image_url" as const,
                image_url: { url: `data:image/jpeg;base64,${frame}` },
            })),
        ];
        messages.push({ role: "user", content });
    } else {
        messages.push({ role: "user", content: userPrompt });
    }

    const startMs = Date.now();

    const response = await fetch(NVIDIA_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 4096,
        }),
    });

    const durationMs = Date.now() - startMs;

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return { content, usage, ...{ durationMs, httpStatus: response.status } as Record<string, unknown> };
}

// ─── Demo mode mock scenes ────────────────────────────────────────

const DEMO_SCENES: NvidiaScene[] = [
    { startTime: "00:00", endTime: "00:03", title: "Opening Scene", description: "The video opens with an establishing shot. The camera pans across the scene, revealing the setting and primary subjects.", objects: ["background", "lighting", "camera movement"], actions: ["panning shot", "scene establishment"] },
    { startTime: "00:03", endTime: "00:08", title: "Main Action", description: "The primary action takes place. Subjects interact with each other and their environment, demonstrating the main theme of the video.", objects: ["subjects", "environment", "props"], actions: ["interaction", "movement", "dialogue"] },
    { startTime: "00:08", endTime: "00:14", title: "Detail Shot", description: "Close-up shots reveal important details. Textures, expressions, and fine movements become visible, adding depth to the narrative.", objects: ["close-up details", "textures", "expressions"], actions: ["zooming", "focusing", "revealing"] },
    { startTime: "00:14", endTime: "00:20", title: "Dynamic Sequence", description: "A fast-paced sequence with rapid cuts and dynamic camera movements. Energy builds as the action intensifies.", objects: ["motion blur", "quick cuts", "dynamic framing"], actions: ["rapid movement", "action sequence", "energy build"] },
    { startTime: "00:20", endTime: "00:28", title: "Perspective Shift", description: "The viewpoint changes dramatically. Aerial or alternative angles provide new context and spatial awareness of the scene.", objects: ["aerial view", "wide angle", "new perspective"], actions: ["perspective change", "scene overview", "spatial context"] },
    { startTime: "00:28", endTime: "00:35", title: "Resolution", description: "The narrative arc resolves. Key subjects reach their destination or complete their activity. Emotional tone shifts toward conclusion.", objects: ["conclusion elements", "resolution cues"], actions: ["completion", "resolution", "emotional shift"] },
    { startTime: "00:35", endTime: "00:44", title: "Closing Scene", description: "Wide-angle closing shots reveal the full scope of the environment. The camera pulls back, providing a final panoramic view before the video ends.", objects: ["panoramic view", "landscape", "final framing"], actions: ["pull-back shot", "closing panorama", "end sequence"] },
];

// ─── Log AI request to database ───────────────────────────────────

export const logAiRequest = internalMutation({
    args: {
        requestId: v.string(),
        model: v.string(),
        caller: v.string(),
        durationMs: v.number(),
        systemPrompt: v.string(),
        userPromptText: v.string(),
        hasVideo: v.boolean(),
        videoSizeBytes: v.optional(v.number()),
        temperature: v.number(),
        maxTokens: v.number(),
        requestBodySize: v.number(),
        status: v.string(),
        httpStatus: v.number(),
        responseContent: v.string(),
        responseSize: v.number(),
        finishReason: v.optional(v.string()),
        promptTokens: v.optional(v.number()),
        completionTokens: v.optional(v.number()),
        totalTokens: v.optional(v.number()),
        inputCostUsd: v.optional(v.number()),
        outputCostUsd: v.optional(v.number()),
        totalCostUsd: v.optional(v.number()),
        errorMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("aiLogs", {
            ...args,
            timestamp: Date.now(),
        });
    },
});

// ─── Main analysis action ─────────────────────────────────────────

export const analyzeVideo = action({
    args: {
        storageId: v.optional(v.id("_storage")),
        youtubeUrl: v.optional(v.string()),
        model: v.optional(v.string()),
        customPrompt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const model = args.model ?? "nvidia/cosmos-reason2-8b";
        const apiKey = process.env.NVIDIA_API_KEY;

        // ── Real API mode ───────────────────────────
        if (apiKey) {
            const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const startMs = Date.now();

            let userPrompt = "Analyze this video and provide a scene-by-scene breakdown with timestamps.";
            if (args.customPrompt) {
                userPrompt += `\n\nAdditional instructions: ${args.customPrompt}`;
            }
            if (args.youtubeUrl) {
                userPrompt += `\n\nVideo URL: ${args.youtubeUrl}`;
            }

            try {
                const result = await callNvidiaApi(
                    apiKey,
                    model,
                    SYSTEM_PROMPT,
                    userPrompt,
                    // TODO: Extract frames from video storage if storageId provided
                    undefined,
                );

                const parsed = parseAnalysisResponse(result.content);
                const durationMs = Date.now() - startMs;

                // Log the request
                await ctx.runMutation(internal.nvidia.logAiRequest, {
                    requestId,
                    model,
                    caller: "analyzeVideo",
                    durationMs,
                    systemPrompt: SYSTEM_PROMPT.substring(0, 500),
                    userPromptText: userPrompt.substring(0, 500),
                    hasVideo: !!args.storageId,
                    temperature: 0.2,
                    maxTokens: 4096,
                    requestBodySize: userPrompt.length,
                    status: "success",
                    httpStatus: 200,
                    responseContent: result.content.substring(0, 2000),
                    responseSize: result.content.length,
                    promptTokens: result.usage.prompt_tokens,
                    completionTokens: result.usage.completion_tokens,
                    totalTokens: result.usage.total_tokens,
                });

                const scenes = parsed.scenes || [];
                const objectsDetected = scenes.reduce((sum, s) => sum + (s.objects?.length ?? 0), 0);

                return {
                    title: args.youtubeUrl ? `YouTube Analysis` : "Video Analysis",
                    duration: estimateDuration(scenes),
                    fps: 4,
                    scenes,
                    scenesJson: JSON.stringify(scenes),
                    totalScenes: scenes.length,
                    objectsDetected,
                    brandsDetected: parsed.brandsDetected && parsed.brandsDetected.length > 0
                        ? JSON.stringify(parsed.brandsDetected)
                        : undefined,
                    summary: parsed.summary || "Analysis complete.",
                    aiRawResponse: result.content,
                    model,
                    status: "complete" as const,
                };
            } catch (error) {
                const durationMs = Date.now() - startMs;
                const errorMsg = error instanceof Error ? error.message : String(error);

                // Log the failed request
                await ctx.runMutation(internal.nvidia.logAiRequest, {
                    requestId,
                    model,
                    caller: "analyzeVideo",
                    durationMs,
                    systemPrompt: SYSTEM_PROMPT.substring(0, 500),
                    userPromptText: userPrompt.substring(0, 500),
                    hasVideo: !!args.storageId,
                    temperature: 0.2,
                    maxTokens: 4096,
                    requestBodySize: userPrompt.length,
                    status: "error",
                    httpStatus: 0,
                    responseContent: "",
                    responseSize: 0,
                    errorMessage: errorMsg,
                });

                return {
                    title: "Analysis Failed",
                    duration: 0,
                    fps: 4,
                    scenes: [],
                    scenesJson: "[]",
                    totalScenes: 0,
                    objectsDetected: 0,
                    summary: `Analysis failed: ${errorMsg}`,
                    aiRawResponse: errorMsg,
                    model,
                    status: "error" as const,
                    errorMessage: errorMsg,
                };
            }
        }

        // ── Demo mode ───────────────────────────────
        // Simulate processing delay
        await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000));

        const scenesCount = 5 + Math.floor(Math.random() * 3);
        const scenes = DEMO_SCENES.slice(0, scenesCount);
        const objectsDetected = scenes.reduce((sum, s) => sum + (s.objects?.length ?? 0), 0);
        const brandsDetected = Math.random() > 0.5
            ? ["Nike", "GoPro"]
            : [];

        const duration = 44;
        const summary = `[Demo Mode] This video contains ${scenesCount} distinct scenes across ${duration} seconds. ` +
            `The AI detected ${objectsDetected} objects` +
            (brandsDetected.length > 0 ? ` and ${brandsDetected.length} brand references` : "") +
            `. ` +
            (args.customPrompt
                ? `Analysis was guided by the custom prompt: "${args.customPrompt}".`
                : `Standard comprehensive analysis was performed.`) +
            ` Connect your NVIDIA API key for real results.`;

        return {
            title: args.youtubeUrl ? `YouTube Analysis` : "Video Analysis",
            duration,
            fps: 4,
            scenes,
            scenesJson: JSON.stringify(scenes),
            totalScenes: scenesCount,
            objectsDetected,
            brandsDetected: brandsDetected.length > 0
                ? JSON.stringify(brandsDetected)
                : undefined,
            summary,
            aiRawResponse: JSON.stringify({ mode: "demo", scenes, summary }),
            model: "demo",
            status: "complete" as const,
        };
    },
});

/**
 * Multi-model comparison — run the same video through multiple models.
 */
export const analyzeMultiModel = action({
    args: {
        storageId: v.optional(v.id("_storage")),
        youtubeUrl: v.optional(v.string()),
        models: v.array(v.string()),
        customPrompt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const results = await Promise.all(
            args.models.map((model) =>
                ctx.runAction(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    "nvidia:analyzeVideo" as any,
                    {
                        storageId: args.storageId,
                        youtubeUrl: args.youtubeUrl,
                        model,
                        customPrompt: args.customPrompt,
                    },
                ),
            ),
        );
        return results;
    },
});

// Helper to estimate duration from scene timestamps
function estimateDuration(scenes: NvidiaScene[]): number {
    if (scenes.length === 0) return 0;
    const last = scenes[scenes.length - 1];
    const parts = last.endTime.split(":");
    if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
}
