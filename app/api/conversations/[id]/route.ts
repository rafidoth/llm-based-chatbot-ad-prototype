import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: conversationId } = await params;
        const body = await req.json().catch(() => ({}));
        const { rightAdPanel } = body;

        if (typeof rightAdPanel !== "boolean") {
            return NextResponse.json(
                { error: "rightAdPanel must be boolean" },
                { status: 400 }
            );
        }

        const existingConversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                session: { userId: sessionData.user.id },
            },
            select: { id: true },
        });

        if (!existingConversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        const conversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: { rightAdPanel },
            select: {
                id: true,
                rightAdPanel: true,
            },
        });

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error("Update conversation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
