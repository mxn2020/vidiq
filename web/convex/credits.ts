import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const FREE_MONTHLY_CREDITS = 10;

/**
 * Get the current user's credit balance & plan.
 */
export const getBalance = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { balance: 0, plan: "free" as const };

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        return {
            balance: profile?.creditBalance ?? 0,
            plan: profile?.plan ?? "free",
        };
    },
});

/**
 * Get the current user's credit transaction history.
 */
export const getTransactions = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const limit = args.limit ?? 50;
        return await ctx.db
            .query("creditTransactions")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(limit);
    },
});

/**
 * Deduct credits for an analysis. Returns success/failure & new balance.
 */
export const deduct = mutation({
    args: {
        amount: v.number(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile) throw new Error("Profile not found");

        const currentBalance = profile.creditBalance ?? 0;
        if (currentBalance < args.amount) {
            return { success: false, balanceAfter: currentBalance };
        }

        const newBalance = currentBalance - args.amount;

        await ctx.db.patch(profile._id, { creditBalance: newBalance });

        await ctx.db.insert("creditTransactions", {
            userId: identity.subject,
            type: "deduct",
            amount: -args.amount,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: args.description,
            timestamp: Date.now(),
        });

        return { success: true, balanceAfter: newBalance };
    },
});

/**
 * Refund credits (e.g., for a failed analysis).
 */
export const refund = mutation({
    args: {
        userId: v.string(),
        amount: v.number(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (!profile) throw new Error("Profile not found");

        const currentBalance = profile.creditBalance ?? 0;
        const newBalance = currentBalance + args.amount;

        await ctx.db.patch(profile._id, { creditBalance: newBalance });

        await ctx.db.insert("creditTransactions", {
            userId: args.userId,
            type: "refund",
            amount: args.amount,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: args.description,
            timestamp: Date.now(),
        });
    },
});

/**
 * Monthly credit refill (called by cron or admin).
 */
export const refillMonthly = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (!profile) return;

        const currentBalance = profile.creditBalance ?? 0;
        const newBalance = currentBalance + FREE_MONTHLY_CREDITS;

        await ctx.db.patch(profile._id, {
            creditBalance: newBalance,
            lastCreditRefill: Date.now(),
        });

        await ctx.db.insert("creditTransactions", {
            userId: args.userId,
            type: "refill",
            amount: FREE_MONTHLY_CREDITS,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: "Monthly credit refill",
            timestamp: Date.now(),
        });
    },
});

/**
 * Admin: grant bonus credits to a user.
 */
export const grantBonus = mutation({
    args: {
        userId: v.string(),
        amount: v.number(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Verify caller is admin
        const callerProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();
        if (callerProfile?.role !== "admin") throw new Error("Not authorized");

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (!profile) throw new Error("Target profile not found");

        const currentBalance = profile.creditBalance ?? 0;
        const newBalance = currentBalance + args.amount;

        await ctx.db.patch(profile._id, { creditBalance: newBalance });

        await ctx.db.insert("creditTransactions", {
            userId: args.userId,
            type: "bonus",
            amount: args.amount,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: args.description,
            timestamp: Date.now(),
        });
    },
});

/**
 * Internal: add purchased credits (called from Stripe webhook via actions).
 */
export const addPurchasedCredits = internalMutation({
    args: {
        userId: v.string(),
        amount: v.number(),
        description: v.string(),
        stripeSessionId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (!profile) throw new Error("Profile not found");

        const currentBalance = profile.creditBalance ?? 0;
        const newBalance = currentBalance + args.amount;

        await ctx.db.patch(profile._id, { creditBalance: newBalance });

        await ctx.db.insert("creditTransactions", {
            userId: args.userId,
            type: "purchase",
            amount: args.amount,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: args.description,
            stripeSessionId: args.stripeSessionId,
            timestamp: Date.now(),
        });
    },
});
