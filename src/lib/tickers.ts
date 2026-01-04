export interface Ticker {
    symbol: string;
    name: string;
    type: "EQUITY" | "CRYPTOCURRENCY" | "ETF" | "INDEX";
    region?: string;
}

export const STATIC_TICKERS: Ticker[] = [
    // US Tech Giants
    { symbol: "AAPL", name: "Apple Inc.", type: "EQUITY", region: "US" },
    { symbol: "MSFT", name: "Microsoft Corporation", type: "EQUITY", region: "US" },
    { symbol: "NVDA", name: "NVIDIA Corporation", type: "EQUITY", region: "US" },
    { symbol: "GOOGL", name: "Alphabet Inc.", type: "EQUITY", region: "US" },
    { symbol: "AMZN", name: "Amazon.com Inc.", type: "EQUITY", region: "US" },
    { symbol: "META", name: "Meta Platforms Inc.", type: "EQUITY", region: "US" },
    { symbol: "TSLA", name: "Tesla Inc.", type: "EQUITY", region: "US" },
    { symbol: "NFLX", name: "Netflix Inc.", type: "EQUITY", region: "US" },
    { symbol: "AMD", name: "Advanced Micro Devices", type: "EQUITY", region: "US" },
    { symbol: "INTC", name: "Intel Corporation", type: "EQUITY", region: "US" },

    // US Popular
    { symbol: "GME", name: "GameStop Corp.", type: "EQUITY", region: "US" },
    { symbol: "AMC", name: "AMC Entertainment", type: "EQUITY", region: "US" },
    { symbol: "HOOD", name: "Robinhood Markets", type: "EQUITY", region: "US" },
    { symbol: "COIN", name: "Coinbase Global", type: "EQUITY", region: "US" },
    { symbol: "PLTR", name: "Palantir Technologies", type: "EQUITY", region: "US" },
    { symbol: "DIS", name: "The Walt Disney Company", type: "EQUITY", region: "US" },
    { symbol: "NKE", name: "Nike Inc.", type: "EQUITY", region: "US" },
    { symbol: "SBUX", name: "Starbucks Corporation", type: "EQUITY", region: "US" },

    // Indian Giants (NSE)
    { symbol: "RELIANCE.NS", name: "Reliance Industries", type: "EQUITY", region: "IN" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services", type: "EQUITY", region: "IN" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank", type: "EQUITY", region: "IN" },
    { symbol: "INFY.NS", name: "Infosys Limited", type: "EQUITY", region: "IN" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank", type: "EQUITY", region: "IN" },
    { symbol: "SBIN.NS", name: "State Bank of India", type: "EQUITY", region: "IN" },
    { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", type: "EQUITY", region: "IN" },
    { symbol: "ITC.NS", name: "ITC Limited", type: "EQUITY", region: "IN" },
    { symbol: "TATAMOTORS.NS", name: "Tata Motors", type: "EQUITY", region: "IN" },
    { symbol: "LICI.NS", name: "Life Insurance Corp", type: "EQUITY", region: "IN" },
    { symbol: "ZOMATO.NS", name: "Zomato Limited", type: "EQUITY", region: "IN" },
    { symbol: "PAYTM.NS", name: "Paytm (One97)", type: "EQUITY", region: "IN" },

    // Crypto
    { symbol: "BTC-USD", name: "Bitcoin", type: "CRYPTOCURRENCY" },
    { symbol: "ETH-USD", name: "Ethereum", type: "CRYPTOCURRENCY" },
    { symbol: "SOL-USD", name: "Solana", type: "CRYPTOCURRENCY" },
    { symbol: "DOGE-USD", name: "Dogecoin", type: "CRYPTOCURRENCY" },
    { symbol: "XRP-USD", name: "XRP", type: "CRYPTOCURRENCY" },
    { symbol: "ADA-USD", name: "Cardano", type: "CRYPTOCURRENCY" },
    { symbol: "SHIB-USD", name: "Shiba Inu", type: "CRYPTOCURRENCY" },
    { symbol: "PEPE-USD", name: "Pepe", type: "CRYPTOCURRENCY" },

    // Indices
    { symbol: "^GSPC", name: "S&P 500", type: "INDEX" },
    { symbol: "^DJI", name: "Dow Jones Industrial Average", type: "INDEX" },
    { symbol: "^IXIC", name: "NASDAQ Composite", type: "INDEX" },
    { symbol: "^NSEI", name: "NIFTY 50", type: "INDEX" },
    { symbol: "^BSESN", name: "SENSEX", type: "INDEX" },
];

export function searchStatic(query: string): Ticker[] {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    return STATIC_TICKERS.filter(item =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    ).slice(0, 10); // Limit to 10 results
}
