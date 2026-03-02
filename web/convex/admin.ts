import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const promoteToAdmin = internalMutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // Find the user in the generic "users" table created by convex auth
        const users = await ctx.db.query("users").collect();
        const authUser = users.find(u => {
            const email = u.email as any;
            return email === args.email || email?.address === args.email;
        });

        if (!authUser) {
            console.log("Could not find auth user with email", args.email);
            return { success: false, reason: "User not found in auth tables" };
        }

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
            .first();

        if (!profile) {
            console.log("Creating new profile for userId", authUser._id);
            const profileId = await ctx.db.insert("userProfiles", {
                userId: authUser._id,
                name: (authUser.name as string) || "Admin",
                role: "admin",
                totalAnalyses: 0,
                creditBalance: 10,
                plan: "free",
                createdAt: Date.now(),
            });
            return { success: true, userId: authUser._id, profileId };
        }

        await ctx.db.patch(profile._id, { role: "admin" });
        return { success: true, userId: authUser._id, profileId: profile._id };
    },
});
