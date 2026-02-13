import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: { session: { userId: sessionData.user.id } },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("List conversations error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const title = body.title || "New Chat";

        const conversation = await prisma.conversation.create({
            data: {
                sessionId: sessionData.session.id,
                title,
            },
        });

        return NextResponse.json({ conversation }, { status: 201 });
    } catch (error) {
        console.error("Create conversation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
