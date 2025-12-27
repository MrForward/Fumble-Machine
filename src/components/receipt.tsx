"use client";

import { useState, useEffect } from "react";
import { POPULAR_ASSETS, type CurrencyCode, CURRENCIES, convertFromUSD } from "@/lib/roasts";

interface ReceiptProps {
    itemName: string;
    itemPrice: number;
    itemPriceInCurrency: number;
    currency: CurrencyCode;
    assetSymbol: string;
    assetName: string;
    currentValue: number;
    fumbleAmount: number;
    purchaseDate: string;
    sharesOwned: number;
}

export function Receipt({
    itemName,
    itemPrice,
    itemPriceInCurrency,
    currency,
    assetSymbol,
    assetName,
    currentValue,
    fumbleAmount,
    purchaseDate,
    sharesOwned,
}: ReceiptProps) {
    const [roastItem, setRoastItem] = useState<string>("something nice");
    const isLoss = fumbleAmount > 0;
    const asset = POPULAR_ASSETS.find((a) => a.value === assetSymbol);
    const assetIcon = asset?.icon || "📊";

    // Fetch roast from server (thresholds not visible in client source)
    useEffect(() => {
        fetch(`/api/roast?amount=${encodeURIComponent(fumbleAmount)}`)
            .then(res => res.json())
            .then(data => {
                if (data.item) {
                    setRoastItem(data.item);
                }
            })
            .catch(() => {
                // Fallback
                setRoastItem("something special");
            });
    }, [fumbleAmount]);

    // Get currency info
    const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    const currencySymbol = currencyInfo.symbol;

    // Convert USD values to selected currency for display
    const currentValueInCurrency = convertFromUSD(currentValue, currency);
    const fumbleAmountInCurrency = convertFromUSD(fumbleAmount, currency);

    const formatCurrency = (amount: number, showCode = false) => {
        const formatted = new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        return showCode ? `${currencySymbol}${formatted} ${currency}` : `${currencySymbol}${formatted}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatShares = (shares: number) => {
        if (shares < 1) {
            return shares.toFixed(6);
        } else if (shares < 100) {
            return shares.toFixed(4);
        } else {
            return shares.toFixed(2);
        }
    };

    return (
        <div id="fumble-receipt" className="receipt-container">
            <div className="receipt">
                {/* Header */}
                <div className="receipt-header">
                    <div className="receipt-logo">💸</div>
                    <h2 className="receipt-title">THE FUMBLE MACHINE</h2>
                    <p className="receipt-subtitle">OPPORTUNITY COST CALCULATOR</p>
                    <div className="receipt-divider">{'='.repeat(36)}</div>
                </div>

                {/* Currency Badge */}
                <div className="currency-badge">
                    {currencySymbol} {currency}
                </div>

                {/* Animated Stamp */}
                <div className={`receipt-stamp ${isLoss ? 'loss' : 'gain'} animate-stamp`}>
                    {isLoss ? 'FUMBLED' : 'WINNING'}
                </div>

                {/* Transaction Details */}
                <div className="receipt-body">
                    <div className="receipt-section">
                        <div className="receipt-label">DATE</div>
                        <div className="receipt-value">{formatDate(purchaseDate)}</div>
                    </div>

                    <div className="receipt-divider-dashed">- - - - - - - - - - - - - - - - - -</div>

                    {/* What You Bought */}
                    <div className="receipt-comparison">
                        <div className="comparison-side">
                            <div className="comparison-label">YOU BOUGHT</div>
                            <div className="comparison-item">
                                <div className="item-name">{itemName.toUpperCase()}</div>
                                <div className="item-price">{formatCurrency(itemPriceInCurrency)}</div>
                            </div>
                        </div>

                        <div className="comparison-arrow">→</div>

                        {/* What You Missed */}
                        <div className="comparison-side">
                            <div className="comparison-label">INSTEAD OF</div>
                            <div className="comparison-item">
                                <div className="item-name">
                                    {assetIcon} {assetName.toUpperCase()}
                                </div>
                                <div className="item-shares">
                                    {formatShares(sharesOwned)} {sharesOwned === 1 ? 'share' : 'shares'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="receipt-divider">{'='.repeat(36)}</div>

                    {/* Current Value Highlight */}
                    <div className="receipt-highlight">
                        <div className="highlight-label">IF YOU HELD TODAY</div>
                        <div className="highlight-value">{formatCurrency(currentValueInCurrency)}</div>
                    </div>

                    <div className="receipt-divider">{'='.repeat(36)}</div>

                    {/* The Fumble Amount - BIGGEST HIGHLIGHT */}
                    <div className={`receipt-fumble ${isLoss ? 'loss' : 'gain'}`}>
                        <div className="fumble-label">
                            {isLoss ? 'YOU FUMBLED' : 'YOU SAVED'}
                        </div>
                        <div className="fumble-amount">
                            {isLoss ? '-' : '+'}{formatCurrency(Math.abs(fumbleAmountInCurrency))}
                        </div>
                        <div className="fumble-glow"></div>
                    </div>
                </div>

                {/* Footer Roast */}
                <div className="receipt-footer">
                    <div className="receipt-divider">{'*'.repeat(36)}</div>
                    <p className="receipt-roast">
                        {isLoss
                            ? `That's enough for ${roastItem}.`
                            : `Smart move! You dodged ${roastItem} worth of regret.`
                        }
                    </p>
                    <div className="receipt-thanks">
                        THANK YOU FOR YOUR CONFESSION
                    </div>
                    <div className="receipt-barcode">
                        ||||| |||| ||||| ||| |||| |||||
                    </div>
                </div>
            </div>
        </div>
    );
}
