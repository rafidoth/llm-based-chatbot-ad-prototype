import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_AD_TURN_MODES = ["randomized", "ordered", "only-in-resp", "only-out-resp"];

export async function GET() {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: sessionData.user.id },
            select: { name: true, email: true, adTurnMode: true, adCardVariants: true },
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return Response.json({ user });
    } catch (error) {
        console.error("Get preferences error:", error);
        return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();
        const { adTurnMode, adCardVariants } = body;

        if (adTurnMode && !VALID_AD_TURN_MODES.includes(adTurnMode)) {
            return new Response(
                JSON.stringify({ error: "Invalid ad turn mode" }),
                { status: 400 }
            );
        }

        // Validate adCardVariants: must be an array of strings if provided
        if (adCardVariants !== undefined && !Array.isArray(adCardVariants)) {
            return new Response(
                JSON.stringify({ error: "adCardVariants must be an array" }),
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: sessionData.user.id },
            data: {
                ...(adTurnMode && { adTurnMode }),
                ...(adCardVariants !== undefined && {
                    adCardVariants: JSON.stringify(adCardVariants),
                }),
            },
            select: { name: true, email: true, adTurnMode: true, adCardVariants: true },
        });

        return Response.json({ user: updatedUser });
    } catch (error) {
        console.error("Update preferences error:", error);
        return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
    }
}
