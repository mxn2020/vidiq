interface NotFoundPageProps {
    onGoHome: () => void
}

function NotFoundPage({ onGoHome }: NotFoundPageProps) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2 className="empty-state-title">Page Not Found</h2>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
                The page you're looking for doesn't exist.
            </p>
            <button className="btn btn-primary" onClick={onGoHome} id="go-home-btn">
                Go Home
            </button>
        </div>
    )
}

export default NotFoundPage
