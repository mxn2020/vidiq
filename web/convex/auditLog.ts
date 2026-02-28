import { mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Write an audit log entry.
 */
export const write = mutation({
    args: {
        action: v.string(),
        category: v.union(v.literal("auth"), v.literal("admin"), v.literal("system"), v.literal("billing")),
        userId: v.optional(v.string()),
        targetId: v.optional(v.string()),
        details: v.string(),
        ipAddress: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("auditLogs", {
            ...args,
            timestamp: Date.now(),
        });
    },
});

/**
 * List audit logs (admin only).
 */
export const list = query({
    args: {
        limit: v.optional(v.number()),
        category: v.optional(v.union(v.literal("auth"), v.literal("admin"), v.literal("system"), v.literal("billing"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (profile?.role !== "admin") return [];

        const limit = args.limit ?? 100;

        if (args.category) {
            return await ctx.db
                .query("auditLogs")
                .withIndex("by_category", (q) => q.eq("category", args.category!))
                .order("desc")
                .take(limit);
        }

        return await ctx.db
            .query("auditLogs")
            .withIndex("by_timestamp")
            .order("desc")
            .take(limit);
    },
});

/**
 * Internal: log a system event (callable from httpAction handlers).
 */
export const logSystem = internalMutation({
    args: {
        action: v.string(),
        category: v.union(v.literal("auth"), v.literal("admin"), v.literal("system"), v.literal("billing")),
        userId: v.optional(v.string()),
        details: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("auditLogs", {
            ...args,
            timestamp: Date.now(),
        });
    },
});
