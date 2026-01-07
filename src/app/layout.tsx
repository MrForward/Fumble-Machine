import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Courier_Prime } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
});

const courierPrime = Courier_Prime({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-courier",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fumble-machine.vercel.app";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
    // Basic Meta
    title: {
        default: "The Fumble Machine | Calculate Your Opportunity Cost",
        template: "%s | The Fumble Machine",
    },
    description: "Calculate the opportunity cost of your past purchases. See how much you fumbled by not investing in Bitcoin, Tesla, or the S&P 500. Free opportunity cost calculator with real market data.",
    keywords: [
        "opportunity cost calculator",
        "investment calculator",
        "fumble calculator",
        "bitcoin investment",
        "stock investment calculator",
        "what if I invested",
        "regret calculator",
        "crypto opportunity cost",
        "tesla stock calculator",
        "financial regret",
        "compound growth calculator",
        "missed investment opportunity",
    ],
    authors: [{ name: "The Fumble Machine" }],
    creator: "The Fumble Machine",
    publisher: "The Fumble Machine",

    // Canonical URL
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: "/",
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    // Open Graph (Facebook, LinkedIn)
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        siteName: "The Fumble Machine",
        title: "The Fumble Machine | Calculate Your Opportunity Cost",
        description: "Ever wonder what that coffee could have been worth if you invested instead? Calculate your fumble with real market data.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "The Fumble Machine - Calculate Your Opportunity Cost",
            },
        ],
    },

    // Twitter Card
    twitter: {
        card: "summary_large_image",
        title: "The Fumble Machine | Calculate Your Opportunity Cost",
        description: "Ever wonder what that coffee could have been worth if you invested instead? Calculate your fumble!",
        images: ["/og-image.png"],
        creator: "@fumble_machine",
    },

    // Icons
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },

    // App specific
    applicationName: "The Fumble Machine",
    category: "finance",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                {/* Structured Data for Google */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            name: "The Fumble Machine",
                            description: "Calculate the opportunity cost of your past purchases. See how much you fumbled by not investing.",
                            url: siteUrl,
                            applicationCategory: "FinanceApplication",
                            operatingSystem: "Any",
                            offers: {
                                "@type": "Offer",
                                price: "0",
                                priceCurrency: "USD",
                            },
                            aggregateRating: {
                                "@type": "AggregateRating",
                                ratingValue: "4.8",
                                ratingCount: "1000",
                            },
                        }),
                    }}
                />
            </head>
            <body
                className={`${inter.variable} ${jetbrainsMono.variable} ${courierPrime.variable} antialiased`}
            >
                {children}
                <Analytics />
            </body>
        </html>
    );
}
