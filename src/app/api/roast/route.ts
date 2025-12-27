import { NextRequest, NextResponse } from "next/server";

// Server-side only roast configuration - not visible in client source
const ROASTS = [
    { max: 10, item: "a large pizza" },
    { max: 25, item: "a month of Netflix" },
    { max: 50, item: "a nice dinner out" },
    { max: 100, item: "a pair of quality running shoes" },
    { max: 200, item: "a month's groceries for one person" },
    { max: 500, item: "a new smartphone" },
    { max: 1000, item: "a roundtrip flight within the country" },
    { max: 2000, item: "6 months of car insurance" },
    { max: 5000, item: "a year's worth of gym membership" },
    { max: 10000, item: "a semester of community college" },
    { max: 25000, item: "a reliable used car" },
    { max: 50000, item: "a year's rent in a major city" },
    { max: 100000, item: "a down payment on a starter home" },
    { max: 250000, item: "paying off student loans for two people" },
    { max: 500000, item: "a modest house in the suburbs" },
    { max: 1000000, item: "retiring 5 years early" },
    { max: Infinity, item: "financial freedom for life" },
];

function getRoast(fumbleAmount: number): string {
    const absAmount = Math.abs(fumbleAmount);
    const roast = ROASTS.find((r) => absAmount <= r.max);
    return roast ? roast.item : "a yacht and then some";
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const amountStr = searchParams.get("amount");

    if (!amountStr) {
        return NextResponse.json(
            { error: "Missing required parameter: amount" },
            { status: 400 }
        );
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
        return NextResponse.json(
            { error: "Invalid amount" },
            { status: 400 }
        );
    }

    return NextResponse.json({
        item: getRoast(amount),
    });
}
