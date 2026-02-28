import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get a prompt by its ID.
 */
export const getById = query({
    args: { promptId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("aiPrompts")
            .withIndex("by_prompt_id", (q) => q.eq("promptId", args.promptId))
            .unique();
    },
});

/**
 * List all prompts.
 */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("aiPrompts").collect();
    },
});

/**
 * Create or update a prompt (admin only).
 */
export const upsert = mutation({
    args: {
        promptId: v.string(),
        name: v.string(),
        content: v.string(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (profile?.role !== "admin") throw new Error("Not authorized");

        const existing = await ctx.db
            .query("aiPrompts")
            .withIndex("by_prompt_id", (q) => q.eq("promptId", args.promptId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                content: args.content,
                description: args.description,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("aiPrompts", {
            promptId: args.promptId,
            name: args.name,
            content: args.content,
            description: args.description,
            updatedAt: Date.now(),
        });
    },
});
