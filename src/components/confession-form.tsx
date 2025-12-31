"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, TrendingDown, Search, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    POPULAR_ASSETS,
    type AssetSymbol,
    type SearchResult,
    CURRENCIES,
    type CurrencyCode,
    convertToUSD,
    convertBetweenCurrencies
} from "@/lib/roasts";

export interface FumbleResult {
    itemName: string;
    itemPrice: number;
    itemPriceInCurrency: number;
    currency: CurrencyCode;
    assetSymbol: string;
    assetName: string;
    purchaseDate: string;
    historicalPrice: number;
    currentPrice: number;
    currentValue: number;
    fumbleAmount: number;
    sharesOwned: number;
}

interface ConfessionFormProps {
    onResult: (result: FumbleResult) => void;
}

export function ConfessionForm({ onResult }: ConfessionFormProps) {
    const [itemName, setItemName] = useState("");
    const [itemPrice, setItemPrice] = useState("");
    const [currency, setCurrency] = useState<CurrencyCode>("USD");
    const [date, setDate] = useState<Date>();
    const [dateOpen, setDateOpen] = useState(false);
    const [asset, setAsset] = useState<AssetSymbol>();
    const [assetName, setAssetName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [comboOpen, setComboOpen] = useState(false);

    // Handle date selection with auto-close
    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            setDateOpen(false);
        }
    };

    // Debounced search with improved handling
    useEffect(() => {
        if (searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(searchQuery)}`
                );
                if (response.ok) {
                    const data = await response.json();
                    console.log("Search results:", data);
                    setSearchResults(data.results || []);
                } else {
                    console.error("Search failed:", response.status);
                    setSearchResults([]);
                }
            } catch (err) {
                console.error("Search error:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!itemName || !itemPrice || !date || !asset) {
            setError("Please fill in all fields");
            return;
        }

        const priceNum = parseFloat(itemPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            setError("Please enter a valid price");
            return;
        }

        setIsLoading(true);

        try {
            const dateStr = format(date, "yyyy-MM-dd");
            const response = await fetch(
                `/api/price?symbol=${encodeURIComponent(asset)}&date=${dateStr}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Check network or try again later");
            }

            const data = await response.json();

            // Get the stock's trading currency (e.g., "INR" for Indian stocks, "USD" for US stocks)
            const stockCurrency = data.stockCurrency || "USD";

            // Convert user's price to the stock's currency for accurate calculation
            const priceInStockCurrency = convertBetweenCurrencies(priceNum, currency, stockCurrency);

            // Calculate shares using matching currencies
            const sharesOwned = priceInStockCurrency / data.historicalPrice;

            // Calculate current value in stock's currency, then convert to USD for standardization
            const currentValueInStockCurrency = sharesOwned * data.currentPrice;
            const currentValueInUSD = convertToUSD(currentValueInStockCurrency, stockCurrency);
            const priceInUSD = convertToUSD(priceNum, currency);

            // Fumble amount in USD (for consistent comparison)
            const fumbleAmount = currentValueInUSD - priceInUSD;

            onResult({
                itemName,
                itemPrice: priceInUSD,
                itemPriceInCurrency: priceNum,
                currency,
                assetSymbol: asset,
                assetName: assetName || asset,
                purchaseDate: data.actualDate,
                historicalPrice: data.historicalPrice,
                currentPrice: data.currentPrice,
                currentValue: currentValueInUSD,
                fumbleAmount,
                sharesOwned,
            });

            // Track the fumble calculation (non-blocking)
            fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'fumble',
                    assetSymbol: asset,
                    currency,
                    fumbleAmount,
                }),
            }).catch(() => { }); // Silently ignore tracking errors
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const selectAsset = (symbol: string, name: string) => {
        setAsset(symbol);
        setAssetName(name);
        setComboOpen(false);
        setSearchQuery("");
    };

    // Get current currency symbol
    const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || "$";

    const maxDate = new Date();
    const minDate = new Date("2010-01-01");

    return (
        <form onSubmit={handleSubmit} className="confession-form">
            <div className="form-header">
                <TrendingDown className="w-8 h-8 text-red-500" />
                <h2 className="form-title">Your Confession</h2>
            </div>

            <div className="form-fields">
                <div className="form-group">
                    <label htmlFor="item-name" className="form-label">
                        What did you buy?
                    </label>
                    <Input
                        id="item-name"
                        type="text"
                        placeholder="e.g., Coffee, PS5, Designer Bag"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="item-price" className="form-label">
                        How much was it?
                    </label>
                    <div className="price-input-wrapper">
                        {/* Currency selector */}
                        <Select value={currency} onValueChange={(v: CurrencyCode) => setCurrency(v)}>
                            <SelectTrigger className="currency-select">
                                <SelectValue placeholder="$" />
                            </SelectTrigger>
                            <SelectContent>
                                {CURRENCIES.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                        <span className="flex items-center gap-2">
                                            <span className="font-mono font-bold">{c.symbol}</span>
                                            <span className="text-muted-foreground text-xs">{c.code}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            id="item-price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="500.00"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            className="form-input price-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">When?</label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal form-input",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                disabled={(date) => date > maxDate || date < minDate}
                                captionLayout="dropdown"
                                fromYear={1947}
                                toYear={new Date().getFullYear()}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="form-group">
                    <label className="form-label">What did you miss?</label>
                    <Popover open={comboOpen} onOpenChange={setComboOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between form-input overflow-hidden",
                                    !asset && "text-muted-foreground"
                                )}
                            >
                                {asset ? (
                                    <span className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                        <span className="truncate">{assetName}</span>
                                        <span className="text-xs text-muted-foreground shrink-0">({asset})</span>
                                    </span>
                                ) : (
                                    "Search or select an asset..."
                                )}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                            <Command shouldFilter={false}>
                                <CommandInput
                                    placeholder="Type to search stocks, crypto, ETFs..."
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                />
                                <CommandList>
                                    {/* Show loading state */}
                                    {isSearching && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                            Searching Yahoo Finance...
                                        </div>
                                    )}

                                    {/* Show empty state only when not searching and no results */}
                                    {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                        <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
                                    )}

                                    {/* Search Results - Show first when there are results */}
                                    {searchResults.length > 0 && (
                                        <CommandGroup heading={`Search Results (${searchResults.length})`}>
                                            {searchResults.map((result) => (
                                                <CommandItem
                                                    key={result.symbol}
                                                    value={`search-${result.symbol}`}
                                                    onSelect={() => selectAsset(result.symbol, result.name)}
                                                    className="cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            asset === result.symbol ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{result.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {result.symbol} • {result.type} {result.exchange ? `• ${result.exchange}` : ''}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}

                                    {/* Popular Assets - Always show */}
                                    <CommandGroup heading="Popular Assets">
                                        {POPULAR_ASSETS.map((a) => (
                                            <CommandItem
                                                key={a.value}
                                                value={`popular-${a.value}`}
                                                onSelect={() => selectAsset(a.value, a.label)}
                                                className="cursor-pointer"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        asset === a.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span className="mr-2 text-lg">{a.icon}</span>
                                                <div className="flex flex-col">
                                                    <span>{a.label}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {a.value} • {a.type}
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground mt-1">
                        Type at least 3 characters to search any stock, crypto, or ETF worldwide
                    </p>
                </div>
            </div>

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={isLoading}
                className="submit-button"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating your regret...
                    </>
                ) : (
                    <>
                        <TrendingDown className="mr-2 h-4 w-4" />
                        Calculate My Fumble
                    </>
                )}
            </Button>
        </form>
    );
}
