// Note: Roast messages and thresholds have been moved to server-side only
// See /api/roast for the protected implementation


// Popular asset presets
export const POPULAR_ASSETS = [
    { value: "BTC-USD", label: "Bitcoin", icon: "₿", type: "Crypto" },
    { value: "ETH-USD", label: "Ethereum", icon: "Ξ", type: "Crypto" },
    { value: "NVDA", label: "NVIDIA", icon: "◆", type: "Stock" },
    { value: "TSLA", label: "Tesla", icon: "⚡", type: "Stock" },
    { value: "^GSPC", label: "S&P 500", icon: "📈", type: "Index" },
    { value: "AAPL", label: "Apple", icon: "🍎", type: "Stock" },
    { value: "AMZN", label: "Amazon", icon: "📦", type: "Stock" },
    { value: "GOOGL", label: "Google", icon: "🔍", type: "Stock" },
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

export type CurrencyCode = typeof CURRENCIES[number]["code"];

export function getCurrencySymbol(code: CurrencyCode): string {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency?.symbol || "$";
}

export function convertFromUSD(amountUSD: number, code: CurrencyCode): number {
    const currency = CURRENCIES.find((c) => c.code === code);
    return amountUSD * (currency?.rate || 1);
}

export function convertToUSD(amount: number, code: CurrencyCode): number {
    const currency = CURRENCIES.find((c) => c.code === code);
    return amount / (currency?.rate || 1);
}
