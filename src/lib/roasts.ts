// Note: Roast messages and thresholds have been moved to server-side only
// See /api/roast for the protected implementation


// Popular asset presets
export const POPULAR_ASSETS = [
    // Crypto
    { value: "BTC-USD", label: "Bitcoin", icon: "₿", type: "Crypto" },
    { value: "ETH-USD", label: "Ethereum", icon: "Ξ", type: "Crypto" },
    { value: "SOL-USD", label: "Solana", icon: "◎", type: "Crypto" },
    { value: "DOGE-USD", label: "Dogecoin", icon: "Ð", type: "Crypto" },

    // US Tech
    { value: "NVDA", label: "NVIDIA", icon: "◆", type: "Stock" },
    { value: "TSLA", label: "Tesla", icon: "⚡", type: "Stock" },
    { value: "AAPL", label: "Apple", icon: "🍎", type: "Stock" },
    { value: "AMZN", label: "Amazon", icon: "📦", type: "Stock" },
    { value: "GOOGL", label: "Google", icon: "🔍", type: "Stock" },
    { value: "MSFT", label: "Microsoft", icon: "🪟", type: "Stock" },
    { value: "META", label: "Meta", icon: "📘", type: "Stock" },

    // Indian Stocks
    { value: "RELIANCE.NS", label: "Reliance Industries", icon: "🏭", type: "Stock" },
    { value: "TCS.NS", label: "Tata Consultancy Services", icon: "💼", type: "Stock" },
    { value: "INFY.NS", label: "Infosys", icon: "💻", type: "Stock" },
    { value: "HDFCBANK.NS", label: "HDFC Bank", icon: "🏦", type: "Stock" },
    { value: "ICICIBANK.NS", label: "ICICI Bank", icon: "🏦", type: "Stock" },

    // Indices
    { value: "^GSPC", label: "S&P 500", icon: "📈", type: "Index" },
    { value: "^NSEI", label: "NIFTY 50", icon: "📊", type: "Index" },
] as const;

export type AssetSymbol = string;

export interface SearchResult {
    symbol: string;
    name: string;
    type: string;
    exchange?: string;
}

// Currency options with symbols and approximate exchange rates to USD
export const CURRENCIES = [
    { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
    { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
    { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
    { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.5 },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 156.5 },
    { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.56 },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.44 },
    { code: "CHF", symbol: "Fr", name: "Swiss Franc", rate: 0.90 },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.30 },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.35 },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"] | string;

export function getCurrencySymbol(code: CurrencyCode): string {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency?.symbol || "$";
}

export function getRate(code: CurrencyCode): number {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency?.rate || 1;
}

export function convertFromUSD(amountUSD: number, code: CurrencyCode): number {
    return amountUSD * getRate(code);
}

export function convertToUSD(amount: number, code: CurrencyCode): number {
    return amount / getRate(code);
}

// Convert between any two currencies
export function convertBetweenCurrencies(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
): number {
    if (fromCurrency === toCurrency) return amount;
    // Convert to USD first, then to target currency
    const amountInUSD = convertToUSD(amount, fromCurrency);
    return convertFromUSD(amountInUSD, toCurrency);
}

