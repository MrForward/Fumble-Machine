/**
 * CoinGecko API fallback for crypto prices
 * Free API limitations:
 * - Rate limit: 10-30 requests/minute
 * - Historical data: Last 365 days only
 */

// Map common crypto symbols to CoinGecko IDs
const CRYPTO_MAP: Record<string, string> = {
    "BTC-USD": "bitcoin",
    "ETH-USD": "ethereum",
    "BNB-USD": "binancecoin",
    "XRP-USD": "ripple",
    "SOL-USD": "solana",
    "ADA-USD": "cardano",
    "DOGE-USD": "dogecoin",
    "AVAX-USD": "avalanche-2",
    "DOT-USD": "polkadot",
    "MATIC-USD": "matic-network",
    "SHIB-USD": "shiba-inu",
    "TRX-USD": "tron",
    "LINK-USD": "chainlink",
    "ATOM-USD": "cosmos",
    "UNI-USD": "uniswap",
    "LTC-USD": "litecoin",
    "XLM-USD": "stellar",
    "ALGO-USD": "algorand",
    "VET-USD": "vechain",
    "FIL-USD": "filecoin",
    "NEAR-USD": "near",
    "APT-USD": "aptos",
    "ARB-USD": "arbitrum",
    "OP-USD": "optimism",
    "SUI-USD": "sui",
    "PEPE-USD": "pepe",
    "WIF-USD": "dogwifcoin",
};

export function isCryptoSymbol(symbol: string): boolean {
    return symbol.toUpperCase().endsWith("-USD") && getCoinGeckoId(symbol) !== null;
}

export function getCoinGeckoId(symbol: string): string | null {
    return CRYPTO_MAP[symbol.toUpperCase()] || null;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Check if date is within CoinGecko's free tier limit (365 days)
function isWithinFreeLimit(date: Date): boolean {
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 365;
}

/**
 * Fetch historical price from CoinGecko using market_chart/range endpoint
 * NOTE: Free tier only supports last 365 days
 */
export async function getCoinGeckoHistoricalPrice(
    symbol: string,
    date: Date
): Promise<{ price: number; actualDate: string } | null> {
    const coinId = getCoinGeckoId(symbol);
    if (!coinId) return null;

    // Check if date is within free tier limit
    if (!isWithinFreeLimit(date)) {
        console.log(`[CoinGecko] Date ${date.toISOString()} is older than 365 days, skipping`);
        return null;
    }

    try {
        // Get a 3-day window around the target date
        const fromTimestamp = Math.floor(date.getTime() / 1000) - 86400;
        const toTimestamp = Math.floor(date.getTime() / 1000) + 86400 * 2;

        const response = await fetch(
            `${COINGECKO_API}/coins/${coinId}/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`CoinGecko API error: ${response.status}`, errorData);
            return null;
        }

        const data = await response.json();

        if (data?.prices && data.prices.length > 0) {
            // Find the closest price to our target date
            const targetTime = date.getTime();
            let closestPrice = data.prices[0];
            let closestDiff = Math.abs(data.prices[0][0] - targetTime);

            for (const [timestamp, price] of data.prices) {
                const diff = Math.abs(timestamp - targetTime);
                if (diff < closestDiff) {
                    closestDiff = diff;
                    closestPrice = [timestamp, price];
                }
            }

            return {
                price: closestPrice[1],
                actualDate: new Date(closestPrice[0]).toISOString().split("T")[0],
            };
        }
    } catch (error) {
        console.error("CoinGecko historical fetch error:", error);
    }

    return null;
}

/**
 * Fetch current price from CoinGecko
 */
export async function getCoinGeckoCurrentPrice(symbol: string): Promise<number | null> {
    const coinId = getCoinGeckoId(symbol);
    if (!coinId) return null;

    try {
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            console.error(`CoinGecko current price error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data[coinId]?.usd) {
            return data[coinId].usd;
        }
    } catch (error) {
        console.error("CoinGecko current price fetch error:", error);
    }

    return null;
}

/**
 * Fetch both historical and current price from CoinGecko
 * Returns null if date is older than 365 days (free tier limit)
 */
export async function getCoinGeckoPrices(
    symbol: string,
    date: Date
): Promise<{ historicalPrice: number; currentPrice: number; actualDate: string } | null> {
    // Early exit if date is too old for free tier
    if (!isWithinFreeLimit(date)) {
        console.log(`[CoinGecko] Skipping ${symbol} - date older than 365 days`);
        return null;
    }

    try {
        const [historical, current] = await Promise.all([
            getCoinGeckoHistoricalPrice(symbol, date),
            getCoinGeckoCurrentPrice(symbol),
        ]);

        if (historical && current) {
            console.log(`[CoinGecko] Got prices for ${symbol}: historical=${historical.price}, current=${current}`);
            return {
                historicalPrice: historical.price,
                currentPrice: current,
                actualDate: historical.actualDate,
            };
        }
    } catch (error) {
        console.error("CoinGecko fetch error:", error);
    }

    return null;
}
