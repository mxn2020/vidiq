import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Input } from '@geenius-ui/react-css'

function LogsPage() {
    const logs = useQuery(api.aiLogs.list, {}) ?? []
    const [filter, setFilter] = useState('')

    const filteredLogs = filter
        ? logs.filter((l) => l.model.toLowerCase().includes(filter.toLowerCase()))
        : logs

    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <h2>📋 AI Logs</h2>
                <div className="flex items-center gap-sm">
                    <div style={{ width: 200 }}>
                        <Input
                            type="text"
                            placeholder="Filter by model..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            id="log-filter"
                        />
                    </div>
                    <button className="btn btn-secondary btn-sm" title="Auto-refreshes via Convex">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <h3 className="settings-section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                        Request History ({filteredLogs.length})
                    </h3>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">No logs yet</div>
                        <p className="text-secondary">AI request logs will appear here once analyses are performed.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.8rem',
                            fontFamily: 'var(--font-mono)',
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-text-muted)' }}>Time</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-text-muted)' }}>Model</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-text-muted)' }}>Status</th>
                                    <th style={{ textAlign: 'right', padding: '8px', color: 'var(--color-text-muted)' }}>Duration</th>
                                    <th style={{ textAlign: 'right', padding: '8px', color: 'var(--color-text-muted)' }}>Tokens</th>
                                    <th style={{ textAlign: 'right', padding: '8px', color: 'var(--color-text-muted)' }}>Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '8px' }}>
                                            {log.timestamp
                                                ? new Date(log.timestamp).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td style={{ padding: '8px' }}>{log.model}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                color: log.status === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                                            }}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                            {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '—'}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                            {log.totalTokens ?? '—'}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                            {log.totalCostUsd != null
                                                ? `$${log.totalCostUsd.toFixed(4)}`
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LogsPage
