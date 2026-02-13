import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return null;

    const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!session) return null;
    if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } });
        return null;
    }

    return {
        user: session.user,
        session,
    };
}

export async function createSession(userId: string) {
    const { v4: uuidv4 } = await import("uuid");
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await prisma.session.create({
        data: {
            userId,
            token,
            expiresAt,
        },
    });

    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });

    return session;
}
