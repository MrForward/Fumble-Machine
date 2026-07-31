import { NextRequest, NextResponse } from "next/server";
import { getStats, isRedisConfigured } from "@/lib/analytics";

export async function GET(request: NextRequest) {
    // Simple auth with secret key
    const authHeader = request.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET;

    // Fail closed in production if the admin endpoint is not configured.
    if (!adminSecret && process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: "Admin endpoint is not configured" },
            { status: 503 }
        );
    }

    // Local development may omit ADMIN_SECRET. Any configured secret is enforced.
    if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    if (!isRedisConfigured()) {
        return NextResponse.json({
            error: "Analytics not configured",
            message: "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables",
        });
    }

    const stats = await getStats();
    return NextResponse.json(stats);
}
