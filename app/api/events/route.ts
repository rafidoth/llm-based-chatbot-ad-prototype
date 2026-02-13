import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";

const eventSchema = z.object({
    sessionId: z.string(),
    messageId: z.string(),
    adMode: z.string(),
    eventType: z.enum([
        "impression",
        "first_interaction",
        "click",
        "mouseover_start",
        "mouseover_end",
        "dismiss",
    ]),
    durationMs: z.number().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

const batchSchema = z.object({
    events: z.array(eventSchema),
});

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = batchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid event data" },
                { status: 400 }
            );
        }

        const { events } = parsed.data;

        if (events.length > 0) {
            await prisma.adEvent.createMany({
                data: events.map((event) => ({
                    sessionId: event.sessionId,
                    messageId: event.messageId,
                    adMode: event.adMode,
                    eventType: event.eventType,
                    durationMs: event.durationMs,
                    metadata: (event.metadata as Record<string, string | number | boolean>) || undefined,
                })),
            });
        }

        return NextResponse.json({ success: true, count: events.length });
    } catch (error) {
        console.error("Events error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
