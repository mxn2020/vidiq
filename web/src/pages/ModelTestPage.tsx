import { useState, useRef } from 'react'
import { useAction, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { FlaskConical, MessageSquare, Video, Image, Upload, Loader2, Play } from 'lucide-react'
import { TEXT_MODELS, VIDEO_MODELS } from '../lib/modelRegistry'
import { Select, Textarea } from '@geenius-ui/react-css'
import { extractFrames } from '../lib/videoUtils'

const TABS = [
    { id: 'text', icon: <MessageSquare size={18} />, label: 'Text' },
    { id: 'videotext', icon: <Video size={18} />, label: 'Video (Native)' },
    { id: 'videoframes', icon: <Image size={18} />, label: 'Video (Frames)' },
]

export default function ModelTestPage() {
    const [activeTab, setActiveTab] = useState('text')

    // Model testing states
    const [prompt, setPrompt] = useState('Write a short haiku about coding.')
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Frame extraction config
    const [frameCount, setFrameCount] = useState(5)

    // Results state
    const [isRunning, setIsRunning] = useState(false)
    const [resultData, setResultData] = useState<any>(null)
    const [duration, setDuration] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)

    // Selection state
    const [selectedModel, setSelectedModel] = useState(TEXT_MODELS[0].id)

    // Actions
    const callModel = useAction(api.nvidia.callModel)
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl)

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        setResultData(null)
        setError(null)
        setFile(null)
        const newModels = getModels(tabId)
        if (newModels.length > 0) setSelectedModel(newModels[0].id)
    }

    const getModels = (tabId: string) => {
        switch (tabId) {
            case 'text': return TEXT_MODELS
            case 'videotext':
            case 'videoframes': return VIDEO_MODELS
            default: return []
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) setFile(f)
    }

    const isVideoTab = ['videotext', 'videoframes'].includes(activeTab)

    const runTest = async () => {
        setIsRunning(true)
        setError(null)
        setResultData(null)
        const start = Date.now()

        try {
            if (activeTab === 'text') {
                const res = await callModel({
                    model: selectedModel,
                    messages: [{ role: 'user', content: prompt }]
                })
                setResultData({ type: 'text', content: res, method: 'text' })
            }
            else if (activeTab === 'videotext') {
                if (!file) throw new Error("Please upload a video file.")

                // Upload file to Convex storage → native video_url
                const uploadUrl = await generateUploadUrl()
                const uploadResult = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': file.type },
                    body: file,
                })
                const { storageId } = await uploadResult.json()

                const res = await callModel({
                    model: selectedModel,
                    storageId: storageId,
                    prompt: prompt
                })
                setResultData({ type: 'text', content: res, method: 'native-video' })
            }
            else if (activeTab === 'videoframes') {
                if (!file) throw new Error("Please upload a video file.")

                // Extract frames locally then send as base64 images
                const frames = await extractFrames(file, frameCount)

                const content: any[] = [{ type: 'text', text: prompt }]
                for (const frame of frames) {
                    content.push({
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${frame}` }
                    })
                }

                const res = await callModel({
                    model: selectedModel,
                    messages: [{ role: 'user', content }]
                })
                setResultData({
                    type: 'text',
                    content: res,
                    method: 'frame-extraction',
                    framesUsed: frames.length
                })
            }
        } catch (err: any) {
            setError(err.message || String(err))
        } finally {
            setDuration(Date.now() - start)
            setIsRunning(false)
        }
    }

    const models = getModels(activeTab)

    return (
        <div className="model-test-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-md)' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1><FlaskConical size={28} style={{ verticalAlign: 'middle', marginRight: '8px' }} />VidIQ Models Lab</h1>
                <p style={{ color: 'var(--color-smoke-gray)', marginTop: '8px' }}>
                    Interactive testing environment for Text and Video analysis models.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`btn ${activeTab === tab.id ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => handleTabChange(tab.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.5fr)', gap: '24px', marginTop: '24px' }}>
                {/* Configuration Panel */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Configuration</h3>

                    {/* Method info badge */}
                    {isVideoTab && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            backgroundColor: activeTab === 'videotext'
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(59, 130, 246, 0.1)',
                            color: activeTab === 'videotext'
                                ? '#22c55e'
                                : '#3b82f6',
                            border: `1px solid ${activeTab === 'videotext' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                        }}>
                            {activeTab === 'videotext'
                                ? '🎬 Native Video — Sends the full video URL directly to the AI model for processing.'
                                : '🖼️ Frame Extraction — Extracts individual frames from the video and sends them as images to the AI model.'}
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <Select
                            label="Select Model"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            {models.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                            ))}
                        </Select>
                    </div>

                    {isVideoTab && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-smoke-gray)' }}>Upload Video</label>
                            <div
                                style={{
                                    border: '2px dashed var(--color-border)',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--color-surface)'
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {file ? (
                                    <div style={{ color: 'var(--color-accent)' }}><Upload size={32} style={{ margin: '0 auto 8px' }} /> {file.name}</div>
                                ) : (
                                    <div style={{ color: 'var(--color-smoke-gray)' }}>
                                        <Upload size={32} style={{ margin: '0 auto 8px' }} />
                                        Click to upload video
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                                accept="video/*"
                            />
                        </div>
                    )}

                    {/* Frame count selector — only for frame extraction mode */}
                    {activeTab === 'videoframes' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-smoke-gray)' }}>
                                Frames to Extract: <strong style={{ color: 'var(--color-text)' }}>{frameCount}</strong>
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={10}
                                value={frameCount}
                                onChange={e => setFrameCount(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-smoke-gray)', marginTop: '4px' }}>
                                <span>1</span>
                                <span>5</span>
                                <span>10</span>
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <Textarea
                            label="Prompt"
                            rows={4}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Enter your prompt here..."
                        />
                    </div>

                    <button
                        className="btn btn--primary"
                        style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                        onClick={runTest}
                        disabled={isRunning || (!file && isVideoTab)}
                    >
                        {isRunning ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><Play size={18} /> Run Test</>}
                    </button>

                    {error && (
                        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Panel */}
                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Output</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {resultData?.method && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    backgroundColor: resultData.method === 'native-video'
                                        ? 'rgba(34, 197, 94, 0.15)'
                                        : resultData.method === 'frame-extraction'
                                            ? 'rgba(59, 130, 246, 0.15)'
                                            : 'rgba(168, 85, 247, 0.15)',
                                    color: resultData.method === 'native-video'
                                        ? '#22c55e'
                                        : resultData.method === 'frame-extraction'
                                            ? '#3b82f6'
                                            : '#a855f7',
                                }}>
                                    {resultData.method === 'native-video' && '🎬 Native Video'}
                                    {resultData.method === 'frame-extraction' && `🖼️ ${resultData.framesUsed} Frames`}
                                    {resultData.method === 'text' && '💬 Text'}
                                </span>
                            )}
                            {resultData && <span style={{ fontSize: '0.85rem', color: 'var(--color-smoke-gray)', background: 'var(--color-surface)', padding: '4px 8px', borderRadius: '4px' }}>{(duration / 1000).toFixed(2)}s latency</span>}
                        </div>
                    </div>

                    <div style={{
                        flex: 1,
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: '8px',
                        padding: '16px',
                        overflowY: 'auto',
                        minHeight: '300px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        {!resultData && !isRunning && (
                            <div style={{ margin: 'auto', color: 'var(--color-smoke-gray)', textAlign: 'center' }}>
                                <FlaskConical size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                                Run a test to see output here.
                            </div>
                        )}

                        {isRunning && (
                            <div style={{ margin: 'auto', color: 'var(--color-accent)', textAlign: 'center' }}>
                                <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 16px' }} />
                                {activeTab === 'videoframes' ? 'Extracting frames & waiting for model...' : 'Waiting for model response...'}
                            </div>
                        )}

                        {resultData?.type === 'text' && (
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, width: '100%' }}>{resultData.content}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
