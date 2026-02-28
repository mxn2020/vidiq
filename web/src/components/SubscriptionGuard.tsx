import { useConvexAuth } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { ReactNode, useEffect } from 'react'

interface SubscriptionGuardProps {
    children: ReactNode
    requiredPlan?: 'paid'
    fallbackPath?: string
}

export default function SubscriptionGuard({
    children,
    fallbackPath = '/pricing',
}: SubscriptionGuardProps) {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate(fallbackPath)
        }
    }, [isLoading, isAuthenticated, navigate, fallbackPath])

    if (isLoading) {
        return <div className="page-loading">Checking subscription…</div>
    }

    if (!isAuthenticated) return null

    return <>{children}</>
}
