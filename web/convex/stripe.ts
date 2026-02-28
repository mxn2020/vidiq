import { action, mutation, internalMutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { auth } from "./auth";

// ---- Top-up packages (maps packageId → credits for validation) ----
const TOP_UP_PACKAGES: Record<string, { credits: number; priceEnvVar: string; priceEnvVarEur?: string }> = {
    "topup_50": { credits: 50, priceEnvVar: "STRIPE_PRICE_TOPUP_50", priceEnvVarEur: "STRIPE_PRICE_TOPUP_50_EUR" },
    "topup_150": { credits: 150, priceEnvVar: "STRIPE_PRICE_TOPUP_150", priceEnvVarEur: "STRIPE_PRICE_TOPUP_150_EUR" },
    "topup_500": { credits: 500, priceEnvVar: "STRIPE_PRICE_TOPUP_500", priceEnvVarEur: "STRIPE_PRICE_TOPUP_500_EUR" },
};

// ---- Helpers ----

/** Create or retrieve a Stripe Customer for the authenticated user. */
async function createOrGetCustomer(
    stripeKey: string,
    userId: string,
    email?: string,
    existingCustomerId?: string,
): Promise<string> {
    if (existingCustomerId) return existingCustomerId;

    const params = new URLSearchParams({
        "metadata[app]": "vidiq",
        "metadata[userId]": userId,
    });
    if (email) params.set("email", email);

    const response = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Stripe customer creation failed: ${error}`);
    }

    const customer = await response.json();
    return customer.id;
}

// ---- Internal Queries ----

export const getProfileByStripeCustomerId = internalQuery({
    args: { stripeCustomerId: v.string() },
    handler: async (ctx, { stripeCustomerId }) => {
        return await ctx.db
            .query("userProfiles")
            .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
            .first();
    },
});

// ---- Queries ----

export const getSubscription = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!profile) return null;

        return {
            plan: profile.plan ?? "free",
            creditBalance: profile.creditBalance ?? 0,
            stripeCustomerId: profile.stripeCustomerId,
        };
    },
});

// ---- Mutations ----

export const updateSubscription = mutation({
    args: {
        stripeCustomerId: v.string(),
        plan: v.union(v.literal("free"), v.literal("paid")),
    },
    handler: async (ctx, { stripeCustomerId, plan }) => {
        const profile = await ctx.db
            .query("userProfiles")
            .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, { plan });
        }
    },
});

export const setStripeCustomerId = internalMutation({
    args: {
        customerId: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, { customerId, userId }) => {
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, { stripeCustomerId: customerId });
        }
    },
});

// ---- Actions ----

export const createCheckoutSession = action({
    args: {
        plan: v.literal("paid"),
        currency: v.optional(v.union(v.literal("eur"), v.literal("usd"))),
    },
    handler: async (ctx, { plan, currency }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

        const isEur = currency === "eur";
        const proPriceId = isEur
            ? (process.env.STRIPE_PRICE_PRO_EUR || process.env.STRIPE_PRICE_PRO)
            : process.env.STRIPE_PRICE_PRO;
        if (!proPriceId) throw new Error("STRIPE_PRICE_PRO not configured");

        const siteUrl = process.env.SITE_URL ?? "http://localhost:5186";

        const profile = await ctx.runQuery(internal.users.getProfileByUserId, { userId });
        const customerId = await createOrGetCustomer(
            stripeKey, userId, undefined, profile?.stripeCustomerId ?? undefined,
        );

        if (!profile?.stripeCustomerId) {
            await ctx.runMutation(internal.stripe.setStripeCustomerId, { customerId, userId });
        }

        const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${stripeKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                "mode": "subscription",
                "customer": customerId,
                "success_url": `${siteUrl}/pricing?success=true`,
                "cancel_url": `${siteUrl}/pricing?canceled=true`,
                "line_items[0][price]": proPriceId,
                "line_items[0][quantity]": "1",
                "metadata[app]": "vidiq",
                "metadata[userId]": userId,
                "metadata[plan]": plan,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Stripe error: ${error}`);
        }

        const session = await response.json();
        return { url: session.url };
    },
});

