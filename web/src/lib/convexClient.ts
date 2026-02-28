/**
 * Convex client helpers.
 */

export function getConvexUrl(): string | undefined {
    return import.meta.env.VITE_CONVEX_URL as string | undefined
}
