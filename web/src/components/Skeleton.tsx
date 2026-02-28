
interface SkeletonProps {
    width?: string
    height?: string
    borderRadius?: string
    className?: string
}

function SkeletonBox({ width = '100%', height = '1rem', borderRadius = '4px', className = '' }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius,
                background: 'linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-surface-3, #2a2a3e) 50%, var(--color-surface-2) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-shimmer 1.5s infinite',
            }}
        />
    )
}

export function SkeletonCard() {
    return (
        <div className="card" style={{ padding: 'var(--space-md)' }}>
            <SkeletonBox width="60%" height="1.2rem" />
            <div style={{ marginTop: 'var(--space-sm)' }}>
                <SkeletonBox width="100%" height="0.9rem" />
            </div>
            <div style={{ marginTop: 'var(--space-xs)' }}>
                <SkeletonBox width="80%" height="0.9rem" />
            </div>
        </div>
    )
}

export function SkeletonProfile() {
    return (
        <div className="profile-page">
            <SkeletonBox width="200px" height="2rem" />
            <div className="profile-grid" style={{ marginTop: 'var(--space-md)' }}>
                <div className="profile-card">
                    <SkeletonBox width="120px" height="1.2rem" />
                    <div style={{ marginTop: 'var(--space-sm)' }}>
                        <SkeletonBox width="100%" height="1rem" />
                    </div>
                    <div style={{ marginTop: 'var(--space-xs)' }}>
                        <SkeletonBox width="80%" height="1rem" />
                    </div>
                </div>
                <div className="profile-card">
                    <SkeletonBox width="150px" height="1.2rem" />
                    <div style={{ marginTop: 'var(--space-sm)' }}>
                        <SkeletonBox width="60%" height="2rem" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    )
}

export default SkeletonBox
