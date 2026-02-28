import { useState, useRef, useCallback } from 'react'
import { Upload, Link as LinkIcon } from 'lucide-react'

interface VideoUploadProps {
    onFileSelected: (file: File) => void
    onUrlSubmitted: (url: string) => void
    isLoading: boolean
}

function VideoUpload({ onFileSelected, onUrlSubmitted, isLoading }: VideoUploadProps) {
    const [dragging, setDragging] = useState(false)
    const [url, setUrl] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('video/')) {
            onFileSelected(file)
        }
    }, [onFileSelected])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onFileSelected(file)
        }
    }

    const handleUrlSubmit = () => {
        if (url.trim()) {
            onUrlSubmitted(url.trim())
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUrlSubmit()
        }
    }

    return (
        <div>
            <div
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                id="video-upload-zone"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/mov,video/webm,video/avi,video/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="video-file-input"
                    disabled={isLoading}
                />
                <div className="upload-zone-icon">
                    <Upload size={48} />
                </div>
                <div className="upload-zone-title">
                    {dragging ? 'Drop your video here' : 'Drag & drop a video'}
                </div>
                <div className="upload-zone-subtitle">
                    or click to browse your files
                </div>
                <div className="upload-zone-formats">
                    MP4 • MOV • WebM • AVI — up to 100MB
                </div>
            </div>

            <div className="url-divider">or paste a URL</div>

            <div className="url-input-section">
                <div style={{ position: 'relative', flex: 1 }}>
                    <LinkIcon
                        size={16}
                        style={{
                            position: 'absolute',
                            left: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                        }}
                    />
                    <input
                        className="input"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        style={{ paddingLeft: 40 }}
                        id="youtube-url-input"
                    />
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleUrlSubmit}
                    disabled={isLoading || !url.trim()}
                    id="analyze-url-btn"
                >
                    Analyze
                </button>
            </div>
        </div>
    )
}

export default VideoUpload
