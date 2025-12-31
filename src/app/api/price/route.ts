import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { getCachedPrice, cachePrice } from "@/lib/price-db";
import { isCryptoSymbol, getCoinGeckoPrices } from "@/lib/coingecko";

const yahooFinance = new YahooFinance({ suppressNotices: ["ripHistorical"] });

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const dateStr = searchParams.get("date");

    if (!symbol || !dateStr) {
        return NextResponse.json(
            { error: "Missing required parameters: symbol and date" },
            { status: 400 }
        );
    }

    const symbolUpper = symbol.toUpperCase();
    const purchaseDate = new Date(dateStr);

    // Step 1: Check database/memory cache
    const cached = await getCachedPrice(symbolUpper, dateStr);
    if (cached) {
        return NextResponse.json({
            symbol: cached.symbol,
            historicalPrice: cached.historical_price,
            currentPrice: cached.current_price,
            actualDate: dateStr,
            stockCurrency: cached.currency,
        });
    }

    // Step 2: For crypto, try CoinGecko first (more reliable for crypto)
    if (isCryptoSymbol(symbolUpper)) {
        console.log(`[API] Trying CoinGecko for crypto ${symbolUpper}`);

        try {
            const cgResult = await getCoinGeckoPrices(symbolUpper, purchaseDate);
            if (cgResult) {
                const result = {
                    symbol: symbolUpper,
                    historicalPrice: cgResult.historicalPrice,
                    currentPrice: cgResult.currentPrice,
                    actualDate: cgResult.actualDate,
                    stockCurrency: "USD",
                };

                // Cache the result
                await cachePrice({
                    symbol: symbolUpper,
                    date: dateStr,
                    historical_price: cgResult.historicalPrice,
                    current_price: cgResult.currentPrice,
                    currency: "USD",
                    source: "coingecko",
                });

                return NextResponse.json(result);
            }
        } catch (error) {
            console.error("CoinGecko error:", error);
        }
    }

    // Step 3: Try Yahoo Finance with retries
    console.log(`[API] Fetching ${symbolUpper} @ ${dateStr} from Yahoo Finance`);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const result = await fetchFromYahoo(symbolUpper, purchaseDate);
            if (result) {
                // Cache the result
                await cachePrice({
                    symbol: symbolUpper,
                    date: dateStr,
                    historical_price: result.historicalPrice,
                    current_price: result.currentPrice,
                    currency: result.stockCurrency,
                    source: "yahoo",
                });

                return NextResponse.json(result);
            }
        } catch (error) {
            lastError = error as Error;
            const errorMessage = lastError.message || "";

            // If rate limited, wait with exponential backoff
            if (errorMessage.includes("429") || errorMessage.includes("Too Many Requests")) {
                const delay = INITIAL_DELAY * Math.pow(2, attempt);
                console.log(`[API] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            // For other errors, don't retry
            break;
        }
    }

    // Step 4: If Yahoo failed for crypto, last resort CoinGecko
    if (isCryptoSymbol(symbolUpper)) {
        try {
            const cgResult = await getCoinGeckoPrices(symbolUpper, purchaseDate);
            if (cgResult) {
                const result = {
                    symbol: symbolUpper,
                    historicalPrice: cgResult.historicalPrice,
                    currentPrice: cgResult.currentPrice,
                    actualDate: cgResult.actualDate,
                    stockCurrency: "USD",
                };

                await cachePrice({
                    symbol: symbolUpper,
                    date: dateStr,
                    historical_price: cgResult.historicalPrice,
                    current_price: cgResult.currentPrice,
                    currency: "USD",
                    source: "coingecko",
                });

                return NextResponse.json(result);
            }
        } catch (error) {
            console.error("CoinGecko fallback error:", error);
        }
    }

    // All sources failed
    const isRateLimited = lastError?.message?.includes("429") || lastError?.message?.includes("Too Many Requests");

    return NextResponse.json(
        {
            error: isRateLimited
                ? "Service is temporarily busy. Please try again in a few minutes."
                : "Could not fetch price data. Please try a different asset or date."
        },
        { status: isRateLimited ? 429 : 500 }
    );
}

async function fetchFromYahoo(
    symbol: string,
    date: Date
): Promise<{
    symbol: string;
    historicalPrice: number;
    currentPrice: number;
    actualDate: string;
    stockCurrency: string;
} | null> {
    // Fetch historical price using chart API
    const chartData = await yahooFinance.chart(symbol, {
        period1: date,
        period2: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
        interval: "1d",
    });

    if (!chartData?.quotes || chartData.quotes.length === 0) {
        return null;
    }

    const historicalPrice = chartData.quotes[0].close;
    const actualDate = chartData.quotes[0].date?.toISOString().split("T")[0] || date.toISOString().split("T")[0];

    if (!historicalPrice) {
        return null;
    }

    // Fetch current price
    const quote = await yahooFinance.quote(symbol);
    const currentPrice = quote.regularMarketPrice;
    const stockCurrency = quote.currency || "USD";

    if (!currentPrice) {
        return null;
    }

    return {
        symbol,
        historicalPrice,
        currentPrice,
        actualDate,
        stockCurrency,
    };
}
