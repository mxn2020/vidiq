import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Log an AI request.
 */
export const log = mutation({
    args: {
        requestId: v.string(),
        model: v.string(),
        caller: v.string(),
        durationMs: v.number(),
        systemPrompt: v.string(),
        userPromptText: v.string(),
        hasVideo: v.boolean(),
        videoSizeBytes: v.optional(v.number()),
        temperature: v.number(),
        maxTokens: v.number(),
        requestBodySize: v.number(),
        status: v.string(),
        httpStatus: v.number(),
        responseContent: v.string(),
        responseSize: v.number(),
        finishReason: v.optional(v.string()),
        promptTokens: v.optional(v.number()),
        completionTokens: v.optional(v.number()),
        totalTokens: v.optional(v.number()),
        inputCostUsd: v.optional(v.number()),
        outputCostUsd: v.optional(v.number()),
        totalCostUsd: v.optional(v.number()),
        errorMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("aiLogs", {
            ...args,
            timestamp: Date.now(),
        });
    },
});

/**
 * List recent AI logs (admin only).
 */
export const list = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (profile?.role !== "admin") return [];

        const limit = args.limit ?? 100;
        return await ctx.db
            .query("aiLogs")
            .withIndex("by_timestamp")
            .order("desc")
            .take(limit);
    },
});

/**
 * Get logs filtered by model (admin only).
 */
export const getByModel = query({
    args: { model: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (profile?.role !== "admin") return [];

        const limit = args.limit ?? 50;
        return await ctx.db
            .query("aiLogs")
            .withIndex("by_model_timestamp", (q) => q.eq("model", args.model))
            .order("desc")
            .take(limit);
    },
});
