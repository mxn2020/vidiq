import { useConvexAuth } from 'convex/react'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

/** Redirects to /login if not authenticated. */
export function AuthGuard({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useConvexAuth()

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Loading…</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

/** Redirects to / if already authenticated. */
export function RedirectIfAuth({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useConvexAuth()

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Loading…</p>
            </div>
        )
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
