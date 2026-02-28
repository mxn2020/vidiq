import { useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface FileStatus {
    file: File
    status: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error'
    progress: number
    resultId?: string
    error?: string
}

export default function BatchUpload() {
    const [files, setFiles] = useState<FileStatus[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(f => ({
                file: f,
                status: 'pending' as const,
                progress: 0
            }))
            setFiles(prev => [...prev, ...newFiles])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const startProcessing = async () => {
        setIsProcessing(true)

        for (let i = 0; i < files.length; i++) {
            if (files[i].status === 'complete' || files[i].status === 'error') continue

            // 1. Update status to uploading
            setFiles(prev => {
                const updated = [...prev]
                updated[i].status = 'uploading'
                updated[i].progress = 50
                return updated
            })

            try {
                // Simulate processing for now (would integrate with generateUploadUrl -> analyzeVideo)
                await new Promise(r => setTimeout(r, 1000))

                // 2. Analyzing
                setFiles(prev => {
                    const updated = [...prev]
                    updated[i].status = 'analyzing'
                    updated[i].progress = 90
                    return updated
                })

                await new Promise(r => setTimeout(r, 2000))

                // 3. Complete
                setFiles(prev => {
                    const updated = [...prev]
                    updated[i].status = 'complete'
                    updated[i].progress = 100
                    return updated
                })
            } catch {
                setFiles(prev => {
                    const updated = [...prev]
                    updated[i].status = 'error'
                    updated[i].error = 'Processing failed'
                    return updated
                })
            }
        }

        setIsProcessing(false)
    }

    return (
        <div className="card">
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Batch Processing</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
                Upload multiple videos to process them sequentially.
            </p>

            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    if (e.dataTransfer.files) {
                        const newFiles = Array.from(e.dataTransfer.files)
                            .filter(f => f.type.startsWith('video/'))
                            .map(f => ({ file: f, status: 'pending' as const, progress: 0 }))
                        setFiles(prev => [...prev, ...newFiles])
                    }
                }}
                onClick={() => document.getElementById('batch-file-input')?.click()}
                style={{ minHeight: 120, padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}
            >
                <input
                    type="file"
                    id="batch-file-input"
                    multiple
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <Upload size={24} style={{ marginBottom: 12, color: 'var(--color-primary)' }} />
                <div style={{ fontWeight: 600 }}>Drop multiple videos here</div>
            </div>

            {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                    {files.map((item, i) => (
                        <div key={i} className="flex items-center justify-between" style={{
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `3px solid ${item.status === 'complete' ? 'var(--color-success)' :
                                item.status === 'error' ? 'var(--color-danger)' :
                                    item.status === 'pending' ? 'var(--color-border)' : 'var(--color-primary)'
                                }`
                        }}>
                            <div style={{ flex: 1, minWidth: 0, paddingRight: 'var(--space-md)' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.file.name}
                                </div>
                                <div className="text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                                    {(item.file.size / 1024 / 1024).toFixed(1)} MB • {item.status}
                                </div>
                            </div>

                            <div className="flex items-center gap-sm">
                                {item.status === 'pending' && (
                                    <button className="btn-ghost text-muted" onClick={() => removeFile(i)}>
                                        <X size={14} />
                                    </button>
                                )}
                                {(item.status === 'uploading' || item.status === 'analyzing') && (
                                    <Loader size={14} className="spin text-primary" />
                                )}
                                {item.status === 'complete' && <CheckCircle size={14} className="text-success" />}
                                {item.status === 'error' && <AlertCircle size={14} className="text-danger" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                className="btn btn-primary w-full"
                onClick={startProcessing}
                disabled={isProcessing || files.length === 0}
            >
                {isProcessing ? 'Processing Queue...' : `Start Batch Process (${files.length})`}
            </button>
        </div>
    )
}
