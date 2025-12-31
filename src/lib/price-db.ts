import { supabase, isSupabaseConfigured } from "./supabase";

export interface CachedPrice {
    symbol: string;
    date: string;
    historical_price: number;
    current_price: number;
    currency: string;
    source: string;
}

// In-memory fallback cache when Supabase is not configured
const memoryCache = new Map<string, { data: CachedPrice; timestamp: number }>();
const MEMORY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached price from database or memory
 */
export async function getCachedPrice(
    symbol: string,
    date: string
): Promise<CachedPrice | null> {
    const cacheKey = `${symbol.toUpperCase()}-${date}`;

    // Try Supabase first
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase
                .from("prices")
                .select("*")
                .eq("symbol", symbol.toUpperCase())
                .eq("date", date)
                .single();

            if (data && !error) {
                console.log(`[DB Cache HIT] ${symbol} @ ${date}`);
                return data as CachedPrice;
            }
        } catch (err) {
            console.error("Supabase cache read error:", err);
        }
    }

    // Fallback to memory cache
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
        console.log(`[Memory Cache HIT] ${symbol} @ ${date}`);
        return cached.data;
    }

    return null;
}

/**
 * Cache price in database and memory
 */
export async function cachePrice(data: CachedPrice): Promise<void> {
    const cacheKey = `${data.symbol.toUpperCase()}-${data.date}`;

    // Always cache in memory as backup
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });

    // Try to cache in Supabase
    if (isSupabaseConfigured && supabase) {
        try {
            const { error } = await supabase
                .from("prices")
                .upsert(
                    {
                        symbol: data.symbol.toUpperCase(),
                        date: data.date,
                        historical_price: data.historical_price,
                        current_price: data.current_price,
                        currency: data.currency,
                        source: data.source,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "symbol,date" }
                );

            if (error) {
                console.error("Supabase cache write error:", error);
            } else {
                console.log(`[DB Cache WRITE] ${data.symbol} @ ${data.date}`);
            }
        } catch (err) {
            console.error("Supabase cache write error:", err);
        }
    }
}

/**
 * Get current price from cache (for recently cached items)
 * Used when we have historical but need current price refresh
 */
export async function getCachedCurrentPrice(
    symbol: string
): Promise<number | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
        const { data, error } = await supabase
            .from("prices")
            .select("current_price, updated_at")
            .eq("symbol", symbol.toUpperCase())
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();

        if (data && !error) {
            // Check if updated within last 24 hours
            const updatedAt = new Date(data.updated_at).getTime();
            if (Date.now() - updatedAt < MEMORY_CACHE_TTL) {
                return data.current_price;
            }
        }
    } catch (err) {
        // Ignore errors for optional optimization
    }

    return null;
}
