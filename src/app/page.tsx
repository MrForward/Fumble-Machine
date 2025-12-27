"use client";

import { useState, useEffect } from "react";
import { ConfessionForm, type FumbleResult } from "@/components/confession-form";
import { Receipt } from "@/components/receipt";
import { ShareButton } from "@/components/share-button";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CURRENCIES, convertFromUSD } from "@/lib/roasts";

// Live fumble counter component - fetches config from server
function LiveFumbleCounter() {
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch config from server - values not exposed in client source
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                const { target, start, duration } = data.counter;
                setAmount(start);
                setIsLoading(false);

                const startTime = Date.now();

                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing function for smooth deceleration
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const currentAmount = start + (target - start) * easeOut;

                    setAmount(currentAmount);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };

                requestAnimationFrame(animate);
            })
            .catch(() => {
                // Fallback on error
                setAmount(1.0);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="live-counter">
                <span className="live-indicator">🔴</span>
                <span className="live-text">
                    LIVE: <span className="live-amount">Loading...</span>
                </span>
            </div>
        );
    }

    return (
        <div className="live-counter">
            <span className="live-indicator">🔴</span>
            <span className="live-text">
                LIVE: <span className="live-amount">${amount.toFixed(1)} Million+</span> fumbled this month
            </span>
        </div>
    );
}

// Emoji reaction options
const REACTIONS = [
    { id: 'dead', emoji: '💀', label: "I'm dead." },
    { id: 'clown', emoji: '🤡', label: "I feel stupid." },
    { id: 'melt', emoji: '🫠', label: "This is embarrassing." },
    { id: 'salute', emoji: '🫡', label: "It is what it is." },
    { id: 'zen', emoji: '🧘', label: "I am unbothered." },
];

// Feedback component for after receipt
function FeedbackOptions({ onSelect }: { onSelect?: (id: string) => void }) {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (id: string) => {
        setSelected(id);
        onSelect?.(id);
    };

    return (
        <div className="feedback-section">
            <div className="feedback-options">
                {REACTIONS.map((reaction) => (
                    <button
                        key={reaction.id}
                        className={`reaction-btn ${selected === reaction.id ? 'selected' : ''} ${selected && selected !== reaction.id ? 'dimmed' : ''}`}
                        onClick={() => handleSelect(reaction.id)}
                    >
                        <span className="reaction-emoji">{reaction.emoji}</span>
                        <span className="reaction-label">{reaction.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    const [result, setResult] = useState<FumbleResult | null>(null);

    const handleReset = () => {
        setResult(null);
    };

    // Get currency info for stats display
    const getCurrencySymbol = () => {
        if (!result) return "$";
        const currency = CURRENCIES.find(c => c.code === result.currency);
        return currency?.symbol || "$";
    };

    const formatPrice = (amountUSD: number) => {
        if (!result) return `$${amountUSD.toFixed(2)}`;
        const converted = convertFromUSD(amountUSD, result.currency);
        return `${getCurrencySymbol()}${converted.toFixed(2)}`;
    };

    return (
        <div className="app-container">
            {/* Background grid effect */}
            <div className="grid-background" />

            {/* Main content */}
            <main className="main-content">
                {/* Header */}
                <header className="app-header">
                    <div className="logo-container">
                        <span className="logo-icon">💸</span>
                        <h1 className="app-title">The Fumble Machine</h1>
                    </div>
                    <p className="app-subtitle">
                        Calculate the opportunity cost of your past purchases.
                        <br />
                        <span className="subtitle-emphasis">How much did that really cost you?</span>
                    </p>

                    {/* Live fumble counter */}
                    <LiveFumbleCounter />
                </header>

                {/* Main Card */}
                <div className="content-card">
                    {!result ? (
                        <ConfessionForm onResult={setResult} />
                    ) : (
                        <div className="result-container">
                            <Receipt
                                itemName={result.itemName}
                                itemPrice={result.itemPrice}
                                itemPriceInCurrency={result.itemPriceInCurrency}
                                currency={result.currency}
                                assetSymbol={result.assetSymbol}
                                assetName={result.assetName}
                                currentValue={result.currentValue}
                                fumbleAmount={result.fumbleAmount}
                                purchaseDate={result.purchaseDate}
                                sharesOwned={result.sharesOwned}
                            />

                            {/* Feedback options - subtle, above share */}
                            <FeedbackOptions />

                            <ShareButton
                                assetSymbol={result.assetSymbol}
                                assetName={result.assetName}
                                fumbleAmount={result.fumbleAmount}
                                purchaseDate={result.purchaseDate}
                                currency={result.currency}
                            />

                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                className="reset-button"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Calculate Another Fumble
                            </Button>

                            {/* Stats breakdown */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span className="stat-label">You spent</span>
                                    <span className="stat-value font-mono">
                                        {getCurrencySymbol()}{result.itemPriceInCurrency.toFixed(2)}
                                    </span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Could have bought</span>
                                    <span className="stat-value font-mono">
                                        {result.sharesOwned.toFixed(6)} units
                                    </span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Price then (USD)</span>
                                    <span className="stat-value font-mono">
                                        ${result.historicalPrice.toFixed(2)}
                                    </span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Price now (USD)</span>
                                    <span className="stat-value font-mono">
                                        ${result.currentPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="app-footer">
                    <p>
                        Built for fun. Not financial advice.
                        <br />
                        <span className="footer-disclaimer">
                            Historical results don&apos;t guarantee future performance.
                        </span>
                    </p>
                </footer>
            </main>
        </div>
    );
}
