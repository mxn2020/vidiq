import { Component, type ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0A0A0F',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    color: '#F8FAFC',
                    padding: 24,
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0A1628 0%, #0A0A0F 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 24,
                        padding: 48,
                        maxWidth: 420,
                        width: '100%',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>💥</div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
                        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: 24 }}>
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 12,
                                padding: '12px 24px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
