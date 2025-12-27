import { Redis } from "@upstash/redis";

// Initialize Redis client (uses environment variables)
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Check if Redis is configured
export function isRedisConfigured(): boolean {
    return !!(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
    );
}

// Track a fumble calculation
export async function trackFumbleCalculation(data: {
    country?: string;
    assetSymbol: string;
    currency: string;
    fumbleAmount: number;
}) {
    if (!isRedisConfigured()) return;

    try {
        const today = new Date().toISOString().split("T")[0];
        const country = data.country || "unknown";

        // Increment total fumble count
        await redis.incr("stats:fumbles:total");

        // Increment daily fumble count
        await redis.incr(`stats:fumbles:daily:${today}`);

        // Track by country
        await redis.hincrby("stats:fumbles:by_country", country, 1);

        // Track popular assets
        await redis.hincrby("stats:assets:popularity", data.assetSymbol, 1);

        // Track currencies used
        await redis.hincrby("stats:currencies:usage", data.currency, 1);

        // Store total fumble amount (for fun stats)
        await redis.incrbyfloat("stats:fumbles:total_amount", data.fumbleAmount);
    } catch (error) {
        console.error("Failed to track fumble:", error);
    }
}

// Track an emoji reaction
export async function trackEmojiReaction(data: {
    emoji: string;
    country?: string;
}) {
    if (!isRedisConfigured()) return;

    try {
        const country = data.country || "unknown";

        // Increment total reaction count
        await redis.incr("stats:reactions:total");

        // Track by emoji type
        await redis.hincrby("stats:reactions:by_emoji", data.emoji, 1);

        // Track by country and emoji
        await redis.hincrby(`stats:reactions:by_country:${country}`, data.emoji, 1);

        // Track country totals for reactions
        await redis.hincrby("stats:reactions:countries", country, 1);
    } catch (error) {
        console.error("Failed to track reaction:", error);
    }
}

// Get all stats (for admin viewing)
export async function getStats() {
    if (!isRedisConfigured()) {
        return { error: "Redis not configured" };
    }

    try {
        const [
            totalFumbles,
            totalReactions,
            totalFumbleAmount,
            fumblesByCountry,
            reactionsByEmoji,
            reactionsByCountry,
            assetPopularity,
            currencyUsage,
        ] = await Promise.all([
            redis.get("stats:fumbles:total"),
            redis.get("stats:reactions:total"),
            redis.get("stats:fumbles:total_amount"),
            redis.hgetall("stats:fumbles:by_country"),
            redis.hgetall("stats:reactions:by_emoji"),
            redis.hgetall("stats:reactions:countries"),
            redis.hgetall("stats:assets:popularity"),
            redis.hgetall("stats:currencies:usage"),
        ]);

        return {
            fumbles: {
                total: totalFumbles || 0,
                totalAmount: totalFumbleAmount || 0,
                byCountry: fumblesByCountry || {},
            },
            reactions: {
                total: totalReactions || 0,
                byEmoji: reactionsByEmoji || {},
                byCountry: reactionsByCountry || {},
            },
            popularAssets: assetPopularity || {},
            currencyUsage: currencyUsage || {},
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Failed to get stats:", error);
        return { error: "Failed to fetch stats" };
    }
}

export { redis };
