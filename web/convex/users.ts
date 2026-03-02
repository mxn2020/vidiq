import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Get the current user's profile.
 */
export const getProfile = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();
    },
});

/**
 * Get a user's profile by userId (admin use).
 */
export const getByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

/**
 * Create or update the current user's profile.
 */
export const createOrUpdate = mutation({
    args: {
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name ?? existing.name,
            });
            return existing._id;
        }

        return await ctx.db.insert("userProfiles", {
            userId: identity.subject,
            name: args.name ?? identity.name ?? undefined,
            role: "user",
            totalAnalyses: 0,
            creditBalance: 10, // Free starting credits
            plan: "free",
            createdAt: Date.now(),
        });
    },
});

/**
 * Update user name.
 */
export const updateName = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!profile) throw new Error("Profile not found");

        await ctx.db.patch(profile._id, { name: args.name });
    },
});

/**
 * Delete user account and all data.
 */
export const deleteAccount = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (profile) {
            await ctx.db.delete(profile._id);
        }

        // Delete all user analyses
        const analyses = await ctx.db
            .query("analyses")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();

        for (const analysis of analyses) {
            await ctx.db.delete(analysis._id);
        }

        // Delete all credit transactions
        const transactions = await ctx.db
            .query("creditTransactions")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();

        for (const tx of transactions) {
            await ctx.db.delete(tx._id);
        }
    },
});

/**
 * List all users (admin only).
 */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (profile?.role !== "admin") return [];

        return await ctx.db.query("userProfiles").collect();
    },
});

/**
 * Get current user's full profile data (for ProfilePage).
 */
export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        if (!profile) return { hasProfile: false, role: "user" as const };

        const analyses = await ctx.db
            .query("analyses")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        return {
            hasProfile: true,
            ...profile,
            totalAnalyses: analyses.length,
        };
    },
});

/**
 * Internal: get profile by userId (used by Stripe actions).
 */
export const getProfileByUserId = internalQuery({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();
    },
});

/**
 * Update profile name and preferences.
 */
export const updateProfile = mutation({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        if (!profile) throw new Error("Profile not found");
        await ctx.db.patch(profile._id, { name });
    },
});

/**
 * Bootstrap an admin user by email (run from CLI).
 * Usage: npx convex run users:bootstrapAdmin '{"email":"admin@example.com"}'
 */
export const bootstrapAdmin = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const users = await ctx.db.query("users").collect();
        const user = users.find((u: any) => u.email === email);
        if (!user) throw new Error(`No user found with email: ${email}`);

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, { role: "admin" });
            return { status: "updated", profileId: profile._id };
        } else {
            const id = await ctx.db.insert("userProfiles", {
                userId: user._id,
                name: user.name ?? "",
                role: "admin",
                totalAnalyses: 0,
                creditBalance: 10,
                plan: "free",
                createdAt: Date.now(),
            });
            return { status: "created", profileId: id };
        }
    },
});
