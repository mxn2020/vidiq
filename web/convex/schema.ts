import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,

    // App-specific user profile data (linked to auth users)
    userProfiles: defineTable({
        userId: v.string(), // references authTables users._id
        name: v.optional(v.string()),
        role: v.union(v.literal("user"), v.literal("admin")),
        totalAnalyses: v.number(),
        stripeCustomerId: v.optional(v.string()),
        plan: v.optional(v.union(v.literal("free"), v.literal("paid"))),
        creditBalance: v.optional(v.number()),    // current credits
        lastCreditRefill: v.optional(v.number()), // timestamp of last monthly refill
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),

    // Credit transaction history
    creditTransactions: defineTable({
        userId: v.string(),
        type: v.union(
            v.literal("purchase"),  // Stripe top-up
            v.literal("refill"),    // Monthly allowance
            v.literal("deduct"),    // Analysis usage
            v.literal("bonus"),     // Admin grant
            v.literal("refund"),    // Failed analysis refund
        ),
        amount: v.number(),         // positive = add, negative = deduct
        balanceBefore: v.number(),
        balanceAfter: v.number(),
        description: v.string(),
        stripeSessionId: v.optional(v.string()),
        timestamp: v.number(),
    })
        .index("by_userId", ["userId", "timestamp"])
        .index("by_type", ["type", "timestamp"])
        .index("by_timestamp", ["timestamp"]),

    // Video analyses — the core data model
    analyses: defineTable({
        userId: v.optional(v.string()),
        videoStorageId: v.optional(v.id("_storage")),
        youtubeUrl: v.optional(v.string()),
        title: v.string(),
        duration: v.number(),      // video duration in seconds
        fps: v.number(),           // sampling FPS used (e.g. 4)
        scenesJson: v.string(),    // JSON array of scene objects
        totalScenes: v.number(),
        objectsDetected: v.number(),
        brandsDetected: v.optional(v.string()), // JSON array of brand names
        summary: v.string(),       // overall video summary
        aiRawResponse: v.string(), // raw AI response
        model: v.string(),         // model used for analysis
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("complete"),
            v.literal("error"),
        ),
        errorMessage: v.optional(v.string()),
        isPublic: v.optional(v.boolean()),
        shareUrl: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_createdAt", ["createdAt"])
        .index("by_status", ["status"])
        .index("by_shareUrl", ["shareUrl"]),

    // AI request logs
    aiLogs: defineTable({
        requestId: v.string(),
        model: v.string(),
        caller: v.string(),
        timestamp: v.number(),
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
    })
        .index("by_timestamp", ["timestamp"])
        .index("by_model_timestamp", ["model", "timestamp"])
        .index("by_caller", ["caller"])
        .index("by_status", ["status"]),

    // Admin: model pricing per 1k tokens
    modelCosts: defineTable({
        model: v.string(),
        displayName: v.optional(v.string()),
        inputCostPer1k: v.number(),
        outputCostPer1k: v.number(),
        updatedAt: v.number(),
    }).index("by_model", ["model"]),

    // AI prompts (editable by admins)
    aiPrompts: defineTable({
        promptId: v.string(),
        name: v.string(),
        content: v.string(),
        description: v.string(),
        updatedAt: v.number(),
    }).index("by_prompt_id", ["promptId"]),

    // Audit logs
    auditLogs: defineTable({
        action: v.string(),
        category: v.union(v.literal("auth"), v.literal("admin"), v.literal("system"), v.literal("billing")),
        userId: v.optional(v.string()),
        targetId: v.optional(v.string()),
        details: v.string(),
        ipAddress: v.optional(v.string()),
        timestamp: v.number(),
    })
        .index("by_timestamp", ["timestamp"])
        .index("by_category", ["category", "timestamp"])
        .index("by_userId", ["userId", "timestamp"])
        .index("by_action", ["action", "timestamp"]),

    // Model test results
    modelTests: defineTable({
        testRunId: v.string(),
        model: v.string(),
        mode: v.string(),
        videoSizeBytes: v.optional(v.number()),
        startedAt: v.number(),
        completedAt: v.number(),
        durationMs: v.number(),
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number(),
        rawResponse: v.string(),
        parsedResult: v.optional(v.string()),
        parseSuccess: v.boolean(),
        hasAllFields: v.boolean(),
        qualityNotes: v.optional(v.string()),
        status: v.string(),
        errorMessage: v.optional(v.string()),
    })
        .index("by_testRunId", ["testRunId"])
        .index("by_model", ["model"])
        .index("by_startedAt", ["startedAt"]),
});
