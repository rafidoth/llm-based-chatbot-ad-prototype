import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const sessionData = await getSession();

        if (!sessionData) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: sessionData.user.id,
                name: sessionData.user.name,
                email: sessionData.user.email,
            },
        });
    } catch (error) {
        console.error("Auth me error:", error);
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
