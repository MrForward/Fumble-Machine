
import { POPULAR_ASSETS } from "@/lib/roasts";

// Approximate base prices (around 2024-2025 levels, will add randomness)
// We use a map for O(1) look up
const BASE_PRICES: Record<string, number> = {
    // Crypto
    "BTC-USD": 95000,
    "ETH-USD": 5200,
    "SOL-USD": 280,
    "DOGE-USD": 0.35,

    // Tech
    "NVDA": 180,
    "TSLA": 350,
    "AAPL": 240,
    "AMZN": 210,
    "GOOGL": 195,
    "MSFT": 480,
    "META": 650,

    // Indian Stocks (INR)
    "RELIANCE.NS": 3200,
    "TCS.NS": 4500,
    "INFY.NS": 1800,
    "HDFCBANK.NS": 1750,
    "ICICIBANK.NS": 1200,
    "BATA.NS": 1600,
    "TATAMOTORS.NS": 1100,
    "ASIANPAINT.NS": 3400,
    "WIPRO.NS": 550,
    "SBIN.NS": 900,
    "BHARTIARTL.NS": 1800,
    "ITC.NS": 550,
    "HINDUNILVR.NS": 2800,
    "MARUTI.NS": 14000,
    "TITAN.NS": 4200,

    // Indices
    "^GSPC": 6200,
    "^NSEI": 26000,
};

interface FallbackPrice {
    symbol: string;
    currentPrice: number;
    historicalPrice: number; // Estimated
    currency: string;
    source: "estimate";
}

export function estimateHistoricalPrice(currentPrice: number, purchaseDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = diffDays / 365;

    // Simulate average annual return of ~15% for tech/crypto mixed basket
    // This is a "Fumble Machine" so we want to show growth usually to make them regret it ;)
    // But sometimes loss.
    // Random growth factor: -10% to +40% per year
    const annualizedGrowth = 0.15; // 15% standard growth
    const randomness = (Math.random() - 0.3) * 0.4; // Slightly biased towards growth

    const effectiveGrowthRate = annualizedGrowth + randomness;

    // Calculate historical price by discounting back from current
    // current = historical * (1 + rate)^years
    // historical = current / (1 + rate)^years

    return currentPrice / Math.pow(1 + effectiveGrowthRate, diffYears);
}

export function getFallbackPrice(symbol: string, dateStr: string): FallbackPrice | null {
    const symbolUpper = symbol.toUpperCase();

    // 1. Determine Base Price
    let basePrice = BASE_PRICES[symbolUpper];

    // If not in popular list, generates a random price between 50 and 500 if it looks like a stock ticker
    if (!basePrice) {
        // Simple hash of string to get consistent random number
        const hash = symbolUpper.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        const seed = Math.abs(hash) % 1000;
        basePrice = 10 + (seed / 2); // Random price between 10 and 510
    }

    // 2. Add some volatility to current price (so it's not static)
    // +/- 5% random variation
    const currentPrice = basePrice * (0.95 + Math.random() * 0.1);

    // 3. Estimate Historical Price based on Calculation
    const purchaseDate = new Date(dateStr);
    const historicalPrice = estimateHistoricalPrice(currentPrice, purchaseDate);

    // 4. Determine Currency
    let currency = "USD";
    if (symbolUpper.endsWith(".NS") || symbolUpper === "^NSEI") {
        currency = "INR";
    }

    return {
        symbol: symbolUpper,
        currentPrice,
        historicalPrice,
        currency,
        source: "estimate"
    };
}
