
import * as cheerio from 'cheerio';

export async function fetchFromGoogleFinance(symbol: string): Promise<number | null> {
    try {
        // Map common Yahoo symbols to Google Finance format
        let gSymbol = symbol;
        let exchange = "";

        if (symbol.endsWith(".NS")) {
            gSymbol = symbol.replace(".NS", "");
            exchange = "NSE";
        } else if (symbol.endsWith(".BO")) {
            gSymbol = symbol.replace(".BO", "");
            exchange = "BOM";
        } else if (symbol.includes("-USD")) {
            // Crypto usually handled by CoinGecko, but just in case
            gSymbol = symbol; // Google often uses similar format or names
        } else {
            // Default US stocks
            exchange = "NASDAQ";
        }

        const url = exchange
            ? `https://www.google.com/finance/quote/${gSymbol}:${exchange}`
            : `https://www.google.com/finance/quote/${gSymbol}`;

        console.log(`[Google Scraper] Fetching ${url}`);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!response.ok) {
            console.error(`[Google Scraper] Failed to fetch: ${response.status}`);
            return null;
        }

        const html = await response.text();

        // Use manual string parsing to be faster/lighter than full DOM load if possible, 
        // but regex is brittle. Let's use simple logic.
        // Google Finance usually puts the price in a specific class. 
        // The class names change, but the data-last-price attribute or specific meta tags often exist.

        // Strategy 1: Look for "YMlKec fxKbKc" class (current popular class, might change)
        // Strategy 2: Look for <div class="YMlKec fxKbKc">2,234.55</div>

        // Let's try to extract the price pattern around the large currency symbol
        const match = html.match(/<div class="YMlKec fxKbKc">([^<]+)<\/div>/);

        if (match && match[1]) {
            // Remove currency symbols and commas
            const priceStr = match[1].replace(/[^0-9.]/g, "");
            const price = parseFloat(priceStr);
            if (!isNaN(price) && price > 0) {
                console.log(`[Google Scraper] Found price: ${price}`);
                return price;
            }
        }

        // Backup Strategy: Look for "data-last-price" attribute
        const match2 = html.match(/data-last-price="([0-9.]+)"/);
        if (match2 && match2[1]) {
            const price = parseFloat(match2[1]);
            if (!isNaN(price) && price > 0) {
                console.log(`[Google Scraper] Found data-last-price: ${price}`);
                return price;
            }
        }

        return null;
    } catch (error) {
        console.error("[Google Scraper] Error:", error);
        return null;
    }
}
