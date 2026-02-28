import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";

const feedbackSchema = z.object({
    messageId: z.string(),
    content: z.string().min(1, "Feedback cannot be empty"),
});

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = feedbackSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid feedback data" },
                { status: 400 }
            );
        }

        const { messageId, content } = parsed.data;

        // Verify the message exists and belongs to a conversation in the user's session
        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
                conversation: {
                    session: { userId: sessionData.user.id },
                },
            },
        });

        if (!message) {
            return NextResponse.json(
                { error: "Message not found" },
                { status: 404 }
            );
        }

        const feedback = await prisma.feedback.create({
            data: {
                messageId,
                sessionId: sessionData.session.id,
                content,
            },
        });

        return NextResponse.json({ success: true, feedbackId: feedback.id });
    } catch (error) {
        console.error("Feedback error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
