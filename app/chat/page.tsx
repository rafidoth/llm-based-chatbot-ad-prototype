import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ChatLayout } from "@/components/chat/ChatLayout";

export default async function ChatPage() {
    const sessionData = await getSession();

    if (!sessionData) {
        redirect("/login");
    }

    return (
        <ChatLayout
            user={{
                id: sessionData.user.id,
                name: sessionData.user.name,
                email: sessionData.user.email,
            }}
            sessionId={sessionData.session.id}
        />
    );
}
