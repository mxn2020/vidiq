import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { Trash2, Clock, Eye, Film } from 'lucide-react'
import { useToast } from '../components/Toast'
import type { Id } from '../../convex/_generated/dataModel'

function HistoryPage() {
    const analyses = useQuery(api.analyses.getByUser) ?? []
    const removeAnalysis = useMutation(api.analyses.remove)
    const navigate = useNavigate()
    const { addToast } = useToast()

    const handleDelete = async (id: Id<"analyses">, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Delete this analysis? This cannot be undone.')) return
        await removeAnalysis({ id })
        addToast('Analysis deleted.', 'success')
    }

    const handleView = (id: string) => {
        navigate(`/analysis/${id}`)
    }

    if (analyses.length === 0) {
        return (
            <div>
                <h2 style={{ marginBottom: 'var(--space-xl)' }}>📚 Analysis History</h2>
                <div className="empty-state">
                    <div className="empty-state-icon">🎬</div>
                    <div className="empty-state-title">No analyses yet</div>
                    <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
                        Upload a video or paste a YouTube URL to get started.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Analyze a Video
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
                <h2>📚 Analysis History</h2>
                <span className="text-muted font-mono" style={{ fontSize: '0.85rem' }}>
                    {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {analyses.map((analysis) => {
                    const scenes = analysis.scenesJson
                        ? JSON.parse(analysis.scenesJson)
                        : []

                    return (
                        <div
                            key={analysis._id}
                            className="card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleView(analysis._id)}
                        >
                            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '1.05rem',
                                        fontWeight: 600,
                                        marginBottom: 'var(--space-xs)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {analysis.title}
                                    </h3>
                                    <div className="flex gap-md" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                                        <span className="flex items-center gap-sm">
                                            <Clock size={12} /> {analysis.duration}s
                                        </span>
                                        <span className="flex items-center gap-sm">
                                            <Film size={12} /> {scenes.length} scenes
                                        </span>
                                        <span className="flex items-center gap-sm">
                                            <Eye size={12} /> {analysis.objectsDetected} objects
                                        </span>
                                        <span className="font-mono">
                                            {analysis.model}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-sm">
                                    <span className={`scene-card-tag ${analysis.status === 'complete'
                                        ? ''
                                        : 'text-danger'
                                        }`}>
                                        {analysis.status}
                                    </span>
                                    <span className="text-muted font-mono" style={{ fontSize: '0.75rem' }}>
                                        {new Date(analysis.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={(e) => handleDelete(analysis._id, e)}
                                        aria-label="Delete"
                                        style={{ color: 'var(--color-text-muted)' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default HistoryPage
