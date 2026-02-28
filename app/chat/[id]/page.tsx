import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ChatLayout } from "@/components/chat/ChatLayout";

export default async function ChatConversationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const sessionData = await getSession();

    if (!sessionData) {
        redirect("/login");
    }

    const { id } = await params;

    return (
        <ChatLayout
            user={{
                id: sessionData.user.id,
                name: sessionData.user.name,
                email: sessionData.user.email,
            }}
            sessionId={sessionData.session.id}
            conversationId={id}
        />
    );
}