export const createTopUpSession = action({
    args: {
        packageId: v.string(),
        currency: v.optional(v.union(v.literal("eur"), v.literal("usd"))),
    },
    handler: async (ctx, { packageId, currency }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const pkg = TOP_UP_PACKAGES[packageId];
        if (!pkg) throw new Error(`Invalid package: ${packageId}`);

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

        const isEur = currency === "eur";
        const priceEnvVarStr = isEur && pkg.priceEnvVarEur ? pkg.priceEnvVarEur : pkg.priceEnvVar;
        const priceId = process.env[priceEnvVarStr];
        if (!priceId) throw new Error(`${priceEnvVarStr} not configured`);

        const siteUrl = process.env.SITE_URL ?? "http://localhost:5186";

        const profile = await ctx.runQuery(internal.users.getProfileByUserId, { userId });
        const customerId = await createOrGetCustomer(
            stripeKey, userId, undefined, profile?.stripeCustomerId ?? undefined,
        );

        if (!profile?.stripeCustomerId) {
            await ctx.runMutation(internal.stripe.setStripeCustomerId, { customerId, userId });
        }

        const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${stripeKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                "mode": "payment",
                "customer": customerId,
                "success_url": `${siteUrl}/pricing?topup=success`,
                "cancel_url": `${siteUrl}/pricing?topup=canceled`,
                "line_items[0][price]": priceId,
                "line_items[0][quantity]": "1",
                "metadata[app]": "vidiq",
                "metadata[userId]": userId,
                "metadata[type]": "topup",
                "metadata[packageId]": packageId,
                "metadata[credits]": pkg.credits.toString(),
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Stripe error: ${error}`);
        }

        const session = await response.json();
        return { url: session.url };
    },
});

export const createPortalSession = action({
    args: {},
    handler: async (ctx): Promise<{ url: string }> => {
        const userId: string | null = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const stripeKey: string | undefined = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

        const siteUrl: string = process.env.SITE_URL ?? "http://localhost:5186";

        const profile = await ctx.runQuery(internal.users.getProfileByUserId, { userId });
        if (!profile?.stripeCustomerId) {
            throw new Error("No Stripe customer found. Subscribe first.");
        }

        const portalResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${stripeKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                customer: profile.stripeCustomerId,
                return_url: `${siteUrl}/billing`,
            }),
        });

        if (!portalResponse.ok) {
            const errorText = await portalResponse.text();
            throw new Error(`Stripe Portal error: ${errorText}`);
        }

        const portalSession = await portalResponse.json();
        return { url: portalSession.url };
    },
});

export const handleTopUpSuccess = action({
    args: {
        userId: v.string(),
        credits: v.number(),
        stripeSessionId: v.optional(v.string()),
        packageLabel: v.optional(v.string()),
    },
    handler: async (ctx, { userId, credits, stripeSessionId, packageLabel }) => {
        await ctx.runMutation(internal.credits.addPurchasedCredits, {
            userId,
            amount: credits,
            description: packageLabel ? `Top-up: ${packageLabel}` : `Credit purchase: ${credits} credits`,
            stripeSessionId,
        });
    },
});

export const activateSubscription = internalMutation({
    args: {
        userId: v.string(),
        stripeCustomerId: v.string(),
    },
    handler: async (ctx, { userId, stripeCustomerId }) => {
        let profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!profile) {
            const profileId = await ctx.db.insert("userProfiles", {
                userId,
                name: "",
                role: "user",
                totalAnalyses: 0,
                plan: "paid",
                stripeCustomerId,
                creditBalance: 100,
                createdAt: Date.now(),
            });
            await ctx.db.insert("creditTransactions", {
                userId,
                type: "purchase",
                amount: 100,
                balanceBefore: 0,
                balanceAfter: 100,
                description: "Pro plan activated — 100 monthly analysis credits",
                timestamp: Date.now(),
            });
            console.log(`[activateSubscription] Created profile ${profileId} with plan=paid, 100 credits`);
            return;
        }

        const currentBalance = profile.creditBalance ?? 0;
        const newBalance = currentBalance + 100;

        await ctx.db.patch(profile._id, {
            plan: "paid",
            stripeCustomerId,
            creditBalance: newBalance,
        });

        await ctx.db.insert("creditTransactions", {
            userId,
            type: "purchase",
            amount: 100,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: "Pro plan activated — 100 monthly analysis credits",
            timestamp: Date.now(),
        });
    },
});

export const handleSubscriptionActive = action({
    args: {
        userId: v.string(),
        stripeCustomerId: v.string(),
    },
    handler: async (ctx, { userId, stripeCustomerId }) => {
        await ctx.runMutation(internal.stripe.activateSubscription, {
            userId,
            stripeCustomerId,
        });
    },
});
