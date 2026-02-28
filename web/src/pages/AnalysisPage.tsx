import { ArrowLeft, Download, Copy, Share2, FileText, Subtitles, Image, ThumbsUp, ThumbsDown, Code } from 'lucide-react'
import { useToast } from '../components/Toast'
import { exportAsJson, exportAsSrt, exportAsPdf, exportAsImage, copyAnalysisText, generateEmbedCode } from '../lib/exports'
import type { AnalysisResult, Scene } from '../App'
import { useState } from 'react'

interface AnalysisPageProps {
    analysis: AnalysisResult
    onBack: () => void
}

function SceneCard({ scene, index }: { scene: Scene; index: number }) {
    return (
        <div className="scene-card" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="scene-card-time">
                <span className="scene-card-timestamp">
                    {scene.startTime} — {scene.endTime}
                </span>
                <div className="scene-card-line" />
            </div>
            <div className="scene-card-content">
                <h4 className="scene-card-title">{scene.title}</h4>
                <p className="scene-card-description">{scene.description}</p>
                <div className="scene-card-tags">
                    {scene.objects?.map((obj, i) => (
                        <span key={i} className="scene-card-tag">{obj}</span>
                    ))}
                    {scene.actions?.map((action, i) => (
                        <span key={`a-${i}`} className="scene-card-tag" style={{
                            color: 'var(--color-secondary)',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderColor: 'rgba(59, 130, 246, 0.15)',
                        }}>
                            {action}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

function AnalysisPage({ analysis, onBack }: AnalysisPageProps) {
    const { addToast } = useToast()
    const [showEmbed, setShowEmbed] = useState(false)
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

    const handleCopy = () => {
        copyAnalysisText(analysis)
        addToast('Analysis copied to clipboard!', 'success')
    }

    const handleJsonDownload = () => {
        exportAsJson(analysis)
        addToast('JSON downloaded!', 'success')
    }

    const handleSrtDownload = () => {
        exportAsSrt(analysis)
        addToast('SRT subtitles downloaded!', 'success')
    }

    const handlePdfExport = () => {
        exportAsPdf(analysis)
    }

    const handleImageExport = async () => {
        await exportAsImage('analysis-content')
        addToast('Image downloaded!', 'success')
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `VidIQ — ${analysis.title}`,
                    text: analysis.summary,
                    url: window.location.href,
                })
            } catch {
                // User cancelled
            }
        } else {
            handleCopy()
        }
    }

    const handleFeedback = (type: 'up' | 'down') => {
        setFeedback(type)
        addToast(
            type === 'up' ? 'Thanks! Glad the analysis was helpful.' : 'Thanks for the feedback. We\'ll improve!',
            'success'
        )
    }

    return (
        <div>
            <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 'var(--space-lg)' }} id="back-btn">
                <ArrowLeft size={16} /> Back
            </button>

            <div id="analysis-content">
                {/* Summary Card */}
                <div className="analysis-summary">
                    <div className="analysis-summary-header">
                        <h2 className="analysis-summary-title">🎬 {analysis.title}</h2>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary btn-sm" onClick={handleCopy} id="copy-btn" title="Copy text">
                                <Copy size={14} /> Copy
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleJsonDownload} id="download-btn" title="Download JSON">
                                <Download size={14} /> JSON
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleSrtDownload} id="srt-btn" title="Download SRT subtitles">
                                <Subtitles size={14} /> SRT
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handlePdfExport} id="pdf-btn" title="Export as PDF">
                                <FileText size={14} /> PDF
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleImageExport} id="image-btn" title="Export as image">
                                <Image size={14} /> Image
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleShare} id="share-btn" title="Share">
                                <Share2 size={14} /> Share
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{analysis.duration}s</div>
                            <div className="stat-label">Duration</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{analysis.totalScenes}</div>
                            <div className="stat-label">Scenes</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{analysis.objectsDetected}</div>
                            <div className="stat-label">Objects</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{analysis.brandsDetected.length}</div>
                            <div className="stat-label">Brands</div>
                        </div>
                    </div>

                    <p className="analysis-summary-text">{analysis.summary}</p>

                    {analysis.brandsDetected.length > 0 && (
                        <div style={{ marginTop: 'var(--space-md)' }}>
                            <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Brands detected:
                            </span>
                            <div className="flex gap-sm" style={{ marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
                                {analysis.brandsDetected.map((brand, i) => (
                                    <span key={i} className="scene-card-tag">{brand}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Scene Timeline */}
                <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>
                    📋 Scene Timeline
                </h3>
                <div className="scene-timeline">
                    {analysis.scenes.map((scene, i) => (
                        <SceneCard key={i} scene={scene} index={i} />
                    ))}
                </div>
            </div>

            {/* Feedback */}
            <div style={{
                marginTop: 'var(--space-xl)',
                padding: 'var(--space-lg)',
                background: 'var(--gradient-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
            }}>
                <p className="text-secondary" style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
                    Was this analysis accurate?
                </p>
                <div className="flex justify-center gap-md">
                    <button
                        className={`btn btn-sm ${feedback === 'up' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleFeedback('up')}
                        disabled={feedback !== null}
                    >
                        <ThumbsUp size={14} /> Yes, accurate
                    </button>
                    <button
                        className={`btn btn-sm ${feedback === 'down' ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => handleFeedback('down')}
                        disabled={feedback !== null}
                    >
                        <ThumbsDown size={14} /> Not quite
                    </button>
                </div>
            </div>

            {/* Embed Code */}
            <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowEmbed(!showEmbed)}>
                    <Code size={14} /> {showEmbed ? 'Hide' : 'Get'} Embed Code
                </button>
                {showEmbed && analysis.analysisId && (
                    <div style={{
                        marginTop: 'var(--space-sm)',
                        padding: 'var(--space-md)',
                        background: 'rgba(10, 22, 40, 0.6)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                    }}>
                        <code className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                            {generateEmbedCode(analysis.analysisId)}
                        </code>
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginTop: 'var(--space-sm)' }}
                            onClick={() => {
                                navigator.clipboard.writeText(generateEmbedCode(analysis.analysisId!))
                                addToast('Embed code copied!', 'success')
                            }}
                        >
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                )}
            </div>

            {/* Model info */}
            <div style={{
                marginTop: 'var(--space-lg)',
                padding: 'var(--space-md)',
                background: 'rgba(10, 22, 40, 0.4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
            }}>
                Model: {analysis.model} • FPS: {analysis.fps} • Status: {analysis.status}
                {analysis.analysisId && ` • ID: ${analysis.analysisId}`}
            </div>
        </div>
    )
}

export default AnalysisPage
