import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Save a completed video analysis result.
 */
export const save = mutation({
    args: {
        videoStorageId: v.optional(v.id("_storage")),
        youtubeUrl: v.optional(v.string()),
        title: v.string(),
        duration: v.number(),
        fps: v.number(),
        scenesJson: v.string(),
        totalScenes: v.number(),
        objectsDetected: v.number(),
        brandsDetected: v.optional(v.string()),
        summary: v.string(),
        aiRawResponse: v.string(),
        model: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("complete"),
            v.literal("error"),
        ),
        errorMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject;

        const analysisId = await ctx.db.insert("analyses", {
            userId,
            videoStorageId: args.videoStorageId,
            youtubeUrl: args.youtubeUrl,
            title: args.title,
            duration: args.duration,
            fps: args.fps,
            scenesJson: args.scenesJson,
            totalScenes: args.totalScenes,
            objectsDetected: args.objectsDetected,
            brandsDetected: args.brandsDetected,
            summary: args.summary,
            aiRawResponse: args.aiRawResponse,
            model: args.model,
            status: args.status,
            errorMessage: args.errorMessage,
            isPublic: false,
            createdAt: Date.now(),
        });

        // Increment user's total analyses count
        if (userId) {
            const profile = await ctx.db
                .query("userProfiles")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .unique();
            if (profile) {
                await ctx.db.patch(profile._id, {
                    totalAnalyses: profile.totalAnalyses + 1,
                });
            }
        }

        return analysisId;
    },
});

/**
 * Get a single analysis by ID.
 */
export const getById = query({
    args: { id: v.id("analyses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

/**
 * Get all analyses for the current user.
 */
export const getByUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("analyses")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();
    },
});

/**
 * Get recent public analyses.
 */
export const getRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;
        return await ctx.db
            .query("analyses")
            .withIndex("by_createdAt")
            .order("desc")
            .take(limit);
    },
});

/**
 * Update analysis status (e.g., pending → processing → complete).
 */
export const updateStatus = mutation({
    args: {
        id: v.id("analyses"),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("complete"),
            v.literal("error"),
        ),
        errorMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            errorMessage: args.errorMessage,
        });
    },
});

/**
 * Delete an analysis.
 */
export const remove = mutation({
    args: { id: v.id("analyses") },
    handler: async (ctx, args) => {
        const analysis = await ctx.db.get(args.id);
        if (!analysis) return;

        // Only allow the owner to delete
        const identity = await ctx.auth.getUserIdentity();
        if (identity?.subject !== analysis.userId) return;

        await ctx.db.delete(args.id);
    },
});

/**
 * Toggle public visibility of an analysis. Generates a share URL.
 */
export const togglePublic = mutation({
    args: { id: v.id("analyses") },
    handler: async (ctx, args) => {
        const analysis = await ctx.db.get(args.id);
        if (!analysis) return;

        const identity = await ctx.auth.getUserIdentity();
        if (identity?.subject !== analysis.userId) return;

        const isPublic = !analysis.isPublic;
        const shareUrl = isPublic
            ? `share_${args.id}_${Date.now().toString(36)}`
            : undefined;

        await ctx.db.patch(args.id, { isPublic, shareUrl });
        return { isPublic, shareUrl };
    },
});

/**
 * Get a public analysis by its share URL.
 */
export const getByShareUrl = query({
    args: { shareUrl: v.string() },
    handler: async (ctx, args) => {
        const analysis = await ctx.db
            .query("analyses")
            .withIndex("by_shareUrl", (q) => q.eq("shareUrl", args.shareUrl))
            .unique();

        if (!analysis || !analysis.isPublic) return null;
        return analysis;
    },
});

/**
 * Submit feedback on an analysis.
 */
export const submitFeedback = mutation({
    args: {
        id: v.id("analyses"),
        accurate: v.boolean(),
    },
    handler: async (ctx, args) => {
        // For now, just log it. In the future, this feeds into model improvement.
        const analysis = await ctx.db.get(args.id);
        if (!analysis) return;

        // Store feedback as part of the analysis (simple approach)
        // Could be expanded to a separate feedback table
        console.log(`Feedback for ${args.id}: ${args.accurate ? "accurate" : "inaccurate"}`);
    },
});
