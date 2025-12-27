import { NextRequest, NextResponse } from "next/server";
import { trackFumbleCalculation, trackEmojiReaction, isRedisConfigured } from "@/lib/analytics";

// Get country from request headers (Vercel provides this)
function getCountry(request: NextRequest): string {
    // Vercel provides geo data in headers
    const country = request.headers.get("x-vercel-ip-country") || "unknown";
    return country;
}

export async function POST(request: NextRequest) {
    if (!isRedisConfigured()) {
        // Silently succeed if Redis is not configured (for dev environment)
        return NextResponse.json({ success: true, message: "Tracking disabled" });
    }

    try {
        const body = await request.json();
        const country = getCountry(request);

        if (body.type === "fumble") {
            await trackFumbleCalculation({
                country,
                assetSymbol: body.assetSymbol || "unknown",
                currency: body.currency || "USD",
                fumbleAmount: body.fumbleAmount || 0,
            });
        } else if (body.type === "reaction") {
            await trackEmojiReaction({
                emoji: body.emoji || "unknown",
                country,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Tracking error:", error);
        // Don't fail the request if tracking fails
        return NextResponse.json({ success: false });
    }
}
