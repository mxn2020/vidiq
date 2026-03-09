import { useState } from 'react'
import { Sparkles, Play } from 'lucide-react'
import { useAction, useConvexAuth } from 'convex/react'
import { Input } from '@geenius-ui/react-css'
import { api } from '../../convex/_generated/api'
import { useToast } from '../components/Toast'
import type { AnalysisResult } from '../App'

function ComparisonPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<AnalysisResult[] | null>(null)
    const [models, setModels] = useState<string[]>(['cosmos-reason2-8b', 'kimi-k2.5'])
    const { addToast } = useToast()
    const { isAuthenticated } = useConvexAuth()
    const analyzeMultiModel = useAction(api.nvidia.analyzeMultiModel)

    const handleAnalyze = async (url: string) => {
        if (!isAuthenticated) {
            addToast('Please sign in to run multi-model comparisons.', 'warning')
            return
        }
        if (models.length < 2) {
            addToast('Please select at least 2 models to compare.', 'warning')
            return
        }

        setIsLoading(true)
        try {
            const multiResult = await analyzeMultiModel({
                youtubeUrl: url, // Assuming YouTube URL for comparison for simplicity
                models: models,
            })

            // Map backend results to AnalysisResult format
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedResults = multiResult.map((res: any) => ({
                title: res.title || 'Analysis',
                duration: res.duration || 0,
                fps: res.fps || 4,
                scenes: res.scenes || [],
                totalScenes: res.totalScenes || 0,
                objectsDetected: res.objectsDetected || 0,
                brandsDetected: res.brandsDetected ? JSON.parse(res.brandsDetected) : [],
                summary: res.summary || '',
                model: res.model || '',
                status: (res.status === 'error' ? 'error' : 'complete') as 'complete' | 'error',
                errorMessage: res.errorMessage,
            }))

            setResults(mappedResults)
            addToast('Comparison complete!', 'success')
        } catch (err) {
            console.error('Comparison failed:', err)
            addToast('Comparison failed. Please try again.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleModel = (modelId: string) => {
        setModels(prev =>
            prev.includes(modelId)
                ? prev.filter(m => m !== modelId)
                : [...prev, modelId]
        )
    }

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Running NVIDA models in parallel...</p>
                <div className="flex gap-md" style={{ marginTop: 'var(--space-md)' }}>
                    {models.map(m => (
                        <span key={m} className="scene-card-tag">{m}</span>
                    ))}
                </div>
            </div>
        )
    }

    if (results && results.length > 0) {
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2>🔍 Multi-Model Comparison</h2>
                    <button className="btn btn-ghost" onClick={() => setResults(null)}>
                        New Comparison
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${results.length}, 1fr)`,
                    gap: 'var(--space-lg)',
                    overflowX: 'auto',
                    paddingBottom: 'var(--space-md)'
                }}>
                    {results.map((result, i) => (
                        <div key={i} className="card" style={{ minWidth: 300 }}>
                            <div className="flex items-center justify-between" style={{
                                padding: 'var(--space-sm) var(--space-md)',
                                borderBottom: '1px solid var(--color-border)',
                                margin: '-var(--space-md) -var(--space-md) var(--space-md) -var(--space-md)',
                                background: 'rgba(10, 22, 40, 0.4)'
                            }}>
                                <span className="font-mono text-primary" style={{ fontWeight: 600 }}>{result.model}</span>
                                <span className={result.status === 'complete' ? 'text-success' : 'text-danger'}>
                                    {result.status}
                                </span>
                            </div>

                            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 'var(--space-lg)' }}>
                                {result.summary}
                            </p>

                            <div className="flex gap-md text-sm text-muted font-mono" style={{ marginBottom: 'var(--space-lg)' }}>
                                <span>{result.totalScenes} scenes</span>
                                <span>{result.objectsDetected} objects</span>
                            </div>

                            <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: '0.9rem' }}>Timeline Excerpt</h4>
                            <div className="scene-timeline" style={{ paddingLeft: 'var(--space-sm)' }}>
                                {result.scenes.slice(0, 3).map((scene, j) => (
                                    <div key={j} className="scene-card" style={{ padding: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                        <div className="scene-card-time" style={{ width: 40 }}>
                                            <span style={{ fontSize: '0.7rem' }}>{scene.startTime}</span>
                                        </div>
                                        <div className="scene-card-content" style={{ paddingLeft: 'var(--space-sm)' }}>
                                            <h5 style={{ fontSize: '0.85rem', margin: 0 }}>{scene.title}</h5>
                                        </div>
                                    </div>
                                ))}
                                {result.scenes.length > 3 && (
                                    <div className="text-center text-muted text-sm mt-3">+ {result.scenes.length - 3} more scenes</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>🔍 Multi-Model Comparison</h2>
            <p className="text-center text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
                Run the same video through multiple AI models simultaneously to compare their reasoning.
            </p>

            <div className="settings-section">
                <h3 className="settings-section-title">1. Select Models (<span className={models.length >= 2 ? 'text-success' : 'text-danger'}>{models.length}/4</span>)</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                    {[
                        { id: 'cosmos-reason2-8b', name: 'Cosmos Reason 2 (8B)', desc: 'Physics-aware' },
                        { id: 'kimi-k2.5', name: 'Kimi K2.5', desc: '1T MoE' },
                        { id: 'nemotron-nano-12b', name: 'Nemotron Nano', desc: 'Fast Q&A' },
                        { id: 'llama-3.2-90b', name: 'Llama 3.2 (90B)', desc: 'Heavy visual' }
                    ].map(m => (
                        <div
                            key={m.id}
                            onClick={() => {
                                if (models.includes(m.id)) toggleModel(m.id)
                                else if (models.length < 4) toggleModel(m.id)
                            }}
                            className={`card ${models.includes(m.id) ? 'border-primary bg-primary-alpha' : ''}`}
                            style={{
                                cursor: 'pointer',
                                padding: 'var(--space-sm)',
                                borderColor: models.includes(m.id) ? 'var(--color-primary)' : 'var(--color-border)'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</span>
                                {models.includes(m.id) && <Sparkles size={14} className="text-primary" />}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>{m.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="settings-section">
                <h3 className="settings-section-title">2. Provide Video</h3>
                <div className="flex gap-md">
                    <Input
                        type="url"
                        placeholder="Paste YouTube URL..."
                        style={{ flex: 1 }}
                        id="compare-url-input"
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            const input = document.getElementById('compare-url-input') as HTMLInputElement
                            if (input.value) handleAnalyze(input.value)
                        }}
                        disabled={models.length < 2 || !isAuthenticated}
                    >
                        <Play size={16} /> Run Comparison
                    </button>
                </div>
                {!isAuthenticated && (
                    <p className="text-danger mt-2 text-sm">Sign in to run comparisons.</p>
                )}
            </div>
        </div>
    )
}

export default ComparisonPage
