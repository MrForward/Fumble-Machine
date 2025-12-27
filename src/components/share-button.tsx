"use client";

import { useState, useRef } from "react";
import { Download, Loader2, Share2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { type CurrencyCode, CURRENCIES, convertFromUSD } from "@/lib/roasts";

interface ShareButtonProps {
    assetSymbol: string;
    assetName: string;
    fumbleAmount: number;
    purchaseDate: string;
    currency: CurrencyCode;
}

export function ShareButton({ assetSymbol, assetName, fumbleAmount, purchaseDate, currency }: ShareButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

    const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    const fumbleInCurrency = convertFromUSD(fumbleAmount, currency);

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
    };

    const getShareMessage = () => {
        const isLoss = fumbleAmount > 0;
        const emoji = isLoss ? "😭" : "🎉";
        const verb = isLoss ? "fumbled" : "saved";

        return `I just ${verb} ${currencyInfo.symbol}${formatAmount(fumbleInCurrency)} by not investing in ${assetName}! ${emoji}\n\nCalculate your fumble: ${window.location.origin}\n\n#TheFumbleMachine #OpportunityCost`;
    };

    // Generate receipt image using html-to-image (better CSS support)
    const generateImage = async (): Promise<string | null> => {
        const receiptElement = document.getElementById("fumble-receipt");
        if (!receiptElement) {
            console.error("Receipt element not found");
            return null;
        }

        try {
            // Use html-to-image which has better CSS support
            const dataUrl = await toPng(receiptElement, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: "#fdfdf5",
                style: {
                    transform: "scale(1)",
                },
                filter: (node) => {
                    // Filter out any problematic elements
                    return true;
                },
            });

            return dataUrl;
        } catch (error) {
            console.error("Failed to generate image:", error);
            return null;
        }
    };

    const handleDownload = async () => {
        setIsLoading(true);
        setDownloadStatus("Generating image...");

        try {
            const dataUrl = await generateImage();
            if (!dataUrl) {
                throw new Error("Failed to generate image");
            }

            const link = document.createElement("a");
            const fileName = `fumble-${assetSymbol.replace("^", "")}-${purchaseDate}.png`;
            link.download = fileName;
            link.href = dataUrl;
            link.click();

            setDownloadStatus("✅ Downloaded!");
            setTimeout(() => setDownloadStatus(null), 2000);
        } catch (error) {
            console.error("Failed to download image:", error);
            setDownloadStatus("❌ Failed - try screenshot instead");
            setTimeout(() => setDownloadStatus(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    // Native share with image (using Web Share API)
    const handleNativeShare = async () => {
        setIsLoading(true);
        setDownloadStatus("Preparing to share...");

        try {
            const dataUrl = await generateImage();

            if (!dataUrl) {
                throw new Error("Failed to generate image");
            }

            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            const fileName = `fumble-${assetSymbol.replace("^", "")}-${purchaseDate}.png`;
            const file = new File([blob], fileName, { type: "image/png" });
            const message = getShareMessage();

            // Check if Web Share API with files is supported
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "My Fumble Receipt",
                    text: message,
                });
                setDownloadStatus("✅ Shared!");
            } else if (navigator.share) {
                // Fallback: share without file
                await navigator.share({
                    title: "My Fumble Receipt",
                    text: message,
                    url: window.location.origin,
                });
                // Also download the image
                await handleDownload();
            } else {
                // No Web Share API - fallback to download
                await handleDownload();
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error("Share failed:", error);
                setDownloadStatus("Downloading instead...");
                await handleDownload();
            }
        } finally {
            setIsLoading(false);
            setTimeout(() => setDownloadStatus(null), 2000);
        }
    };

    const handleReddit = async () => {
        setIsLoading(true);
        setDownloadStatus("Downloading for Reddit...");

        try {
            // Download image first
            await handleDownload();

            // Create share message for Reddit r/Frugal
            const isLoss = fumbleAmount > 0;
            const title = isLoss
                ? `I fumbled ${currencyInfo.symbol}${formatAmount(fumbleInCurrency)} by not investing - calculate your opportunity cost!`
                : `I actually saved ${currencyInfo.symbol}${formatAmount(fumbleInCurrency)} by making the right choice!`;

            // Reddit submit URL to r/Frugal
            const redditUrl = `https://www.reddit.com/r/Frugal/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.origin)}`;

            setTimeout(() => {
                window.open(redditUrl, "_blank");
                setDownloadStatus("✅ Opening Reddit - attach the downloaded image!");
            }, 500);
        } catch (error) {
            console.error("Reddit share failed:", error);
            const url = `https://www.reddit.com/r/Frugal/submit?title=${encodeURIComponent("Calculate your fumble!")}&url=${encodeURIComponent(window.location.origin)}`;
            window.open(url, "_blank");
        } finally {
            setIsLoading(false);
            setTimeout(() => setDownloadStatus(null), 4000);
        }
    };

    const handleTwitter = async () => {
        setIsLoading(true);
        setDownloadStatus("Downloading for Twitter...");

        try {
            // Download image first
            await handleDownload();

            // Open Twitter with message
            const message = getShareMessage();
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;

            setTimeout(() => {
                window.open(twitterUrl, "_blank");
                setDownloadStatus("✅ Opening Twitter - attach the downloaded image!");
            }, 500);
        } catch (error) {
            console.error("Twitter share failed:", error);
            const message = getShareMessage();
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
            window.open(url, "_blank");
        } finally {
            setIsLoading(false);
            setTimeout(() => setDownloadStatus(null), 4000);
        }
    };

    const handleInstagram = async () => {
        setIsLoading(true);
        setDownloadStatus("Downloading for Instagram...");

        await handleDownload();

        setTimeout(() => {
            setDownloadStatus("✅ Now upload to Instagram Stories!");
            setTimeout(() => setDownloadStatus(null), 3000);
        }, 1000);

        setIsLoading(false);
    };

    const handleCopyLink = async () => {
        const message = getShareMessage();
        try {
            await navigator.clipboard.writeText(message);
            setDownloadStatus("✅ Copied to clipboard!");
            setTimeout(() => setDownloadStatus(null), 2000);
        } catch {
            setDownloadStatus("❌ Failed to copy");
            setTimeout(() => setDownloadStatus(null), 2000);
        }
    };

    return (
        <div className="share-section">
            <div className="share-title">Share Your Fumble</div>

            {/* Status indicator */}
            {downloadStatus && (
                <div className="share-status">{downloadStatus}</div>
            )}

            {/* Primary Share Button - Uses native share with image */}
            <Button
                onClick={handleNativeShare}
                disabled={isLoading}
                className="share-btn-primary"
                size="lg"
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <>
                        <Image className="h-5 w-5 mr-2" />
                        Share Receipt Image
                    </>
                )}
            </Button>

            <div className="share-divider">or share on</div>

            <div className="share-grid">
                {/* Reddit - r/Frugal */}
                <Button
                    onClick={handleReddit}
                    disabled={isLoading}
                    className="share-btn reddit"
                    size="lg"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                    <span>Reddit</span>
                </Button>

                {/* Twitter/X */}
                <Button
                    onClick={handleTwitter}
                    disabled={isLoading}
                    className="share-btn twitter"
                    size="lg"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>Twitter</span>
                </Button>

                {/* Instagram */}
                <Button
                    onClick={handleInstagram}
                    disabled={isLoading}
                    className="share-btn instagram"
                    size="lg"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                        </svg>
                    )}
                    <span>Instagram</span>
                </Button>

                {/* Download */}
                <Button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="share-btn download"
                    size="lg"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Download className="h-5 w-5" />
                    )}
                    <span>Download</span>
                </Button>
            </div>

            {/* Copy Link */}
            <Button
                variant="outline"
                onClick={handleCopyLink}
                className="copy-link-btn"
                size="lg"
            >
                <Share2 className="mr-2 h-4 w-4" />
                Copy Share Message
            </Button>
        </div>
    );
}
