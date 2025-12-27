import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

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

    try {
        const purchaseDate = new Date(dateStr);

        // Fetch historical price
        const historicalData = await yahooFinance.historical(symbol, {
            period1: purchaseDate,
            period2: new Date(purchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after
            interval: "1d",
        });

        if (!historicalData || historicalData.length === 0) {
            return NextResponse.json(
                { error: "No historical data found for this date" },
                { status: 404 }
            );
        }

        const historicalPrice = historicalData[0].close;
        const actualDate = historicalData[0].date.toISOString().split("T")[0];

        // Fetch current price and currency
        const quote = await yahooFinance.quote(symbol);
        const currentPrice = quote.regularMarketPrice;

        // Get the stock's trading currency (e.g., "INR" for Indian stocks, "USD" for US stocks)
        const stockCurrency = quote.currency || "USD";

        if (!currentPrice) {
            return NextResponse.json(
                { error: "Could not fetch current price" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            symbol,
            historicalPrice,
            currentPrice,
            actualDate,
            stockCurrency, // Include the stock's trading currency
        });
    } catch (error) {
        console.error("Yahoo Finance API error:", error);
        return NextResponse.json(
            { error: "Check network or try again later" },
            { status: 500 }
        );
    }
}

