import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { type SearchResult } from "@/lib/roasts";
import { searchStatic, type Ticker } from "@/lib/tickers";

const yahooFinance = new YahooFinance({ suppressNotices: ["ripHistorical"] });

// In-memory cache for search results
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 3) {
        return NextResponse.json(
            { error: "Query must be at least 3 characters" },
            { status: 400 }
        );
    }

    const q = query.trim().toLowerCase();

    // Step 1: Check memory cache
    const memoryCached = searchCache.get(q);
    if (memoryCached && Date.now() - memoryCached.timestamp < CACHE_TTL) {
        console.log(`[Search Memory Cache HIT] "${q}"`);
        return NextResponse.json({
            query,
            results: memoryCached.results,
        });
    }

    // Step 2: Check Supabase for symbols we have cached prices for
    let dbResults: SearchResult[] = [];
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase
                .from("prices")
                .select("symbol, currency")
                .ilike("symbol", `%${q}%`)
                .limit(5);

            if (data && !error) {
                dbResults = data.map((d) => ({
                    symbol: d.symbol,
                    name: d.symbol,
                    type: d.symbol.endsWith("-USD") ? "CRYPTOCURRENCY" : "EQUITY",
                    exchange: "Cached",
                }));
            }
        } catch (err) {
            console.error("DB search error:", err);
        }
    }

    // Step 3: Fetch from Yahoo Finance AND Single-Source-of-Truth Static List
    console.log(`[Search API] "${q}"`);

    // Always fetch static results first/in-parallel because they are reliable
    let staticResults: Ticker[] = [];
    try {
        // Await in case we switch to async static later
        staticResults = await searchStatic(q);
    } catch (e) {
        console.error("Static search error:", e);
    }

    try {
        // Use Promise.race or just await? Yahoo might be slow/rate-limited.
        // If Yahoo fails, we fallback to catch block.
        // If Yahoo returns [] but we have static results, we should mix them.

        const apiResults: SearchResult[] = [];
        try {
            const yahooData = await yahooFinance.search(query.trim());
            const validTypes = new Set(["EQUITY", "ETF", "CRYPTOCURRENCY", "INDEX"]);

            for (const quote of yahooData.quotes) {
                if (!quote.isYahooFinance || !validTypes.has(quote.quoteType)) continue;

                apiResults.push({
                    symbol: quote.symbol,
                    name: quote.shortname || quote.longname || quote.symbol,
                    type: quote.quoteType,
                    exchange: quote.exchange,
                });
            }
        } catch (apiError) {
            console.error("Yahoo Search API failed (using fallback):", apiError);
            // Verify if it is a rate limit or network error
        }

        // MERGE: Static (High Quality) + API (Broad) + DB (History)
        // Priority: Static > API > DB

        const combined = new Map<string, SearchResult>();

        // 1. Add Static Results (High Confidence)
        staticResults.forEach((r) => {
            combined.set(r.symbol, {
                symbol: r.symbol,
                name: r.name,
                type: r.type,
                exchange: r.region || "Top 500",
            });
        });

        // 2. Add API Results (if not already present)
        apiResults.forEach((r) => {
            if (!combined.has(r.symbol)) {
                combined.set(r.symbol, r);
            }
        });

        // 3. Add DB Results
        dbResults.forEach((r) => {
            if (!combined.has(r.symbol)) {
                combined.set(r.symbol, r);
            }
        });

        const finalResults = Array.from(combined.values()).slice(0, 15);

        // Cache the results
        if (finalResults.length > 0) {
            searchCache.set(q, { results: finalResults, timestamp: Date.now() });
        }

        return NextResponse.json({
            query,
            results: finalResults,
        });

    } catch (error) {
        console.error("Critical search error:", error);
        // Even if everything exploded, try to return static results if we have them
        return NextResponse.json({
            query,
            results: staticResults.slice(0, 10),
        });
    }
}
