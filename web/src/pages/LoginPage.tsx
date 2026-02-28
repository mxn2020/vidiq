import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
    const { signIn } = useAuthActions()
    const navigate = useNavigate()
    const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn('password', {
                email,
                password,
                flow,
                ...(flow === 'signUp' ? { name } : {}),
            })
            navigate('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">
                    {flow === 'signIn' ? '🎬 Welcome back' : '🎬 Create account'}
                </h2>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-md)',
                        color: 'var(--color-danger)',
                        fontSize: '0.85rem',
                        marginBottom: 'var(--space-md)',
                    }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {flow === 'signUp' && (
                        <div>
                            <label className="label" htmlFor="name-input">Name</label>
                            <input
                                id="name-input"
                                className="input"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="label" htmlFor="email-input">Email</label>
                        <input
                            id="email-input"
                            className="input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="password-input">Password</label>
                        <input
                            id="password-input"
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        id="auth-submit-btn"
                    >
                        {loading ? 'Loading…' : flow === 'signIn' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    {flow === 'signIn' ? (
                        <p>
                            Don't have an account?{' '}
                            <button className="btn-ghost" onClick={() => setFlow('signUp')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                Sign up
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
                            <button className="btn-ghost" onClick={() => setFlow('signIn')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                Sign in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LoginPage
