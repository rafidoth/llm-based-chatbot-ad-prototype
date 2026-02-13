import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: conversationId } = await params;

        // Verify the conversation belongs to the user's session
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                session: { userId: sessionData.user.id },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                role: true,
                content: true,
                adMode: true,
                adProductName: true,
                adCategory: true,
                adProductUrl: true,
                adProductDesc: true,
                createdAt: true,
            },
        });

        // Transform messages to match the ChatMessage interface
        const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            adMode: msg.adMode,
            adData:
                msg.adProductName
                    ? {
                        messageId: msg.id,
                        adMode: msg.adMode,
                        product: {
                            name: msg.adProductName,
                            url: msg.adProductUrl || "",
                            desc: msg.adProductDesc || "",
                            category: msg.adCategory || "",
                        },
                    }
                    : null,
        }));

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error("Load messages error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
