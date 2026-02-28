import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Link } from 'react-router-dom'

function AdminPage() {
    const users = useQuery(api.users.listAll, {}) ?? []
    const analyses = useQuery(api.analyses.getRecent, {}) ?? []
    const aiLogs = useQuery(api.aiLogs.list, {}) ?? []

    const totalCost = aiLogs.reduce((sum, log) => sum + (log.totalCostUsd ?? 0), 0)
    const todayLogs = aiLogs.filter(
        (l) => l.timestamp && new Date(l.timestamp).toDateString() === new Date().toDateString()
    )

    return (
        <div>
            <h2 style={{ marginBottom: 'var(--space-xl)' }}>🛡️ Admin Dashboard</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{analyses.length}</div>
                    <div className="stat-label">Total Analyses</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">${totalCost.toFixed(4)}</div>
                    <div className="stat-label">Total AI Cost</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{todayLogs.length}</div>
                    <div className="stat-label">AI Calls Today</div>
                </div>
            </div>

            <div className="settings-section" style={{ marginTop: 'var(--space-xl)' }}>
                <h3 className="settings-section-title">Quick Actions</h3>
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <Link to="/logs" className="btn btn-secondary btn-sm">View AI Logs</Link>
                    <Link to="/history" className="btn btn-secondary btn-sm">View Analyses</Link>
                </div>
            </div>

            {/* Users */}
            <div className="settings-section">
                <h3 className="settings-section-title">Users ({users.length})</h3>
                {users.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <div className="empty-state-title">No users yet</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        {users.slice(0, 20).map((user) => (
                            <div key={user._id} className="card" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--space-sm) var(--space-md)',
                            }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                        {user.name || 'Unnamed'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-sm">
                                    <span className="scene-card-tag">{user.plan || 'free'}</span>
                                    <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                                        {user.creditBalance ?? 0} credits
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Analyses */}
            <div className="settings-section">
                <h3 className="settings-section-title">Recent Analyses ({analyses.length})</h3>
                {analyses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <div className="empty-state-title">No analyses yet</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        {analyses.slice(0, 10).map((a) => (
                            <div key={a._id} className="card" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--space-sm) var(--space-md)',
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                    }}>
                                        {a.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-sm">
                                    <span className="scene-card-tag">{a.status}</span>
                                    <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                                        {a.model}
                                    </span>
                                    <span className="font-mono text-muted" style={{ fontSize: '0.7rem' }}>
                                        {new Date(a.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPage
