import { useState, useEffect } from 'react'
import { useQuery, useMutation, useConvexAuth } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../convex/_generated/api'
import { useToast } from '../components/Toast'
import { Input } from '@geenius-ui/react-css'
import { Select } from '@geenius-ui/react-css'
import { useNavigate } from 'react-router-dom'

function SettingsPage() {
    const { isAuthenticated } = useConvexAuth()
    const { signOut } = useAuthActions()
    const profile = useQuery(api.users.getProfile)
    const updateName = useMutation(api.users.updateName)
    const deleteAccount = useMutation(api.users.deleteAccount)
    const createOrUpdate = useMutation(api.users.createOrUpdate)
    const { addToast } = useToast()
    const navigate = useNavigate()

    const [displayName, setDisplayName] = useState('')
    const [defaultModel, setDefaultModel] = useState(
        () => localStorage.getItem('vidiq_default_model') || 'cosmos-reason2-8b'
    )
    const [defaultFps, setDefaultFps] = useState(
        () => localStorage.getItem('vidiq_default_fps') || '4'
    )

    // Auto-create profile on first visit
    useEffect(() => {
        if (isAuthenticated && profile === null) {
            createOrUpdate({ name: '' })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, profile])

    // Sync display name from profile
    useEffect(() => {
        if (profile?.name) {
            setDisplayName(profile.name)
        }
    }, [profile?.name])

    const handleSaveName = async () => {
        if (!displayName.trim()) {
            addToast('Name cannot be empty.', 'warning')
            return
        }
        await updateName({ name: displayName.trim() })
        addToast('Name updated!', 'success')
    }

    const handleSavePreferences = () => {
        localStorage.setItem('vidiq_default_model', defaultModel)
        localStorage.setItem('vidiq_default_fps', defaultFps)
        addToast('Preferences saved!', 'success')
    }

    const handleDeleteAccount = async () => {
        const confirmed = confirm(
            'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.'
        )
        if (!confirmed) return

        const doubleConfirm = confirm(
            'This is your final warning. ALL your analyses, credits, and profile data will be permanently deleted.'
        )
        if (!doubleConfirm) return

        await deleteAccount()
        await signOut()
        addToast('Account deleted. Goodbye!', 'success')
        navigate('/')
    }

    return (
        <div>
            <h2 style={{ marginBottom: 'var(--space-xl)' }}>⚙️ Settings</h2>

            <div className="settings-section">
                <h3 className="settings-section-title">Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <Input
                            id="display-name"
                            label="Display Name"
                            type="text"
                            placeholder="Your name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                    {profile && (
                        <div className="text-muted font-mono" style={{ fontSize: '0.8rem' }}>
                            Tier: {profile.plan || 'free'} • Credits: {profile.creditBalance ?? 0}
                        </div>
                    )}
                    <button
                        className="btn btn-primary btn-sm"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={handleSaveName}
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h3 className="settings-section-title">Analysis Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <Select
                            id="default-model"
                            label="Default AI Model"
                            value={defaultModel}
                            onChange={(e) => setDefaultModel(e.target.value)}
                        >
                            <option value="cosmos-reason2-8b">Cosmos Reason 2 (8B)</option>
                            <option value="kimi-k2.5">Kimi K2.5</option>
                            <option value="nemotron-nano-12b">Nemotron Nano (12B)</option>
                            <option value="cosmos-nemotron-34b">Cosmos Nemotron (34B)</option>
                            <option value="llama-3.2-90b">Llama 3.2 (90B Vision)</option>
                        </Select>
                    </div>
                    <div>
                        <Select
                            id="default-fps"
                            label="Default FPS"
                            value={defaultFps}
                            onChange={(e) => setDefaultFps(e.target.value)}
                        >
                            <option value="2">2 FPS (Faster)</option>
                            <option value="4">4 FPS (Recommended)</option>
                            <option value="8">8 FPS (Detailed)</option>
                        </Select>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={handleSavePreferences}
                    >
                        Save Preferences
                    </button>
                </div>
            </div>

            <div className="settings-section" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <h3 className="settings-section-title" style={{ color: 'var(--color-danger)' }}>Danger Zone</h3>
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="btn btn-danger btn-sm" id="delete-account-btn" onClick={handleDeleteAccount}>
                    Delete Account
                </button>
            </div>
        </div>
    )
}

export default SettingsPage
