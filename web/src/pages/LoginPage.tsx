import { MissingConfigDialog } from '../components/MissingConfigDialog'
import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@geenius-ui/react-css'

function LoginPage() {
    const { signIn } = useAuthActions()
    const navigate = useNavigate()
    const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [configError, setConfigError] = useState<string | null>(null)
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
            const message = err instanceof Error ? err.message : String(err)

            // Check for missing environment variables first
            if (message.includes('Missing environment variable') || message.includes('not configured')) {
                const match = message.match(/`([^`]+)`/) || message.match(/([A-Z_]+)\s+not configured/)
                const keyName = match ? match[1] : 'JWT_PRIVATE_KEY'
                setConfigError(`${keyName} not configured`)
                return
            }

            if (message.includes('InvalidAccountId') || message.includes('Could not find')) {
                setError('No account found with this email.')
            } else if (message.includes('InvalidSecret') || message.includes('Invalid password') || message.includes('incorrect password')) {
                setError('Incorrect password.')
            } else if (message.includes('AccountAlreadyExists')) {
                setError('An account with this email already exists.')
            } else if (message.includes('TooManyFailedAttempts')) {
                setError('Too many failed attempts. Try again later.')
            } else {
                setError('Authentication failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            {configError && (
                <MissingConfigDialog
                    message={configError}
                    onClose={() => setConfigError(null)}
                />
            )}
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
                            <Input
                                id="name-input"
                                label="Name"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div>
                        <Input
                            id="email-input"
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            id="password-input"
                            label="Password"
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
