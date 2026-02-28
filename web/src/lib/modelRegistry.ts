export interface ModelInfo {
    id: string
    name: string
    provider: 'nvidia' | 'openai' | 'anthropic' | 'xai' | 'google' | 'meta' | 'mistral' | 'stability'
    description: string
    contextWindow: number
    features: ('vision' | 'tools' | 'json' | 'video' | 'audio')[]
}

export const TEXT_MODELS: ModelInfo[] = [
    { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'meta', description: 'Strong general purpose', contextWindow: 128000, features: ['tools', 'json'] },
    { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'meta', description: 'Fast, efficient operations', contextWindow: 128000, features: ['tools', 'json'] },
    { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2', provider: 'mistral', description: 'Advanced reasoning', contextWindow: 128000, features: ['tools', 'json'] },
]

export const VISION_MODELS: ModelInfo[] = [
    { id: 'meta/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', provider: 'meta', description: 'State of the art multimodal reasoning', contextWindow: 128000, features: ['vision'] },
]

export const IMAGE_MODELS: ModelInfo[] = [
    { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL 1.0', provider: 'stability', description: 'High-quality image generation', contextWindow: 0, features: [] },
]

export const AUDIO_MODELS: ModelInfo[] = [
    { id: 'nvidia/parakeet-rnnt-1.1b', name: 'Parakeet ASR', provider: 'nvidia', description: 'English Automatic Speech Recognition', contextWindow: 0, features: ['audio'] }
]

export const VIDEO_MODELS: ModelInfo[] = [
    { id: 'nvidia/neva-22b', name: 'Neva 22B Video', provider: 'nvidia', description: 'Video analysis', contextWindow: 0, features: ['video'] }
]
