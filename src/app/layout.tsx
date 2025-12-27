import type { Metadata } from "next";
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

export const metadata: Metadata = {
    title: "The Fumble Machine | Calculate Your Opportunity Cost",
    description: "Calculate the opportunity cost of your past purchases. How much did that really cost you?",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${inter.variable} ${jetbrainsMono.variable} ${courierPrime.variable} antialiased`}
            >
                {children}
                <Analytics />
            </body>
        </html>
    );
}

