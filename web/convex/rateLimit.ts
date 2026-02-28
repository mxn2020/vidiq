import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Rate limit: max analyses per window
const MAX_ANALYSES_PER_WINDOW = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if the current user has exceeded their rate limit.
 */
export const check = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return { allowed: false, reason: "Not authenticated" };

        const windowStart = Date.now() - WINDOW_MS;

        const recentAnalyses = await ctx.db
            .query("analyses")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .filter((q) => q.gte(q.field("createdAt"), windowStart))
            .collect();

        const count = recentAnalyses.length;
        const remaining = Math.max(0, MAX_ANALYSES_PER_WINDOW - count);

        return {
            allowed: count < MAX_ANALYSES_PER_WINDOW,
            count,
            limit: MAX_ANALYSES_PER_WINDOW,
            remaining,
            resetsAt: windowStart + WINDOW_MS,
        };
    },
});

/**
 * Admin: check rate limit for a specific user.
 */
export const checkForUser = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const windowStart = Date.now() - WINDOW_MS;

        const recentAnalyses = await ctx.db
            .query("analyses")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .filter((q) => q.gte(q.field("createdAt"), windowStart))
            .collect();

        return {
            count: recentAnalyses.length,
            limit: MAX_ANALYSES_PER_WINDOW,
            remaining: Math.max(0, MAX_ANALYSES_PER_WINDOW - recentAnalyses.length),
        };
    },
});
