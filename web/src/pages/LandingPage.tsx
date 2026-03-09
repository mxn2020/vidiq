import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Clock, Eye, Zap, Shield, Globe, Layers } from 'lucide-react'
import { useMutation, useAction, useConvexAuth } from 'convex/react'
import { api } from '../../convex/_generated/api'
import VideoUpload from '../components/VideoUpload'
import { Textarea } from '@geenius-ui/react-css'
import BatchUpload from '../components/BatchUpload'
import LoadingScreen from '../components/LoadingScreen'
import PromptLibrary from '../components/PromptLibrary'
import { useToast } from '../components/Toast'
import type { AnalysisResult } from '../App'

interface LandingPageProps {
    onAnalyze: (result: AnalysisResult) => void
}

function LandingPage({ onAnalyze }: LandingPageProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [customPrompt, setCustomPrompt] = useState('')
    const [showPrompts, setShowPrompts] = useState(false)
    const [isBatchMode, setIsBatchMode] = useState(false)
    const navigate = useNavigate()
    const { addToast } = useToast()
    const { isAuthenticated } = useConvexAuth()

    const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
    const analyzeVideo = useAction(api.nvidia.analyzeVideo)
    const saveAnalysis = useMutation(api.analyses.save)
    const deductCredits = useMutation(api.credits.deduct)

    // ... handleFileUpload and handleUrlSubmit omitted for brevity ...
    // (I will replace the whole return statement instead to be safer)

    const handleFileUpload = async (file: File) => {
        setIsLoading(true)
        try {
            // 1. Deduct credits if authenticated
            if (isAuthenticated) {
                const creditResult = await deductCredits({
                    amount: 1,
                    description: `Analysis: ${file.name}`,
                })
                if (!creditResult.success) {
                    addToast('Not enough credits. Please top up.', 'error')
                    setIsLoading(false)
                    return
                }
            }

            // 2. Upload file to Convex storage
            const uploadUrl = await generateUploadUrl()
            const uploadResult = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            })
            const { storageId } = await uploadResult.json()

            // 3. Run AI analysis
            addToast('Analyzing native video...', 'success')

            const result = await analyzeVideo({
                storageId,
                customPrompt: customPrompt || undefined,
            })

            // 4. Save to database
            const analysisId = await saveAnalysis({
                videoStorageId: storageId,
                title: result.title || file.name,
                duration: result.duration,
                fps: result.fps,
                scenesJson: result.scenesJson,
                totalScenes: result.totalScenes,
                objectsDetected: result.objectsDetected,
                brandsDetected: result.brandsDetected,
                summary: result.summary,
                aiRawResponse: result.aiRawResponse,
                model: result.model,
                status: result.status,
                errorMessage: result.status === 'error' ? result.aiRawResponse : undefined,
            })

            // 5. Build client-side result
            const analysisResult: AnalysisResult = {
                analysisId: analysisId,
                title: result.title || file.name,
                duration: result.duration,
                fps: result.fps,
                scenes: result.scenes,
                totalScenes: result.totalScenes,
                objectsDetected: result.objectsDetected,
                brandsDetected: result.brandsDetected
                    ? JSON.parse(result.brandsDetected)
                    : [],
                summary: result.summary,
                model: result.model,
                status: result.status,
            }

            onAnalyze(analysisResult)
            addToast('Analysis complete!', 'success')
        } catch (err) {
            console.error('Analysis failed:', err)
            addToast('Analysis failed. Please try again.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUrlSubmit = async (url: string) => {
        setIsLoading(true)
        try {
            // 1. Deduct credits if authenticated
            if (isAuthenticated) {
                const creditResult = await deductCredits({
                    amount: 1,
                    description: `YouTube analysis: ${url}`,
                })
                if (!creditResult.success) {
                    addToast('Not enough credits. Please top up.', 'error')
                    setIsLoading(false)
                    return
                }
            }

            // 2. Run AI analysis
            const result = await analyzeVideo({
                youtubeUrl: url,
                customPrompt: customPrompt || undefined,
            })

            // 3. Save to database
            const analysisId = await saveAnalysis({
                youtubeUrl: url,
                title: result.title || `YouTube: ${url}`,
                duration: result.duration,
                fps: result.fps,
                scenesJson: result.scenesJson,
                totalScenes: result.totalScenes,
                objectsDetected: result.objectsDetected,
                brandsDetected: result.brandsDetected,
                summary: result.summary,
                aiRawResponse: result.aiRawResponse,
                model: result.model,
                status: result.status,
            })

            // 4. Build client-side result
            const analysisResult: AnalysisResult = {
                analysisId: analysisId,
                title: result.title || `YouTube: ${url}`,
                duration: result.duration,
                fps: result.fps,
                scenes: result.scenes,
                totalScenes: result.totalScenes,
                objectsDetected: result.objectsDetected,
                brandsDetected: result.brandsDetected
                    ? JSON.parse(result.brandsDetected)
                    : [],
                summary: result.summary,
                model: result.model,
                status: result.status,
            }

            onAnalyze(analysisResult)
            addToast('Analysis complete!', 'success')
        } catch (err) {
            console.error('Analysis failed:', err)
            addToast('Analysis failed. Please try again.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="hero-icon">🎬</div>
                <h1>Timestamped Video Intelligence</h1>
                <p className="hero-tagline">
                    Upload a video or paste a YouTube URL — get a detailed, AI-powered
                    scene-by-scene analysis with timestamps, object detection, and more.
                </p>
            </section>

            {/* Upload */}
            <section style={{ maxWidth: 600, margin: '0 auto' }}>
                <div className="flex items-center justify-center gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
                    <button
                        className={`btn btn-sm ${!isBatchMode ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setIsBatchMode(false)}
                    >
                        Single Video
                    </button>
                    <button
                        className={`btn btn-sm ${isBatchMode ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setIsBatchMode(true)}
                    >
                        <Layers size={14} /> Batch Process
                    </button>
                </div>

                {!isBatchMode ? (
                    <VideoUpload
                        onFileSelected={handleFileUpload}
                        onUrlSubmitted={handleUrlSubmit}
                        isLoading={isLoading}
                    />
                ) : (
                    <BatchUpload />
                )}

                {/* Custom Prompt */}
                {!isBatchMode && (
                    <div style={{ marginTop: 'var(--space-lg)' }}>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setShowPrompts(!showPrompts)}
                            style={{ marginBottom: 'var(--space-sm)' }}
                            id="toggle-prompt-btn"
                        >
                            <Sparkles size={14} />
                            {showPrompts ? 'Hide Custom Prompt' : 'Add Custom Prompt (optional)'}
                        </button>

                        {showPrompts && (
                            <div style={{ animation: 'slideInUp 0.2s ease' }}>
                                <Textarea
                                    placeholder='e.g. "Focus on the cooking techniques" or "Track the red car"'
                                    value={customPrompt}
                                    onChange={(e: any) => setCustomPrompt(e.target.value)}
                                    id="custom-prompt-input"
                                    rows={3}
                                />
                                <PromptLibrary onSelect={(prompt) => setCustomPrompt(prompt)} />
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Features */}
            <section className="feature-grid" style={{ marginTop: 'var(--space-3xl)' }}>
                <div className="feature-card">
                    <div className="feature-icon"><Clock size={32} style={{ color: 'var(--color-primary)' }} /></div>
                    <h3 className="feature-title">Precise Timestamps</h3>
                    <p className="feature-description">
                        Every scene identified with exact MM:SS timestamps.
                        Know exactly when key moments happen.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Eye size={32} style={{ color: 'var(--color-accent)' }} /></div>
                    <h3 className="feature-title">Object & Brand Detection</h3>
                    <p className="feature-description">
                        AI identifies objects, brands, logos, and text
                        visible throughout the video.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Sparkles size={32} style={{ color: 'var(--color-secondary)' }} /></div>
                    <h3 className="feature-title">Scene Narratives</h3>
                    <p className="feature-description">
                        Rich, descriptive narratives for each scene —
                        not just captions, but real contextual understanding.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Zap size={32} style={{ color: 'var(--color-warning)' }} /></div>
                    <h3 className="feature-title">Physics-Aware Reasoning</h3>
                    <p className="feature-description">
                        Powered by NVIDIA Cosmos — the AI understands
                        what is physically happening, not just what's visible.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Globe size={32} style={{ color: 'var(--color-primary)' }} /></div>
                    <h3 className="feature-title">YouTube & File Upload</h3>
                    <p className="feature-description">
                        Upload local video files or paste any YouTube URL.
                        Both analyzed with the same powerful pipeline.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Shield size={32} style={{ color: 'var(--color-success)' }} /></div>
                    <h3 className="feature-title">Privacy First</h3>
                    <p className="feature-description">
                        Videos auto-deleted after 30 days. No facial recognition
                        storage. GDPR compliant.
                    </p>
                </div>
            </section>

            {/* Auth CTA */}
            {!isAuthenticated && (
                <section className="text-center" style={{ marginTop: 'var(--space-2xl)' }}>
                    <p className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                        Sign in to save your analyses and track your history.
                    </p>
                    <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                        Sign In — It's Free
                    </button>
                </section>
            )}
        </div>
    )
}

export default LandingPage
