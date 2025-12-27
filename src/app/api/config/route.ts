import { NextResponse } from "next/server";

// Server-side only config - not visible in client source
const CONFIG = {
    counter: {
        target: 1.2,
        start: 0.1,
        duration: 2000,
    }
};

export async function GET() {
    return NextResponse.json({
        counter: CONFIG.counter,
    });
}
