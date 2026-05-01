import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatLayout } from "@/components/chat/ChatLayout";

interface ChatRouteLayoutProps {
    children: ReactNode;
}

export default async function ChatRouteLayout({ children }: ChatRouteLayoutProps) {
    const sessionData = await getSession();

    if (!sessionData) {
        redirect("/login");
    }

    const conversations = await prisma.conversation.findMany({
        where: { session: { userId: sessionData.user.id } },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            rightAdPanel: true,
            createdAt: true,
        },
    });

    return (
        <>
            <ChatLayout
                user={{
                    id: sessionData.user.id,
                    name: sessionData.user.name,
                    email: sessionData.user.email,
                }}
                sessionId={sessionData.session.id}
                initialConversations={conversations.map((conversation) => ({
                    ...conversation,
                    createdAt: conversation.createdAt.toISOString(),
                }))}
            />
            {children}
        </>
    );
}
