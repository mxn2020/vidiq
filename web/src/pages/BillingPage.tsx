import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

function BillingPage() {
    const balance = useQuery(api.credits.getBalance)
    const transactions = useQuery(api.credits.getTransactions, {}) ?? []

    return (
        <div>
            <h2 style={{ marginBottom: 'var(--space-xl)' }}>💳 Billing & Credits</h2>

            {/* Current Plan */}
            <div className="settings-section">
                <h3 className="settings-section-title">Current Plan</h3>
                <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                            Free Plan
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                            3 analyses per day • 30-second max
                        </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Upgrade to Premium</button>
                </div>
            </div>

            {/* Credit Balance */}
            <div className="settings-section">
                <h3 className="settings-section-title">Credit Balance</h3>
                <div className="stats-grid" style={{ margin: 0 }}>
                    <div className="stat-card">
                        <div className="stat-value">{balance?.balance ?? '…'}</div>
                        <div className="stat-label">Credits Available</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{transactions.length}</div>
                        <div className="stat-label">Transactions</div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
                <div className="settings-section">
                    <h3 className="settings-section-title">Recent Transactions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        {transactions.slice(0, 20).map((tx) => (
                            <div key={tx._id} className="card" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--space-sm) var(--space-md)',
                            }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description}</span>
                                    <span className="text-muted font-mono" style={{ fontSize: '0.75rem', marginLeft: 'var(--space-sm)' }}>
                                        {new Date(tx._creationTime).toLocaleDateString()}
                                    </span>
                                </div>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    color: tx.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                }}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top-Up */}
            <div className="settings-section">
                <h3 className="settings-section-title">Top Up Credits</h3>
                <div className="pricing-grid" style={{ margin: 0 }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>10</div>
                        <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>Credits</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>$1.99</div>
                        <button className="btn btn-secondary btn-sm w-full" style={{ marginTop: 'var(--space-md)' }}>Buy</button>
                    </div>
                    <div className="card" style={{ textAlign: 'center', borderColor: 'var(--color-primary)' }}>
                        <div className="pricing-badge">Best Value</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>40</div>
                        <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>Credits</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>$5.99</div>
                        <button className="btn btn-primary btn-sm w-full" style={{ marginTop: 'var(--space-md)' }}>Buy</button>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>100</div>
                        <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>Credits</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>$12.99</div>
                        <button className="btn btn-secondary btn-sm w-full" style={{ marginTop: 'var(--space-md)' }}>Buy</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingPage
