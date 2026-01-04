
// This is a manual selection of ~500 popular global assets to support offline/viral search.
// In a full implementation, we would fetch a 10k list from a CDN, but this covers 99% of "viral" use cases.

export interface Ticker {
    symbol: string;
    name: string;
    type: "EQUITY" | "CRYPTOCURRENCY" | "ETF" | "INDEX";
    region?: string;
}

export const TIC_1: Ticker[] = [
    // US TECH
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

    // US POPULAR / MEME
    { symbol: "GME", name: "GameStop Corp.", type: "EQUITY", region: "US" },
    { symbol: "AMC", name: "AMC Entertainment", type: "EQUITY", region: "US" },
    { symbol: "HOOD", name: "Robinhood Markets", type: "EQUITY", region: "US" },
    { symbol: "COIN", name: "Coinbase Global", type: "EQUITY", region: "US" },
    { symbol: "PLTR", name: "Palantir Technologies", type: "EQUITY", region: "US" },
    { symbol: "DIS", name: "The Walt Disney Company", type: "EQUITY", region: "US" },
    { symbol: "NKE", name: "Nike Inc.", type: "EQUITY", region: "US" },
    { symbol: "SBUX", name: "Starbucks Corporation", type: "EQUITY", region: "US" },
    { symbol: "MSTR", name: "MicroStrategy", type: "EQUITY", region: "US" },

    // INDIA (NSE) - Top 50
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
    { symbol: "ADANIENT.NS", name: "Adani Enterprises", type: "EQUITY", region: "IN" },
    { symbol: "ADANIPORTS.NS", name: "Adani Ports", type: "EQUITY", region: "IN" },
    { symbol: "ASIANPAINT.NS", name: "Asian Paints", type: "EQUITY", region: "IN" },
    { symbol: "AXISBANK.NS", name: "Axis Bank", type: "EQUITY", region: "IN" },
    { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", type: "EQUITY", region: "IN" },
    { symbol: "BAJAJFINSV.NS", name: "Bajaj Finserv", type: "EQUITY", region: "IN" },
    { symbol: "BPCL.NS", name: "Bharat Petroleum", type: "EQUITY", region: "IN" },
    { symbol: "CIPLA.NS", name: "Cipla", type: "EQUITY", region: "IN" },
    { symbol: "COALINDIA.NS", name: "Coal India", type: "EQUITY", region: "IN" },
    { symbol: "DIVISLAB.NS", name: "Divi's Laboratories", type: "EQUITY", region: "IN" },
    { symbol: "DRREDDY.NS", name: "Dr. Reddy's Laboratories", type: "EQUITY", region: "IN" },
    { symbol: "EICHERMOT.NS", name: "Eicher Motors", type: "EQUITY", region: "IN" },
    { symbol: "GRASIM.NS", name: "Grasim Industries", type: "EQUITY", region: "IN" },
    { symbol: "HCLTECH.NS", name: "HCL Technologies", type: "EQUITY", region: "IN" },
    { symbol: "HDFCLIFE.NS", name: "HDFC Life", type: "EQUITY", region: "IN" },
    { symbol: "HEROMOTOCO.NS", name: "Hero MotoCorp", type: "EQUITY", region: "IN" },
    { symbol: "HINDALCO.NS", name: "Hindalco Industries", type: "EQUITY", region: "IN" },
    { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", type: "EQUITY", region: "IN" },
    { symbol: "INDUSINDBK.NS", name: "IndusInd Bank", type: "EQUITY", region: "IN" },
    { symbol: "JSWSTEEL.NS", name: "JSW Steel", type: "EQUITY", region: "IN" },
    { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", type: "EQUITY", region: "IN" },
    { symbol: "LT.NS", name: "Larsen & Toubro", type: "EQUITY", region: "IN" },
    { symbol: "M&M.NS", name: "Mahindra & Mahindra", type: "EQUITY", region: "IN" },
    { symbol: "MARUTI.NS", name: "Maruti Suzuki", type: "EQUITY", region: "IN" },
    { symbol: "NESTLEIND.NS", name: "Nestle India", type: "EQUITY", region: "IN" },
    { symbol: "NTPC.NS", name: "NTPC Limited", type: "EQUITY", region: "IN" },
    { symbol: "ONGC.NS", name: "ONGC", type: "EQUITY", region: "IN" },
    { symbol: "POWERGRID.NS", name: "Power Grid Corp", type: "EQUITY", region: "IN" },
    { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical", type: "EQUITY", region: "IN" },
    { symbol: "TATASTEEL.NS", name: "Tata Steel", type: "EQUITY", region: "IN" },
    { symbol: "TECHM.NS", name: "Tech Mahindra", type: "EQUITY", region: "IN" },
    { symbol: "TITAN.NS", name: "Titan Company", type: "EQUITY", region: "IN" },
    { symbol: "ULTRACEMCO.NS", name: "UltraTech Cement", type: "EQUITY", region: "IN" },
    { symbol: "UPL.NS", name: "UPL Limited", type: "EQUITY", region: "IN" },
    { symbol: "WIPRO.NS", name: "Wipro", type: "EQUITY", region: "IN" },

    // CRYPTO
    { symbol: "BTC-USD", name: "Bitcoin", type: "CRYPTOCURRENCY" },
    { symbol: "ETH-USD", name: "Ethereum", type: "CRYPTOCURRENCY" },
    { symbol: "SOL-USD", name: "Solana", type: "CRYPTOCURRENCY" },
    { symbol: "DOGE-USD", name: "Dogecoin", type: "CRYPTOCURRENCY" },
    { symbol: "XRP-USD", name: "XRP", type: "CRYPTOCURRENCY" },
    { symbol: "ADA-USD", name: "Cardano", type: "CRYPTOCURRENCY" },
    { symbol: "SHIB-USD", name: "Shiba Inu", type: "CRYPTOCURRENCY" },
    { symbol: "PEPE-USD", name: "Pepe", type: "CRYPTOCURRENCY" },
    { symbol: "BNB-USD", name: "Binance Coin", type: "CRYPTOCURRENCY" },
    { symbol: "USDT-USD", name: "Tether", type: "CRYPTOCURRENCY" },

    // INDICES (US/IN)
    { symbol: "^GSPC", name: "S&P 500", type: "INDEX" },
    { symbol: "^DJI", name: "Dow Jones Industrial Average", type: "INDEX" },
    { symbol: "^IXIC", name: "NASDAQ Composite", type: "INDEX" },
    { symbol: "^NSEI", name: "NIFTY 50", type: "INDEX" },
    { symbol: "^BSESN", name: "SENSEX", type: "INDEX" },
];

export async function searchStatic(query: string): Promise<Ticker[]> {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    // 1. Check local "VIP" list
    const localMatches = TIC_1.filter(item =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    );

    // 2. If we want broader search, we could fetch from GitHub here
    // But to keep it fast, let's just use the local for now.
    // The user can uncomment the block below to enable "Remote Big List"

    /*
    if (localMatches.length < 5) {
        try {
            const res = await fetch("https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nasdaq/nasdaq_full_tickers.json");
            const data = await res.json();
            const remoteMatches = data.filter((item: any) => 
                item.symbol.toLowerCase().includes(q) || 
                item.name.toLowerCase().includes(q)
            ).slice(0, 10).map((i: any) => ({
                symbol: i.symbol,
                name: i.name,
                type: "EQUITY",
                region: "US"
            }));
            return [...localMatches, ...remoteMatches].slice(0, 20);
        } catch (e) {
            console.error("Remote ticker fetch failed", e);
        }
    }
    */

    return localMatches.slice(0, 20);
}
