/**
 * Model registry — available AI models for video analysis.
 */

export interface ModelInfo {
    id: string
    name: string
    description: string
    tier: 1 | 2
    strengths: string[]
}

export const MODELS: ModelInfo[] = [
    {
        id: 'nvidia/cosmos-reason2-8b',
        name: 'Cosmos Reason 2 (8B)',
        description: 'Physics-aware video reasoning with timestamps',
        tier: 1,
        strengths: ['timestamps', 'physics', 'video reasoning'],
    },
    {
        id: 'kimi-k2.5',
        name: 'Kimi K2.5',
        description: '1T MoE — handles long, complex videos',
        tier: 1,
        strengths: ['long videos', 'high capacity', 'MoE'],
    },
    {
        id: 'nemotron-nano-12b-v2-vl',
        name: 'Nemotron Nano (12B)',
        description: 'Multi-image and video understanding, Q&A',
        tier: 1,
        strengths: ['multi-image', 'Q&A', 'summarization'],
    },
    {
        id: 'cosmos-nemotron-34b',
        name: 'Cosmos Nemotron (34B)',
        description: 'Text/image/video, informative responses',
        tier: 1,
        strengths: ['multimodal', 'informative', 'detailed'],
    },
    {
        id: 'llama-3.2-90b-vision-instruct',
        name: 'Llama 3.2 (90B Vision)',
        description: 'Strong vision-language reasoning',
        tier: 1,
        strengths: ['vision', 'reasoning', 'high quality'],
    },
    {
        id: 'llama-3.2-11b-vision-instruct',
        name: 'Llama 3.2 (11B Vision)',
        description: 'Lighter weight, faster analysis',
        tier: 1,
        strengths: ['fast', 'efficient', 'vision'],
    },
    {
        id: 'google/gemma-3-27b-it',
        name: 'Gemma 3 (27B)',
        description: 'High-quality reasoning from images',
        tier: 2,
        strengths: ['reasoning', 'quality', 'images'],
    },
    {
        id: 'microsoft/phi-4-multimodal-instruct',
        name: 'Phi-4 Multimodal',
        description: 'Image and audio reasoning',
        tier: 2,
        strengths: ['multimodal', 'audio', 'image'],
    },
]

export function getModelById(id: string): ModelInfo | undefined {
    return MODELS.find((m) => m.id === id)
}

export function getTier1Models(): ModelInfo[] {
    return MODELS.filter((m) => m.tier === 1)
}

export function getDefaultModel(): ModelInfo {
    return MODELS[0]
}
