import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthGuard, RedirectIfAuth } from './components/AuthGuard'
import CookieBanner from './components/CookieBanner'
import LandingPage from './pages/LandingPage'
import AnalysisPage from './pages/AnalysisPage'
import AnalysisViewPage from './pages/AnalysisViewPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import BillingPage from './pages/BillingPage'
import AdminPage from './pages/AdminPage'
import LogsPage from './pages/LogsPage'
import PricingPage from './pages/PricingPage'
import HelpPage from './pages/HelpPage'
import NotFoundPage from './pages/NotFoundPage'
import ComparisonPage from './pages/ComparisonPage'
import ProfilePage from './pages/ProfilePage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import AuditLogsPage from './pages/AuditLogsPage'
import ModelTestPage from './pages/ModelTestPage'
import { useState } from 'react'

export type AnalysisResult = {
    analysisId?: string
    title: string
    duration: number
    fps: number
    scenes: Scene[]
    totalScenes: number
    objectsDetected: number
    brandsDetected: string[]
    summary: string
    model: string
    status: 'complete' | 'error'
    errorMessage?: string
}

export type Scene = {
    startTime: string
    endTime: string
    title: string
    description: string
    objects?: string[]
    actions?: string[]
}

function AppRoutes() {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
    const navigate = useNavigate()

    const handleNewAnalysis = () => {
        setAnalysis(null)
        navigate('/')
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<LandingPage onAnalyze={(r) => { setAnalysis(r); navigate('/analysis'); }} />} />
                <Route path="/analysis" element={
                    analysis
                        ? <AnalysisPage analysis={analysis} onBack={handleNewAnalysis} />
                        : <LandingPage onAnalyze={(r) => { setAnalysis(r); navigate('/analysis'); }} />
                } />
                {/* View a persisted analysis by ID */}
                <Route path="/analysis/:id" element={<AnalysisViewPage />} />
                {/* History */}
                <Route path="/history" element={<AuthGuard><HistoryPage /></AuthGuard>} />
                {/* Multi-model comparison */}
                <Route path="/compare" element={<ComparisonPage />} />
                {/* Auth-only routes */}
                <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
                <Route path="/billing" element={<AuthGuard><BillingPage /></AuthGuard>} />
                {/* Admin routes */}
                <Route path="/admin" element={<AuthGuard><AdminPage /></AuthGuard>} />
                <Route path="/logs" element={<AuthGuard><LogsPage /></AuthGuard>} />
                <Route path="/audit-logs" element={<AuthGuard><AuditLogsPage /></AuthGuard>} />
                <Route path="/model-tests" element={<AuthGuard><ModelTestPage /></AuthGuard>} />
                {/* Auth-only user routes */}
                <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
                {/* Public routes */}
                <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="*" element={<NotFoundPage onGoHome={() => navigate('/')} />} />
            </Routes>
            <CookieBanner />
        </Layout>
    )
}

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </ErrorBoundary>
    )
}

export default App
