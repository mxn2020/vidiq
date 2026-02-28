import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { Shield, Filter } from 'lucide-react'

export default function AuditLogsPage() {
    const [category, setCategory] = useState<'auth' | 'admin' | 'system' | 'billing' | ''>('')

    const logs = useQuery(api.auditLog.list, category ? { category: category as 'auth' | 'admin' | 'system' | 'billing' } : {}) ?? []

    return (
        <div>
            <h1><Shield size={28} style={{ marginRight: 8 }} /> Audit Logs</h1>

            <div className="filter-bar" style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                <Filter size={16} />
                {['', 'auth', 'admin', 'system', 'billing'].map((cat) => (
                    <button
                        key={cat}
                        className={`btn btn--sm ${category === cat ? 'btn--primary' : 'btn--secondary'}`}
                        onClick={() => setCategory(cat as typeof category)}
                    >
                        {cat || 'All'}
                    </button>
                ))}
            </div>

            {logs.length === 0 ? (
                <p className="text-muted">No audit logs found.</p>
            ) : (
                <div className="audit-logs-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {logs.map((log) => (
                        <div key={log._id} className="card" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                <div>
                                    <span className="badge" style={{ marginRight: 'var(--space-xs)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: 'var(--color-surface-2)' }}>
                                        {log.category}
                                    </span>
                                    <strong>{log.action}</strong>
                                </div>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </div>
                            {log.userId && (
                                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                                    User: <code>{log.userId}</code>
                                </div>
                            )}
                            {log.details && (
                                <pre style={{ fontSize: '0.7rem', marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--color-text-secondary)' }}>
                                    {log.details}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
