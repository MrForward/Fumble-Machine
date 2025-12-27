import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
        return NextResponse.json(
            { error: "Query must be at least 2 characters" },
            { status: 400 }
        );
    }

    try {
        const results = await yahooFinance.search(query.trim());

        // Filter and format results
        const formattedResults = results.quotes
            .filter((quote) => {
                // Only include stocks, ETFs, and crypto
                const validTypes = ["EQUITY", "ETF", "CRYPTOCURRENCY", "INDEX"];
                return quote.quoteType && validTypes.includes(quote.quoteType as string);
            })
            .slice(0, 10) // Limit to 10 results
            .map((quote) => ({
                symbol: quote.symbol,
                name: quote.shortname || quote.longname || quote.symbol,
                type: quote.quoteType,
                exchange: quote.exchange,
            }));

        return NextResponse.json({
            query,
            results: formattedResults,
        });
    } catch (error) {
        console.error("Yahoo Finance search error:", error);
        return NextResponse.json(
            { error: "Failed to search symbols" },
            { status: 500 }
        );
    }
}
