import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get cost for a specific model.
 */
export const getByModel = query({
    args: { model: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("modelCosts")
            .withIndex("by_model", (q) => q.eq("model", args.model))
            .unique();
    },
});

/**
 * List all model costs.
 */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("modelCosts").collect();
    },
});

/**
 * Create or update model cost entry (admin only).
 */
export const upsert = mutation({
    args: {
        model: v.string(),
        displayName: v.optional(v.string()),
        inputCostPer1k: v.number(),
        outputCostPer1k: v.number(),
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
            .query("modelCosts")
            .withIndex("by_model", (q) => q.eq("model", args.model))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                displayName: args.displayName,
                inputCostPer1k: args.inputCostPer1k,
                outputCostPer1k: args.outputCostPer1k,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("modelCosts", {
            model: args.model,
            displayName: args.displayName,
            inputCostPer1k: args.inputCostPer1k,
            outputCostPer1k: args.outputCostPer1k,
            updatedAt: Date.now(),
        });
    },
});
