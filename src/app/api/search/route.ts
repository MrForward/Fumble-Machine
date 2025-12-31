import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const yahooFinance = new YahooFinance({ suppressNotices: ["ripHistorical"] });

// In-memory cache for search results
const searchCache = new Map<string, { results: any[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
        return NextResponse.json(
            { error: "Query must be at least 2 characters" },
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
    let dbResults: any[] = [];
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
                    name: d.symbol, // We don't store names, just use symbol
                    type: d.symbol.endsWith("-USD") ? "CRYPTOCURRENCY" : "EQUITY",
                    exchange: "Cached",
                }));
            }
        } catch (err) {
            console.error("DB search error:", err);
        }
    }

    // Step 3: Fetch from Yahoo Finance
    console.log(`[Search API] "${q}"`);

    try {
        const results = await yahooFinance.search(query.trim());

        const formattedResults = results.quotes
            .filter((quote) => {
                const validTypes = ["EQUITY", "ETF", "CRYPTOCURRENCY", "INDEX"];
                return quote.quoteType && validTypes.includes(quote.quoteType as string);
            })
            .slice(0, 10)
            .map((quote) => ({
                symbol: quote.symbol,
                name: quote.shortname || quote.longname || quote.symbol,
                type: quote.quoteType,
                exchange: quote.exchange,
            }));

        // Merge DB results with API results (prefer API as it has names)
        const seen = new Set(formattedResults.map((r) => r.symbol));
        for (const dbResult of dbResults) {
            if (!seen.has(dbResult.symbol)) {
                formattedResults.push(dbResult);
            }
        }

        // Cache the results
        searchCache.set(q, { results: formattedResults, timestamp: Date.now() });

        return NextResponse.json({
            query,
            results: formattedResults,
        });
    } catch (error) {
        console.error("Yahoo Finance search error:", error);

        // If API fails but we have DB results, return those
        if (dbResults.length > 0) {
            return NextResponse.json({
                query,
                results: dbResults,
            });
        }

        return NextResponse.json(
            { error: "Search unavailable, please try again" },
            { status: 500 }
        );
    }
}
