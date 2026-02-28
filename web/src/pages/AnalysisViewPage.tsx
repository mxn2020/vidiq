import { useQuery } from 'convex/react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import AnalysisPage from './AnalysisPage'
import type { Id } from '../../convex/_generated/dataModel'
import type { AnalysisResult } from '../App'

/**
 * View a persisted analysis from the database by ID.
 */
function AnalysisViewPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const analysis = useQuery(
        api.analyses.getById,
        id ? { id: id as Id<"analyses"> } : "skip",
    )

    if (analysis === undefined) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Loading analysis…</p>
            </div>
        )
    }

    if (analysis === null) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-title">Analysis Not Found</div>
                <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
                    This analysis may have been deleted or doesn't exist.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Go Home
                </button>
            </div>
        )
    }

    // Convert DB record to AnalysisResult
    const scenes = analysis.scenesJson ? JSON.parse(analysis.scenesJson) : []
    const brandsDetected = analysis.brandsDetected
        ? JSON.parse(analysis.brandsDetected)
        : []

    const result: AnalysisResult = {
        analysisId: analysis._id,
        title: analysis.title,
        duration: analysis.duration,
        fps: analysis.fps,
        scenes,
        totalScenes: analysis.totalScenes,
        objectsDetected: analysis.objectsDetected,
        brandsDetected,
        summary: analysis.summary,
        model: analysis.model,
        status: analysis.status === 'complete' ? 'complete' : 'error',
        errorMessage: analysis.errorMessage,
    }

    return (
        <AnalysisPage
            analysis={result}
            onBack={() => navigate('/history')}
        />
    )
}

export default AnalysisViewPage
