# Search API Reliability Options

Since Yahoo Finance search is also rate-limited, here are 5 options to ensure users can always find their assets:

## 1. Static "Top 500" List (Recommended & Implementing)
**How it works:** We keep a local file (`tickers.ts`) with the top 500 most popular US & Indian stocks/crypto.
- **Pros:** Zero API calls, instant results (0ms latency), 100% reliable.
- **Cons:** Won't find obscure/small-cap companies unless we update the list.
- **Action:** I am creating `src/lib/tickers.ts` and wiring it up as the primary fallback.

## 2. CoinGecko Search (For Crypto)
**How it works:** Use CoinGecko's free `/search` API for cryptocurrency.
- **Pros:** Very reliable for crypto, high rate limits.
- **Cons:** Doesn't work for stocks.
- **Action:** We can use this specifically when the user types a crypto name.

## 3. Remote Static Lists (GitHub)
**How it works:** The server fetches a massive JSON file (e.g., from a public GitHub repo) containing 10,000+ symbols on startup.
- **Pros:** Large coverage without API limits.
- **Cons:** Can consume memory; data might be stale.

## 4. Alpha Vantage Search
**How it works:** Use a professional provider's search endpoint.
- **Pros:** Accurate.
- **Cons:** Free tier is strictly limited (e.g., 25 requests/day), making it useless for "type-ahead" search.

## 5. Google Custom Search API
**How it works:** Use Google to search for "site:finance.yahoo.com [company name]" to infer the ticker.
- **Pros:** Very smart.
- **Cons:** Slow, requires API key, costs money after free tier.

---
**Plan:** I am implementing **Option 1 (Static List)** immediately. It provides the best balance of speed and reliability for a "Fumble Machine".
